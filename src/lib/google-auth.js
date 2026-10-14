import {
  browserSessionPersistence,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const POPUP_FALLBACK = new Set(["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"]);
const SILENT = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

/**
 * Google ile giriş. Site alan adı (akcotokilif.com) ile Firebase authDomain
 * (firebaseapp.com) farklı olduğundan, yönlendirme akışı üçüncü taraf depolamayı
 * engelleyen tarayıcılarda (Chrome, Safari) sonuç döndürmez. Bu yüzden önce
 * açılır pencere denenir; engellenirse yönlendirmeye düşülür.
 * Dönüş: kullanıcı | null (pencere kapatıldıysa veya yönlendirme başladıysa).
 */
export async function signInWithGoogle() {
  await setPersistence(auth, browserSessionPersistence);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (SILENT.has(error?.code)) return null;
    if (POPUP_FALLBACK.has(error?.code)) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}
