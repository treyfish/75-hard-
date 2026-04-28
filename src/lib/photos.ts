const MAX_DIM = 1600;
const QUALITY = 0.85;
const FALLBACK_SIZE_LIMIT = 12 * 1024 * 1024; // 12 MB — keep originals smaller than this

/**
 * Resize + JPEG re-encode the picked file to keep storage small.
 * On iOS the file may be HEIC and the canvas pipeline fails to decode it;
 * in that case we save the original Blob untouched. Safari renders HEIC
 * natively and Supabase Storage doesn't care about format.
 */
export async function compressImage(file: File | Blob): Promise<Blob> {
  try {
    return await reencode(file);
  } catch (err) {
    console.warn('Image compression failed, using original:', err);
    if (file.size <= FALLBACK_SIZE_LIMIT) return file;
    throw new Error(
      `Could not process this image (${Math.round(file.size / 1024 / 1024)} MB). Try a smaller one.`,
    );
  }
}

async function reencode(file: File | Blob): Promise<Blob> {
  const bitmap = await loadImage(file);
  const w = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width;
  const h = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height;
  if (!w || !h) throw new Error('Image has zero dimensions');

  const { width, height } = fit(w, h, MAX_DIM);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
  if ('close' in bitmap) (bitmap as ImageBitmap).close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY),
  );
  if (!blob) throw new Error('Canvas toBlob returned null');
  return blob;
}

async function loadImage(source: Blob): Promise<ImageBitmap | HTMLImageElement> {
  // HTMLImageElement first — it handles iOS HEIC natively where createImageBitmap may not.
  try {
    return await loadAsImg(source);
  } catch (err) {
    if (typeof createImageBitmap === 'function') {
      try {
        return await createImageBitmap(source);
      } catch {
        // fall through
      }
    }
    throw err;
  }
}

function loadAsImg(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.decoding = 'async';
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
