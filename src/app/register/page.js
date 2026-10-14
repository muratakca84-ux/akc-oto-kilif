"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  setPersistence,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureCustomerProfile, isActiveAdmin } from "@/lib/customer-profile";
import { signInWithGoogle } from "@/lib/google-auth";
import { onlyDigits } from "@/lib/site-config";
import AuthShell from "@/components/AuthShell";
import GoogleMark from "@/components/GoogleMark";

const ERRORS = {
  "auth/email-already-in-use": "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin.",
  "auth/invalid-email": "Geçerli bir e-posta adresi girin.",
  "auth/weak-password": "Şifre en az 6 karakter olmalı.",
  "auth/network-request-failed": "İnternet bağlantısı kurulamadı.",
  "auth/unauthorized-domain": "Bu alan adı Google girişi için yetkilendirilmemiş.",
};

function errorText(error) {
  return ERRORS[error?.code] || "Üyelik oluşturulamadı. Lütfen tekrar deneyin.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", accept: false });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let alive = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!alive || !result?.user) return;
        setBusy(true);
        try {
          await ensureCustomerProfile(result.user, { provider: "google" });
        } catch {
          // profil senkronu başarısız olsa da hesap oluşturuldu
        }
        router.replace("/profil");
      })
      .catch((error) => alive && setNotice({ type: "error", text: errorText(error) }));
    return () => {
      alive = false;
    };
  }, [router]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email || !form.password) {
      setNotice({ type: "error", text: "Ad soyad, e-posta ve şifre alanları zorunludur." });
      return;
    }
    if (phone && onlyDigits(phone).length < 10) {
      setNotice({ type: "error", text: "Telefon numarasını kontrol edin." });
      return;
    }
    if (form.password.length < 6) {
      setNotice({ type: "error", text: "Şifre en az 6 karakter olmalı." });
      return;
    }
    if (!form.accept) {
      setNotice({ type: "error", text: "Devam etmek için KVKK aydınlatma metnini onaylayın." });
      return;
    }

    setBusy(true);
    setNotice({ type: "", text: "" });

    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, form.password);
      await updateProfile(result.user, { displayName: name });
      try {
        await ensureCustomerProfile(result.user, { provider: "email", displayName: name, phoneNumber: phone });
      } catch {
        // hesap oluştu; profil belgesi sonraki girişte tamamlanır
      }
      router.replace("/profil");
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const user = await signInWithGoogle();
      if (user) {
        try {
          await ensureCustomerProfile(user, { provider: "google" });
        } catch {
          // profil senkronu başarısız olsa da hesap oluşturuldu
        }
        router.replace((await isActiveAdmin(user)) ? "/admin" : "/profil");
        return;
      }
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
    }
    setBusy(false);
  }

  return (
    <AuthShell
      title="Hesap oluşturun"
      subtitle="Birkaç bilgiyle müşteri hesabınızı açın."
      aside={{
        title: "Teklif süreçlerinizi kolayca takip edin.",
        points: ["Taleplerinizin durumunu görün", "Bilgileriniz her seferinde hazır", "Kişisel verileriniz korunur"],
      }}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Ad Soyad</span>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required />
        </label>
        <label className="field">
          <span>Telefon</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="05xx xxx xx xx"
            autoComplete="tel"
          />
        </label>
        <label className="field">
          <span>E-posta</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="field">
          <span>Şifre</span>
          <span className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="En az 6 karakter"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="input-addon"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? "Gizle" : "Göster"}
            </button>
          </span>
        </label>

        <label className="check">
          <input type="checkbox" checked={form.accept} onChange={(e) => update("accept", e.target.checked)} />
          <span>
            <Link href="/kvkk" target="_blank">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum; bilgilerimin teklif ve iletişim süreçleri için işlenmesini kabul ediyorum.
          </span>
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Lütfen bekleyin…" : "Hesap oluştur"}
        </button>
      </form>

      <div className="divider">
        <span>veya</span>
      </div>

      <button className="btn btn-outline btn-block" type="button" onClick={handleGoogle} disabled={busy}>
        <GoogleMark /> Google ile devam et
      </button>

      {notice.text ? (
        <p className={`form-status form-status--${notice.type}`} role="status" aria-live="polite">
          {notice.text}
        </p>
      ) : null}

      <p className="auth-switch">
        Zaten hesabınız var mı? <Link href="/login">Giriş yapın</Link>
      </p>
    </AuthShell>
  );
}
