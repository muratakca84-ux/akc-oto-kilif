export default function manifest() {
  return {
    name: "AKC Oto Kılıf",
    short_name: "AKC",
    description: "Araca özel oto kılıf, döşeme ve profesyonel montaj.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4ef",
    theme_color: "#f4f4ef",
    lang: "tr",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
