"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const CUSTOMER_AFTER_REGISTER = "/profil";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "AKC Oto Kılıf hesabınızı oluşturun. Admin yetkisi bu ekrandan verilmez."
  );

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const cleanName = useMemo(() => fullName.trim(), [fullName]);
  const cleanPhone = useMemo(() => phone.trim(), [phone]);

  const createCustomerProfile = useCallback(async (user, provider = "email") => {
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
  }, [cleanEmail, cleanName, cleanPhone]);

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
  }, [createCustomerProfile, router]);

  async function handleRegister(event) {
    event.preventDefault();

    if (busy) return;

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
    if (busy) return;

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
      <div className="auth-grid" aria-hidden="true" />

      <section className="auth-card auth-card-wide">
        <div className="auth-card-glow" />

        <div className="auth-header">
          <Link className="auth-brand" href="/" aria-label="AKC Oto Kılıf Ana Sayfa">
            <span className="auth-logo"><Image src="/images/akc-logo-square.png" alt="" width={58} height={58} /></span>

            <span className="auth-brand-text">
              <strong>AKC Oto Kılıf</strong>
              <small>Müşteri üyeliği</small>
            </span>
          </Link>

          <Link className="auth-home-link" href="/login">
            Giriş yap
          </Link>
        </div>

        <div className="auth-layout">
          <div className="auth-copy">
            <p className="eyebrow"><span /> AKC Müşteri Portalı</p>

            <h1>
              Ayrıcalıklı hizmet deneyiminiz
              <span>burada başlıyor.</span>
            </h1>

            <p>
              Aracınıza özel teklifleri, hizmet kayıtlarını ve iletişim sürecini
              güvenli müşteri hesabınız üzerinden tek noktadan yönetin.
            </p>

            <div className="auth-highlight-row" aria-label="Öne çıkan avantajlar">
              <span className="auth-highlight-pill"><b>01</b> Hızlı üyelik</span>
              <span className="auth-highlight-pill"><b>02</b> Mobil erişim</span>
              <span className="auth-highlight-pill"><b>03</b> Güvenli profil</span>
            </div>

            <div className="auth-benefits">
              <p><span>✓</span> Size özel müşteri profili</p>
              <p><span>✓</span> Düzenli teklif ve hizmet geçmişi</p>
              <p><span>✓</span> Korunan kişisel veriler</p>
            </div>
          </div>

          <div className="auth-form-card">
            <div className="auth-form-intro">
              <small>YENİ MÜŞTERİ KAYDI</small>
              <strong>Hesabınızı oluşturun</strong>
              <span>Birkaç bilgiyle güvenli profilinizi tamamlayın.</span>
            </div>

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
                <span className="auth-input-shell"><input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="En az 6 karakter"
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={busy}
                  required
                /><button className="auth-password-toggle" type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}>
                  {showPassword ? "Gizle" : "Göster"}
                </button></span>
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
                {busy ? "Üyelik oluşturuluyor..." : <>Hesap oluştur <span>→</span></>}
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
              <Link href="/login">Zaten hesabım var</Link>
              <a href="mailto:info@akcotokilif.com">Destek al</a>
            </div>

            <p className="auth-message" role="status" aria-live="polite">{message}</p>

            <div className="auth-note">
              <strong>Güvenlik notu:</strong>
              <span>
                Hesabınız müşteri profili olarak oluşturulur. Yetkili erişimleri
                yalnızca AKC yönetimi tarafından tanımlanır.
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
