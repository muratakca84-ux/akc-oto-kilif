"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSessionPersistence,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithGoogle } from "@/lib/google-auth";
import { ensureCustomerProfile, isActiveAdmin } from "@/lib/customer-profile";
import AuthShell from "@/components/AuthShell";
import GoogleMark from "@/components/GoogleMark";

const ERRORS = {
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/wrong-password": "E-posta veya şifre hatalı.",
  "auth/user-not-found": "E-posta veya şifre hatalı.",
  "auth/invalid-email": "Geçerli bir e-posta adresi girin.",
  "auth/user-disabled": "Bu hesap devre dışı bırakılmış.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.",
  "auth/network-request-failed": "İnternet bağlantısı kurulamadı.",
  "auth/missing-email": "Önce e-posta adresinizi yazın.",
  "auth/unauthorized-domain": "Bu alan adı Google girişi için yetkilendirilmemiş.",
  "auth/account-exists-with-different-credential": "Bu e-posta başka bir giriş yöntemiyle kayıtlı. E-posta ve şifreyle giriş yapın.",
};

function errorText(error) {
  return ERRORS[error?.code] || "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
}

export default function LoginPage() {
  const router = useRouter();
  const routedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const routeAfterLogin = useCallback(
    async (user, provider) => {
      if (routedRef.current) return;
      routedRef.current = true;

      if (await isActiveAdmin(user)) {
        router.replace("/admin");
        return;
      }

      try {
        await ensureCustomerProfile(user, { provider });
      } catch {
        // Giriş başarılı; profil senkronu başarısız olsa bile kullanıcı yönlendirilir.
      }
      router.replace("/profil");
    },
    [router]
  );

  useEffect(() => {
    let alive = true;

    getRedirectResult(auth)
      .then((result) => {
        if (alive && result?.user) return routeAfterLogin(result.user, "google");
        return undefined;
      })
      .catch((error) => {
        if (!alive) return;
        routedRef.current = false;
        setNotice({ type: "error", text: errorText(error) });
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;
      if (!user) {
        setBusy(false);
        return;
      }
      setNotice({ type: "info", text: "Oturum bulundu, yönlendiriliyorsunuz…" });
      await routeAfterLogin(user, user.providerData?.[0]?.providerId === "google.com" ? "google" : "email");
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [routeAfterLogin]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setNotice({ type: "error", text: "E-posta ve şifre alanlarını doldurun." });
      return;
    }

    setBusy(true);
    setNotice({ type: "", text: "" });

    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await routeAfterLogin(result.user, "email");
    } catch (error) {
      routedRef.current = false;
      setNotice({ type: "error", text: errorText(error) });
      setBusy(false);
    }
  }

  async function handleReset() {
    if (busy) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setNotice({ type: "error", text: "Şifre yenileme bağlantısı için önce e-posta adresinizi yazın." });
      return;
    }

    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setNotice({
        type: "success",
        text: "Şifre yenileme bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.",
      });
    } catch (error) {
      setNotice({ type: "error", text: errorText(error) });
    } finally {
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
        await routeAfterLogin(user, "google");
        return;
      }
    } catch (error) {
      routedRef.current = false;
      setNotice({ type: "error", text: errorText(error) });
    }
    setBusy(false);
  }

  return (
    <AuthShell
      title="Giriş yapın"
      subtitle="Hesabınıza erişmek için bilgilerinizi girin."
      aside={{
        title: "Tekliflerinizi ve taleplerinizi tek yerden takip edin.",
        points: ["Teklif ve talep geçmişi", "Güvenli müşteri hesabı", "Yetkili hesaplar için yönetim paneli"],
      }}
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>E-posta</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span className="field-row">
            Şifre
            <button type="button" className="link-btn" onClick={handleReset} disabled={busy}>
              Şifremi unuttum
            </button>
          </span>
          <span className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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

        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Lütfen bekleyin…" : "Giriş yap"}
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
        Hesabınız yok mu? <Link href="/register">Üye olun</Link>
      </p>
    </AuthShell>
  );
}
