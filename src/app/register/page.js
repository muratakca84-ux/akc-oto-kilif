"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  setPersistence,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const CUSTOMER_AFTER_REGISTER = "/";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "AKC Oto Kılıf hesabınızı oluşturun. Admin yetkisi bu ekrandan verilmez."
  );

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const cleanName = useMemo(() => fullName.trim(), [fullName]);
  const cleanPhone = useMemo(() => phone.trim(), [phone]);

  async function createCustomerProfile(user, provider = "email") {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const payload = {
      uid: user.uid,
      email: user.email || cleanEmail,
      displayName: user.displayName || cleanName,
      phoneNumber: user.phoneNumber || cleanPhone,
      photoURL: user.photoURL || "",
      role: "customer",
      provider,
      isActive: true,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    if (userSnap.exists()) {
      await setDoc(userRef, payload, { merge: true });
      return;
    }

    await setDoc(userRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });
  }

  useEffect(() => {
    let alive = true;

    async function completeGoogleRegister() {
      try {
        const result = await getRedirectResult(auth);

        if (!alive) return;

        if (result?.user) {
          setBusy(true);
          setMessage("Google hesabı alındı. Üyelik profili oluşturuluyor...");
          await createCustomerProfile(result.user, "google");
          setMessage("Üyelik tamamlandı. Ana sayfaya yönlendiriliyorsunuz...");
          router.replace(CUSTOMER_AFTER_REGISTER);
        }
      } catch (error) {
        if (!alive) return;
        setMessage(error?.message || "Google üyelik dönüşü kontrol edilemedi.");
      } finally {
        if (alive) setBusy(false);
      }
    }

    completeGoogleRegister();

    return () => {
      alive = false;
    };
  }, []);

  async function handleRegister(event) {
    event.preventDefault();

    if (!cleanName || !cleanEmail || !password) {
      setMessage("Ad soyad, e-posta ve şifre alanları zorunludur.");
      return;
    }

    if (password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    if (!acceptTerms) {
      setMessage("Devam etmek için üyelik koşullarını kabul etmelisiniz.");
      return;
    }

    setBusy(true);
    setMessage("Hesap oluşturuluyor...");

    try {
      await setPersistence(auth, browserSessionPersistence);

      const result = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await updateProfile(result.user, {
        displayName: cleanName,
      });

      await createCustomerProfile(result.user, "email");

      setMessage("Üyelik başarıyla oluşturuldu. Ana sayfaya yönlendiriliyorsunuz...");
      router.replace(CUSTOMER_AFTER_REGISTER);
    } catch (error) {
      setMessage(
        error?.code === "auth/email-already-in-use"
          ? "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin."
          : error?.message || "Üyelik oluşturulamadı."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleRegister() {
    setBusy(true);
    setMessage("Google üyelik sayfasına yönlendiriliyorsunuz...");

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setMessage(error?.message || "Google ile üyelik başlatılamadı.");
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-one" />
      <div className="auth-bg-orb auth-bg-orb-two" />

      <section className="auth-card auth-card-wide">
        <div className="auth-card-glow" />

        <div className="auth-header">
          <a className="auth-brand" href="/" aria-label="AKC Oto Kılıf Ana Sayfa">
            <span className="auth-logo">AKC</span>

            <span className="auth-brand-text">
              <strong>AKC Oto Kılıf</strong>
              <small>Müşteri üyeliği</small>
            </span>
          </a>

          <a className="auth-home-link" href="/login">
            Giriş yap
          </a>
        </div>

        <div className="auth-layout">
          <div className="auth-copy">
            <p className="eyebrow">Yeni Üyelik</p>

            <h1>
              Teklif ve işlem süreci
              <span>daha düzenli ilerlesin.</span>
            </h1>

            <p>
              Üyelik oluşturarak AKC Oto Kılıf teklif sürecini daha düzenli
              takip edebilirsiniz. Bu üyelik müşteri hesabıdır; admin yetkisi
              yalnızca işletme tarafından verilir.
            </p>

            <div className="auth-benefits">
              <p>✓ Müşteri profili oluşturma</p>
              <p>✓ Teklif ve iletişim süreçleri için hazır altyapı</p>
              <p>✓ Google veya e-posta ile hızlı üyelik</p>
            </div>
          </div>

          <div className="auth-form-card">
            <form className="auth-form" onSubmit={handleRegister}>
              <label>
                <span>Ad Soyad</span>
                <input
                  type="text"
                  value={fullName}
                  placeholder="Ad Soyad"
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  disabled={busy}
                  required
                />
              </label>

              <label>
                <span>Telefon</span>
                <input
                  type="tel"
                  value={phone}
                  placeholder="+90 5xx xxx xx xx"
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  disabled={busy}
                />
              </label>

              <label>
                <span>E-posta</span>
                <input
                  type="email"
                  value={email}
                  placeholder="ornek@mail.com"
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={busy}
                  required
                />
              </label>

              <label>
                <span>Şifre</span>
                <input
                  type="password"
                  value={password}
                  placeholder="En az 6 karakter"
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                  required
                />
              </label>

              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  disabled={busy}
                />
                <span>
                  Üyelik bilgilerimin AKC Oto Kılıf iletişim ve teklif süreçleri
                  için kullanılmasını kabul ediyorum.
                </span>
              </label>

              <button className="auth-primary-btn" type="submit" disabled={busy}>
                {busy ? "Üyelik oluşturuluyor..." : "Üye ol"}
              </button>
            </form>

            <div className="auth-divider">
              <span />
              <strong>veya</strong>
              <span />
            </div>

            <button
              className="auth-google-btn"
              type="button"
              onClick={handleGoogleRegister}
              disabled={busy}
            >
              <span>G</span>
              Google ile üye ol
            </button>

            <div className="auth-actions-row">
              <a href="/login">Zaten hesabım var</a>
              <a href="mailto:info@akcotokilif.com">Destek al</a>
            </div>

            <p className="auth-message">{message}</p>

            <div className="auth-note">
              <strong>Güvenlik notu:</strong>
              <span>
                Bu sayfadan oluşturulan hesaplar müşteri hesabıdır. Admin
                yetkisi sadece Firestore <code>admins</code> koleksiyonu
                üzerinden işletme tarafından verilir.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}