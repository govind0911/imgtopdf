export type Rotation = 0 | 90 | 180 | 270;
export interface ImageItem { id: string; file: File; url: string; name: string; size: number; width: number; height: number; rotation: Rotation }
export interface PdfSettings {
  pageSize: 'a4' | 'letter' | 'legal'; orientation: 'portrait' | 'landscape'; margin: number;
  fit: 'contain' | 'cover' | 'fill'; quality: number; filename: string;
}
export const DEFAULT_SETTINGS: PdfSettings = { pageSize: 'a4', orientation: 'portrait', margin: 10, fit: 'contain', quality: 0.85, filename: 'converted-images.pdf' };
