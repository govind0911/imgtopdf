export const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
export const formatBytes = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`);
export const safeName = (n: string) => (n.trim().replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]+/g, '-') || 'converted-images') + '.pdf';
export function download(blob: Blob, name: string) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
