import "./globals.css";
import "./admin.css";

export const metadata = {
  title: "AKC Oto Kılıf | Aracınıza Özel Oto Kılıf ve Döşeme",
  description:
    "AKC Oto Kılıf; araca özel oto kılıf, koltuk döşeme, direksiyon kaplama, taban döşeme ve profesyonel montaj hizmetleri sunar.",
  keywords: [
    "AKC Oto Kılıf",
    "oto kılıf",
    "araç koltuk kılıfı",
    "özel dikim oto kılıf",
    "oto döşeme",
    "İstanbul oto kılıf",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
