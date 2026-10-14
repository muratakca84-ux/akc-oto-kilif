/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Firebase Auth yardımcısını kendi alan adımızdan sun (Google girişi yönlendirme akışı için).
      // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=akcotokilif.com yapıldığında kullanılır.
      {
        source: "/__/auth/:path*",
        destination: "https://akc-oto-kilif.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
