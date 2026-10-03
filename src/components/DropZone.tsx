import { ImagePlus, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

export function DropZone({ onFiles, compact }: { onFiles: (f: File[]) => void; compact: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const Icon = compact ? ImagePlus : UploadCloud;
  return (
    <div role="button" tabIndex={0} aria-label="Upload images. Drop files here, or press Enter to browse your device."
      onClick={() => input.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
      className={`relative cursor-pointer rounded-[20px] border-2 border-dashed text-center shadow-card transition-all duration-200 ${compact ? 'px-6 py-6' : 'px-6 py-14 sm:py-16'} ${over ? 'border-brand bg-soft' : 'border-brand/40 bg-surface hover:border-brand hover:bg-soft'}`}>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden
        onClick={(e) => e.stopPropagation()} onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      {over && <span className="absolute right-5 top-5 size-2 rounded-full bg-red-500" aria-hidden />}
      <Icon className={`mx-auto transition-colors duration-200 ${over ? 'text-brand' : 'text-brand/70'}`} size={compact ? 28 : 44} strokeWidth={1.5} aria-hidden />
      <p className={`font-semibold text-head ${compact ? 'mt-2 text-[15px]' : 'mt-4 text-xl'}`}>{over ? 'Release to add images' : 'Drop your images here'}</p>
      <p className="mt-1 text-[15px] text-muted">or <span className="font-medium text-brand underline underline-offset-2">browse from your device</span></p>
      {!compact && <p className="mt-4 text-[13px] font-medium text-muted">JPG · PNG · WEBP</p>}
    </div>
  );
}
