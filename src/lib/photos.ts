const MAX_DIM = 1600;
const QUALITY = 0.85;

export async function compressImage(file: File | Blob): Promise<Blob> {
  const bitmap = await loadBitmap(file);
  try {
    const { width, height } = fit(bitmap.width, bitmap.height, MAX_DIM);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    if (!blob) throw new Error('Image compression failed');
    return blob;
  } finally {
    if ('close' in bitmap) (bitmap as ImageBitmap).close();
  }
}

async function loadBitmap(source: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(source);
    } catch {
      // fall through to HTMLImageElement
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

function fit(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w / h;
  return ratio >= 1
    ? { width: max, height: Math.round(max / ratio) }
    : { width: Math.round(max * ratio), height: max };
}
