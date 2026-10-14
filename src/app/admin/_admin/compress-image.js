/**
 * Yüklenecek görseli tarayıcıda küçültür ve sıkıştırır.
 * Büyük telefon fotoğrafları (3–8 MB) bu sayede ~200–400 KB'a iner.
 * SVG/GIF dokunulmadan, sıkıştırma başarısız olursa orijinal dosya döner.
 */
export async function compressImage(file, { maxSize = 1600, quality = 0.84 } = {}) {
  if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    // PNG şeffaflığı kaybolmasın diye PNG'ler PNG kalır; diğerleri JPEG olur.
    const keepPng = file.type === "image/png";
    if (!keepPng) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const type = keepPng ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + (keepPng ? ".png" : ".jpg");
    return new File([blob], name, { type });
  } catch {
    return file;
  }
}
