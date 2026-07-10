"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Giriş yaparak AKC yönetim paneline geçebilirsiniz.");

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const adminSnap = await getDoc(doc(db, "admins", user.uid));
      if (adminSnap.exists()) {
        router.replace("/admin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function assertAdmin(user) {
    const adminSnap = await getDoc(doc(db, "admins", user.uid));
    if (!adminSnap.exists()) {
      throw new Error(
        "Bu kullanıcı admin listesinde yok. Firebase Console > Firestore > admins koleksiyonuna kullanıcının UID değerini doküman ID olarak ekleyin."
      );
    }
  }

  async function handleEmailLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("Giriş kontrol ediliyor...");

    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await assertAdmin(result.user);
      router.replace("/admin");
    } catch (error) {
      setMessage(error.message || "Giriş yapılamadı. Bilgileri kontrol edin.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setBusy(true);
    setMessage("Google hesabı kontrol ediliyor...");

    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      await assertAdmin(result.user);
      router.replace("/admin");
    } catch (error) {
      setMessage(error.message || "Google ile giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="auth-brand" href="/">
          <span>AKC</span>
          <strong>Oto Kılıf Admin</strong>
        </a>

        <div className="auth-copy">
          <p className="eyebrow">Güvenli Yönetim Girişi</p>
          <h1>Panel kapısı burada, anahtar doğru kişide olmalı.</h1>
          <p>
            Ürünler, galeri, iletişim bilgileri ve müşteri talepleri bu panelden
            yönetilir. Yetkisiz kullanıcılar admin ekranına alınmaz.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleEmailLogin}>
          <label>
            E-posta
            <input
              type="email"
              value={email}
              placeholder="admin@akcotokilif.com"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="admin-primary-btn" type="submit" disabled={busy}>
            {busy ? "Kontrol ediliyor..." : "E-posta ile giriş yap"}
          </button>
        </form>

        <button className="admin-secondary-btn full" onClick={handleGoogleLogin} disabled={busy}>
          Google ile giriş yap
        </button>

        <p className="auth-message">{message}</p>

        <div className="auth-note">
          <strong>İlk kurulum notu:</strong>
          <span>
            Önce Firebase Authentication üzerinden kullanıcı oluşturun. Sonra Firestore
            içinde <code>admins</code> koleksiyonuna kullanıcı UID değerini doküman ID
            olarak ekleyin.
          </span>
        </div>
      </section>
    </main>
  );
}
