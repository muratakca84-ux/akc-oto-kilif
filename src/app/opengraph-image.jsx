import { ImageResponse } from "next/og";

export const alt = "AKC Oto Kılıf - Aracınıza özel oto kılıf ve koltuk döşeme";
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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#ffffff",
          background: "#0b1626",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 14, height: 56, background: "#1f8fe5" }} />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: "-1px" }}>
            AKC Oto Kılıf
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#7dbdf2", fontSize: 24, fontWeight: 700, letterSpacing: "3px" }}>
            KONYA · KARATAY
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-3px", maxWidth: 900 }}>
            Aracınıza özel oto kılıf ve koltuk döşeme.
          </div>
        </div>
        <div style={{ display: "flex", color: "#a9b4c4", fontSize: 26 }}>
          Model uyumlu ölçü · Dayanıklı malzeme · Profesyonel montaj · 0501 586 42 84
        </div>
      </div>
    ),
    size
  );
}
