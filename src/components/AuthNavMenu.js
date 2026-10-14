"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Icon from "@/components/Icon";

export default function AuthNavMenu() {
  const [state, setState] = useState({ loading: true, user: null, name: "" });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ loading: false, user: null, name: "" });
        return;
      }

      let name = user.displayName || "";
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data()?.displayName) name = snap.data().displayName;
      } catch {
        // profil okunamazsa auth bilgisiyle devam edilir
      }
      setState({ loading: false, user, name: name || user.email || "Hesabım" });
    });
  }, []);

  if (state.loading) {
    return <span className="nav-account nav-account--placeholder" aria-hidden="true" />;
  }

  if (!state.user) {
    return (
      <Link className="nav-account" href="/login">
        <Icon name="user" size={18} />
        <span>Giriş</span>
      </Link>
    );
  }

  const firstName = String(state.name).split(/[\s@]/)[0];

  return (
    <div className="nav-account-group">
      <Link className="nav-account" href="/profil" title={state.name}>
        <span className="nav-avatar">{firstName.charAt(0).toUpperCase()}</span>
        <span>{firstName}</span>
      </Link>
      <button
        type="button"
        className="nav-icon-btn"
        onClick={() => signOut(auth)}
        aria-label="Çıkış yap"
        title="Çıkış yap"
      >
        <Icon name="logout" size={18} />
      </button>
    </div>
  );
}
