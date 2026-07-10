"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSessionPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const CUSTOMER_AFTER_LOGIN = "/";
const ADMIN_AFTER_LOGIN = "/admin";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState(
    "Hesabınıza giriş yapın. Admin yetkiniz varsa yönetim paneline yönlendirilirsiniz."
  );

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  async function getAdminStatus(user) {
    if (!user?.uid) return false;

    const adminSnap = await getDoc(doc(db, "admins", user.uid));

    if (!adminSnap.exists()) return false;

    const adminData = adminSnap.data();

   return adminData?.isActive === true;
  }

  async function ensureCustomerProfile(user, provider = "email") {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const payload = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      phoneNumber: user.phoneNumber || "",
      photoURL: user.photoURL || "",
      role: "customer",
      provider,
      isActive: true,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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

  async function routeAfterLogin(user, provider = "email") {
    const isAdmin = await getAdminStatus(user);

    if (isAdmin) {
      setMessage("Admin yetkisi doğrulandı. Yönetim paneline yönlendiriliyorsunuz...");
      router.replace(ADMIN_AFTER_LOGIN);
      return;
    }

    await ensureCustomerProfile(user, provider);
    setMessage("Giriş başarılı. Ana sayfaya yönlendiriliyorsunuz...");
    router.replace(CUSTOMER_AFTER_LOGIN);
  }

  useEffect(() => {
    let alive = true;

    async function completeGoogleRedirect() {
      try {
        const result = await getRedirectResult(auth);

        if (!alive) return;

        if (result?.user) {
          setBusy(true);
          setMessage("Google girişi tamamlandı. Hesap kontrol ediliyor...");
          await routeAfterLogin(result.user, "google");
        }
      } catch (error) {
        if (!alive) return;
        setMessage(error?.message || "Google giriş dönüşü kontrol edilemedi.");
      } finally {
        if (alive) {
          setBusy(false);
          setChecking(false);
        }
      }
    }

    completeGoogleRedirect();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setChecking(true);

      try {
        if (!user) {
          setChecking(false);
          return;
        }

        setMessage("Mevcut oturum bulundu. Yetki kontrol ediliyor...");
        await routeAfterLogin(user, "session");
      } catch (error) {
        setMessage(error?.message || "Oturum kontrolü yapılamadı.");
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleEmailLogin(event) {
    event.preventDefault();

    if (!cleanEmail || !password) {
      setMessage("E-posta ve şifre alanlarını doldurun.");
      return;
    }

    setBusy(true);
    setMessage("E-posta ve şifre kontrol ediliyor...");

    try {
      await setPersistence(auth, browserSessionPersistence);

      const result = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await routeAfterLogin(result.user, "email");
    } catch (error) {
      setMessage(
        error?.code === "auth/invalid-credential"
          ? "E-posta veya şifre hatalı. Bilgileri kontrol edin."
          : error?.message || "Giriş yapılamadı. Bilgileri kontrol edin."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setBusy(true);
    setMessage("Google giriş sayfasına yönlendiriliyorsunuz...");

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setMessage(error?.message || "Google ile giriş başlatılamadı.");
      setBusy(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setMessage("Oturum kapatıldı.");
  }

  const isDisabled = busy || checking;

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
              <small>Müşteri girişi • Yetkili panel</small>
            </span>
          </a>

          <a className="auth-home-link" href="/">
            Siteye dön
          </a>
        </div>

        <div className="auth-layout">
          <div className="auth-copy">
            <p className="eyebrow">Giriş Merkezi</p>

            <h1>
              Hesabınıza giriş yapın,
              <span>doğru alana yönlenin.</span>
            </h1>

            <p>
              Müşteriler teklif ve işlem takibi için giriş yapabilir. Yetkili
              kullanıcılar ise aynı ekrandan admin paneline güvenli şekilde
              yönlendirilir.
            </p>

            <div className="auth-benefits">
              <p>✓ Müşteri hesabı ile hızlı teklif süreci</p>
              <p>✓ Admin yetkisi varsa otomatik panel yönlendirmesi</p>
              <p>✓ Mobil uyumlu Google giriş sistemi</p>
            </div>
          </div>

          <div className="auth-form-card">
            <form className="auth-form" onSubmit={handleEmailLogin}>
              <label>
                <span>E-posta</span>
                <input
                  type="email"
                  value={email}
                  placeholder="ornek@mail.com"
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  disabled={isDisabled}
                  required
                />
              </label>

              <label>
                <span>Şifre</span>
                <input
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={isDisabled}
                  required
                />
              </label>

              <button className="auth-primary-btn" type="submit" disabled={isDisabled}>
                {busy ? "Kontrol ediliyor..." : "Giriş yap"}
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
              onClick={handleGoogleLogin}
              disabled={isDisabled}
            >
              <span>G</span>
              Google ile giriş yap
            </button>

            <div className="auth-actions-row">
              <a href="/register">Üye ol</a>
              <a href="mailto:info@akcotokilif.com">Destek al</a>
            </div>

            <p className="auth-message">{message}</p>

            <button className="auth-ghost-btn" type="button" onClick={handleLogout}>
              Oturumu kapat
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}