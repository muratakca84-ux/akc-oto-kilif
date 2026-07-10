import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function checkIsAdmin(user) {
  if (!user?.uid) {
    return false;
  }

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  return adminSnap.exists();
}

export async function getAdminProfile(user) {
  if (!user?.uid) {
    return null;
  }

  const adminRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    ...adminSnap.data(),
  };
}