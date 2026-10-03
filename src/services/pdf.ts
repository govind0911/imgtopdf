import { jsPDF } from 'jspdf';
import type { ImageItem, PdfSettings } from '../types';

/** Longest side (px) of the working canvas. Keeps huge photos from exhausting memory. */
const MAX_SIDE = 2600;

export function computePlacement(iw: number, ih: number, aw: number, ah: number, fit: PdfSettings['fit']) {
  if (fit === 'fill') return { w: aw, h: ah, sx: 0, sy: 0, sw: iw, sh: ih };
  if (fit === 'contain') {
    const s = Math.min(aw / iw, ah / ih);
    return { w: iw * s, h: ih * s, sx: 0, sy: 0, sw: iw, sh: ih };
  }
  const s = Math.max(aw / iw, ah / ih);
  const sw = aw / s, sh = ah / s;
  return { w: aw, h: ah, sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw, sh };
}

async function renderJpeg(item: ImageItem, k: number, crop: ReturnType<typeof computePlacement>, cover: boolean, quality: number) {
  const bmp = await createImageBitmap(item.file);
  const swap = item.rotation % 180 !== 0;
  const cw = Math.max(1, Math.round((swap ? bmp.height : bmp.width) * k));
  const ch = Math.max(1, Math.round((swap ? bmp.width : bmp.height) * k));
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
  ctx.translate(cw / 2, ch / 2); ctx.rotate((item.rotation * Math.PI) / 180);
  ctx.drawImage(bmp, (-bmp.width * k) / 2, (-bmp.height * k) / 2, bmp.width * k, bmp.height * k);
  bmp.close();
  let out = canvas;
  if (cover) {
    out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(crop.sw * k)); out.height = Math.max(1, Math.round(crop.sh * k));
    out.getContext('2d')!.drawImage(canvas, crop.sx * k, crop.sy * k, crop.sw * k, crop.sh * k, 0, 0, out.width, out.height);
    canvas.width = canvas.height = 0;
  }
  const url = out.toDataURL('image/jpeg', quality);
  out.width = out.height = 0;
  return url;
}

export async function generatePdf(images: ImageItem[], s: PdfSettings, onProgress: (done: number, total: number) => void) {
  const doc = new jsPDF({ orientation: s.orientation, unit: 'mm', format: s.pageSize, compress: true });
  const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
  const aw = Math.max(10, pw - s.margin * 2), ah = Math.max(10, ph - s.margin * 2);
  const skipped: string[] = [];
  let pages = 0;
  for (let i = 0; i < images.length; i++) {
    const it = images[i];
    try {
      const swap = it.rotation % 180 !== 0;
      const rw = swap ? it.height : it.width, rh = swap ? it.width : it.height;
      const p = computePlacement(rw, rh, aw, ah, s.fit);
      const k = Math.min(1, MAX_SIDE / Math.max(rw, rh));
      const data = await renderJpeg(it, k, p, s.fit === 'cover', s.quality);
      if (pages > 0) doc.addPage(s.pageSize, s.orientation);
      doc.addImage(data, 'JPEG', s.margin + (aw - p.w) / 2, s.margin + (ah - p.h) / 2, p.w, p.h, undefined, 'FAST');
      pages++;
    } catch {
      skipped.push(it.name);
    }
    onProgress(i + 1, images.length);
    await new Promise((r) => setTimeout(r));
  }
  if (!pages) throw new Error('No images could be processed.');
  return { blob: doc.output('blob'), skipped, pages };
}
