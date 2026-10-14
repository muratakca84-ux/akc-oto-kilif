import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Aktif admin mi? (Panel ile aynı kural: kayıt var ve isActive false değil.) */
export async function isActiveAdmin(user) {
  if (!user?.uid) return false;
  try {
    const snap = await getDoc(doc(db, "admins", user.uid));
    return snap.exists() && snap.data()?.isActive !== false;
  } catch {
    return false;
  }
}

/**
 * Müşteri profilini oluşturur veya günceller.
 * Var olan dolu alanlar (ad, telefon) boş değerlerle asla ezilmez.
 */
export async function ensureCustomerProfile(user, { provider = "", displayName = "", phoneNumber = "" } = {}) {
  if (!user?.uid) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};

  const payload = {
    uid: user.uid,
    email: user.email || existing.email || "",
    displayName: existing.displayName || displayName || user.displayName || "",
    phoneNumber: existing.phoneNumber || phoneNumber || user.phoneNumber || "",
    photoURL: user.photoURL || existing.photoURL || "",
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...payload,
      role: "customer",
      provider: provider || "email",
      isActive: true,
      createdAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(ref, payload, { merge: true });
}
