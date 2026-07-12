"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AuthNavMenu() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "users", currentUser.uid));
        setProfile(profileSnap.exists() ? profileSnap.data() : null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <span className="nav-auth-pill">Yükleniyor…</span>;
  }

  if (!user) {
    return (
      <div className="nav-auth-links">
        <Link href="/login">Giriş</Link>
        <Link href="/register">Üye Ol</Link>
      </div>
    );
  }

  const displayName = profile?.displayName || user?.displayName || user?.email || "Profil";
  const initials = String(displayName).trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="nav-auth-links nav-auth-links--user">
      <Link className="nav-profile-link" href="/profil">
        <span className="nav-profile-avatar">{initials}</span>
        <span className="nav-profile-copy">
          <strong>{displayName}</strong>
          <small>{profile?.role === "admin" ? "Yönetici" : "Profilim"}</small>
        </span>
      </Link>

      <button type="button" className="nav-logout-btn" onClick={() => signOut(auth)}>
        Çıkış
      </button>
    </div>
  );
}
