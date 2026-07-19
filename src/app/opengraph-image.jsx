import { ImageResponse } from "next/og";

export const alt = "AKC Oto Kılıf - Aracınıza özel oto kılıf ve döşeme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "76px",
          color: "#142033",
          background:
            "linear-gradient(135deg, #fbfaf5 0%, #eef2f4 62%, #e8d19c 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "76%" }}>
          <div style={{ display: "flex", color: "#93631e", fontSize: 24, fontWeight: 800 }}>
            KONYA • PROFESYONEL MONTAJ
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-4px",
            }}
          >
            Aracınıza özel oto kılıf ve döşeme.
          </div>
          <div style={{ display: "flex", marginTop: 28, color: "#5f6978", fontSize: 28 }}>
            Ölçülü uygulama • Temiz işçilik • AKC standardı
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 190,
            height: 190,
            marginLeft: "auto",
            borderRadius: 46,
            color: "white",
            fontSize: 58,
            fontWeight: 900,
            background: "linear-gradient(135deg, #bd8b39, #142033)",
          }}
        >
          AKC
        </div>
      </div>
    ),
    size
  );
}
