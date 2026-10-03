import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { ImageItem, Rotation } from '../types';
import { ACCEPT } from '../utils';

export function useImages() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const ref = useRef(images);
  ref.current = images;
  useEffect(() => () => ref.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  const add = useCallback(async (files: File[]) => {
    const errors: string[] = [];
    const added: ImageItem[] = [];
    for (const f of files) {
      if (!ACCEPT.includes(f.type)) { errors.push(`${f.name}: unsupported image type. Use JPG, PNG or WEBP.`); continue; }
      try {
        const bmp = await createImageBitmap(f);
        const { width, height } = bmp;
        bmp.close();
        added.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file: f, url: URL.createObjectURL(f), name: f.name, size: f.size, width, height, rotation: 0 });
      } catch {
        errors.push(`${f.name}: could not read this image. It may be corrupted or too large for this device.`);
      }
    }
    if (added.length) setImages((p) => [...p, ...added]);
    return errors;
  }, []);

  const remove = useCallback((id: string) => {
    const t = ref.current.find((i) => i.id === id);
    if (t) URL.revokeObjectURL(t.url);
    setImages((p) => p.filter((i) => i.id !== id));
  }, []);
  const rotate = useCallback((id: string) => setImages((p) => p.map((i) => (i.id === id ? { ...i, rotation: ((i.rotation + 90) % 360) as Rotation } : i))), []);
  const move = useCallback((from: string, to: string) => setImages((p) => arrayMove(p, p.findIndex((i) => i.id === from), p.findIndex((i) => i.id === to))), []);
  const clear = useCallback(() => { ref.current.forEach((i) => URL.revokeObjectURL(i.url)); setImages([]); }, []);
  return { images, add, remove, rotate, move, clear };
}
