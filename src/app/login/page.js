"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSessionPersistence,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const CUSTOMER_AFTER_LOGIN = "/profil";
const ADMIN_AFTER_LOGIN = "/admin";

function getLoginErrorMessage(error) {
  const messages = {
    "auth/invalid-credential": "E-posta veya şifre eşleşmiyor. Şifrenizi unuttuysanız aşağıdan yenileyebilirsiniz.",
    "auth/invalid-email": "Geçerli bir e-posta adresi girin.",
    "auth/user-disabled": "Bu hesap devre dışı bırakılmış. Destek ekibimizle iletişime geçin.",
    "auth/too-many-requests": "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin veya şifrenizi yenileyin.",
    "auth/network-request-failed": "İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.",
  };

  return messages[error?.code] || "Giriş şu anda tamamlanamadı. Lütfen tekrar deneyin.";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(
    "Hesabınıza giriş yapın. Admin yetkiniz varsa yönetim paneline yönlendirilirsiniz."
  );

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);
const routedRef = useRef(false);
  const getAdminStatus = useCallback(async (user) => {
    if (!user?.uid) return false;

    try {
      const adminSnap = await getDoc(doc(db, "admins", user.uid));

      if (!adminSnap.exists()) return false;

      const adminData = adminSnap.data();

      return adminData?.isActive === true;
    } catch (error) {
      console.warn("Admin yetkisi okunamadı; müşteri oturumu kullanılacak.", error);
      return false;
    }
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

    try {
      await ensureCustomerProfile(user, provider);
    } catch (error) {
      // Authentication is already successful. A Firestore profile/rules problem
      // must never make a valid password look invalid to the customer.
      console.warn("Müşteri profili senkronize edilemedi.", error);
    }
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
      setMessage(getLoginErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset() {
    if (busy || checking) return;

    if (!cleanEmail) {
      setMessage("Şifre yenileme bağlantısı için önce e-posta adresinizi yazın.");
      return;
    }

    setBusy(true);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setMessage("Şifre yenileme bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.");
    } catch (error) {
      setMessage(getLoginErrorMessage(error));
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
      <div className="auth-grid" aria-hidden="true" />

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
            <p className="eyebrow"><span /> AKC Müşteri Portalı</p>

            <h1>
              Aracınız için başlayan süreci
              <span>tek merkezden yönetin.</span>
            </h1>

            <p>
              Tekliflerinize, kayıtlı araçlarınıza ve hizmet geçmişinize güvenli
              biçimde erişin. Yetkili hesaplar otomatik olarak yönetim alanına alınır.
            </p>

            <div className="auth-highlight-row" aria-label="Öne çıkan avantajlar">
              <span className="auth-highlight-pill"><b>01</b> Güvenli erişim</span>
              <span className="auth-highlight-pill"><b>02</b> Süreç takibi</span>
              <span className="auth-highlight-pill"><b>03</b> Yetki kontrolü</span>
            </div>

            <div className="auth-benefits">
              <p><span>✓</span> Kurumsal veri güvenliği standartları</p>
              <p><span>✓</span> Müşteri ve yetkili hesap ayrımı</p>
              <p><span>✓</span> Tüm cihazlarda kesintisiz erişim</p>
            </div>
          </div>

          <div className="auth-form-card">
            <div className="auth-form-intro">
              <small>GÜVENLİ OTURUM</small>
              <strong>Tekrar hoş geldiniz</strong>
              <span>Hesabınıza erişmek için bilgilerinizi girin.</span>
            </div>

            <form className="auth-form" onSubmit={handleEmailLogin}>
              <label>
                <span>E-posta</span>
                <span className="auth-input-shell">
                  <i className="auth-field-icon" aria-hidden="true">@</i>
                  <input type="email" value={email} placeholder="ornek@kurum.com"
                    onChange={(event) => setEmail(event.target.value)} autoComplete="email"
                    disabled={isDisabled} required />
                </span>
              </label>

              <label>
                <span>Şifre</span>
                <span className="auth-input-shell">
                  <i className="auth-field-icon" aria-hidden="true">●</i>
                  <input type={showPassword ? "text" : "password"} value={password}
                    placeholder="••••••••" onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password" disabled={isDisabled} required />
                  <button className="auth-password-toggle" type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}>
                    {showPassword ? "Gizle" : "Göster"}
                  </button>
                </span>
              </label>

              <button className="auth-primary-btn" type="submit" disabled={isDisabled}>
                {busy ? "Kontrol ediliyor..." : <>Güvenli giriş <span>→</span></>}
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
              <button type="button" onClick={handlePasswordReset} disabled={isDisabled}>
                Şifremi unuttum
              </button>
            </div>

            <p className="auth-message" role="status" aria-live="polite">{message}</p>

            <button className="auth-ghost-btn" type="button" onClick={handleLogout}>
              Oturumu kapat
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
