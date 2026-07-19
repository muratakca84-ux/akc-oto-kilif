"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const CUSTOMER_AFTER_LOGIN = "/profil";
const ADMIN_AFTER_LOGIN = "/admin";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(
    "Hesabınıza giriş yapın. Admin yetkiniz varsa yönetim paneline yönlendirilirsiniz."
  );

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);
const routedRef = useRef(false);
  const getAdminStatus = useCallback(async (user) => {
    if (!user?.uid) return false;

    const adminSnap = await getDoc(doc(db, "admins", user.uid));

    if (!adminSnap.exists()) return false;

    const adminData = adminSnap.data();

    return adminData?.isActive === true;
  }, []);

  const ensureCustomerProfile = useCallback(async (user, provider = "email") => {
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
  }, []);

const routeAfterLogin = useCallback(
  async (user, provider = "email") => {
    if (routedRef.current) return;
    routedRef.current = true;

    const isAdmin = await getAdminStatus(user);

    if (isAdmin) {
      setMessage("Admin yetkisi doğrulandı. Yönetim paneline yönlendiriliyorsunuz...");
      router.replace(ADMIN_AFTER_LOGIN);
      return;
    }

    await ensureCustomerProfile(user, provider);
    setMessage("Giriş başarılı. Profil sayfanıza yönlendiriliyorsunuz...");
    router.replace(CUSTOMER_AFTER_LOGIN);
  },
  [ensureCustomerProfile, getAdminStatus, router]
);

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
        routedRef.current = false;
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
  }, [routeAfterLogin]);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (routedRef.current) return;

    setChecking(true);

    try {
      if (!user) {
        setChecking(false);
        return;
      }

      setMessage("Mevcut oturum bulundu. Yetki kontrol ediliyor...");
      await routeAfterLogin(user, "session");
    } catch (error) {
      routedRef.current = false;
      setMessage(error?.message || "Oturum kontrolü yapılamadı.");
    } finally {
      setChecking(false);
    }
  });

  return () => unsubscribe();
}, [routeAfterLogin]);

  async function handleEmailLogin(event) {
    event.preventDefault();

    if (busy || checking) return;

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
      routedRef.current = false;
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
    if (busy || checking) return;

    // Defer redirect slightly to reduce chance of DOM commit collisions
    setTimeout(async () => {
      setBusy(true);
      setMessage("Google giriş sayfasına yönlendiriliyorsunuz...");

      try {
        await setPersistence(auth, browserSessionPersistence);
        await signInWithRedirect(auth, googleProvider);
      } catch (error) {
        routedRef.current = false;
        setMessage(error?.message || "Google ile giriş başlatılamadı.");
        setBusy(false);
      }
    }, 50);
  }

  async function handleLogout() {
    if (busy || checking) return;

    setBusy(true);
    setMessage("Oturum kapatılıyor...");

    try {
      await signOut(auth);
      setMessage("Oturum kapatıldı.");
    } catch (error) {
      routedRef.current = false;
      setMessage(error?.message || "Oturum kapatılamadı.");
    } finally {
      setBusy(false);
    }
  }

  const isDisabled = busy || checking;

  return (
    <main className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-one" />
      <div className="auth-bg-orb auth-bg-orb-two" />

      <section className="auth-card auth-card-wide">
        <div className="auth-card-glow" />

        <div className="auth-header">
          <Link className="auth-brand" href="/" aria-label="AKC Oto Kılıf Ana Sayfa">
            <span className="auth-logo"><Image src="/images/akc-logo-square.png" alt="" width={58} height={58} /></span>

            <span className="auth-brand-text">
              <strong>AKC Oto Kılıf</strong>
              <small>Müşteri girişi • Yetkili panel</small>
            </span>
          </Link>

          <Link className="auth-home-link" href="/">
            Siteye dön
          </Link>
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

            <div className="auth-highlight-row" aria-label="Öne çıkan avantajlar">
              <span className="auth-highlight-pill">⚡ Hızlı erişim</span>
              <span className="auth-highlight-pill">🔐 Güvenli giriş</span>
              <span className="auth-highlight-pill">🧭 Otomatik yönlendirme</span>
            </div>

            <div className="auth-benefits">
              <p>✓ Müşteri hesabı ile hızlı teklif süreci</p>
              <p>✓ Admin yetkisi varsa otomatik panel yönlendirmesi</p>
              <p>✓ Mobil uyumlu Google giriş sistemi</p>
            </div>
          </div>

          <div className="auth-form-card">
            <div className="auth-form-intro">
              <strong>Hesap erişimi</strong>
              <span>E-posta veya Google ile anında devam edin.</span>
            </div>

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
              <Link href="/register">Üye ol</Link>
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
