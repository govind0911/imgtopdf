import { AlertTriangle, CheckCircle2, Download, FileDown, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { DropZone } from './components/DropZone';
import { Header } from './components/Header';
import { EmptyState, ImageGrid } from './components/ImageGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { useImages } from './hooks/useImages';
import { generatePdf } from './services/pdf';
import { DEFAULT_SETTINGS, type PdfSettings } from './types';
import { download, formatBytes, safeName } from './utils';

type Note = { kind: 'error' | 'warn'; text: string };
const NOTE_STYLE = { error: ['text-danger', XCircle], warn: ['text-amber-600 dark:text-amber-400', AlertTriangle] } as const;

export default function App() {
  const { images, add, remove, rotate, move, clear } = useImages();
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [result, setResult] = useState<{ blob: Blob; name: string; pages: number } | null>(null);

  const onFiles = async (files: File[]) => {
    if (!files.length) return;
    const errors = await add(files);
    setNotes(errors.map((text) => ({ kind: 'error', text })));
  };

  const convert = async () => {
    setBusy(true); setProgress(0); setNotes([]); setResult(null);
    try {
      const r = await generatePdf(images, settings, (d, t) => setProgress(d / t));
      const name = safeName(settings.filename);
      setResult({ blob: r.blob, name, pages: r.pages });
      download(r.blob, name);
      if (r.skipped.length) setNotes([{ kind: 'warn', text: `Skipped ${r.skipped.length} image(s) that could not be processed: ${r.skipped.join(', ')}` }]);
    } catch {
      setNotes([{ kind: 'error', text: 'Something went wrong while creating the PDF.' }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-10 sm:px-6 lg:pb-16 lg:pt-14">
        <div className="mb-10 text-center">
          <span className="mx-auto mb-5 block h-1 w-10 rounded-full bg-red-500" aria-hidden />
          <h1 className="text-4xl font-bold tracking-tight text-head sm:text-5xl lg:text-6xl">Convert Images to PDF</h1>
          <p className="mx-auto mt-4 max-w-xl text-[17px] text-muted">Turn your images into a PDF in seconds. Everything happens directly in your browser.</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <DropZone onFiles={onFiles} compact={images.length > 0} />
            <div aria-live="polite" className="space-y-2">
              {notes.map((n, i) => { const [cls, Icon] = NOTE_STYLE[n.kind]; return (
                <p key={i} role={n.kind === 'error' ? 'alert' : undefined} className={`flex items-start gap-2 rounded-xl border border-line bg-surface p-3 text-[14px] ${cls}`}><Icon size={18} className="mt-0.5 shrink-0" aria-hidden /><span className="text-ink">{n.text}</span></p>
              ); })}
            </div>
            <section aria-labelledby="images-h">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="images-h" className="text-2xl font-semibold text-head">Images{images.length > 0 && <span className="ml-2 text-base font-medium text-muted">{images.length}</span>}</h2>
                {images.length > 0 && <button onClick={() => { clear(); setResult(null); }} className="min-h-11 rounded-[10px] px-3 text-[14px] font-medium text-danger transition-colors duration-200 hover:bg-danger/10">Clear all</button>}
              </div>
              {images.length ? <ImageGrid images={images} onMove={move} onRotate={rotate} onRemove={remove} /> : <EmptyState />}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <SettingsPanel s={settings} set={(p) => setSettings((v) => ({ ...v, ...p }))} />
            <div className="fixed inset-x-0 bottom-0 z-20 space-y-3 border-t border-line bg-surface/95 p-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
              {busy && (
                <div role="status" className="text-[13px] font-medium text-brand">
                  <div className="mb-1 flex justify-between"><span>Generating PDF…</span><span>{Math.round(progress * 100)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all duration-200" style={{ width: `${progress * 100}%` }} /></div>
                </div>
              )}
              {result && !busy && (
                <div role="status" className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface p-3 text-[14px]">
                  <span className="flex min-w-0 items-center gap-2 text-ink"><CheckCircle2 size={18} className="shrink-0 text-ok" aria-hidden /><span className="truncate">PDF ready · {result.pages} page{result.pages > 1 ? 's' : ''} · {formatBytes(result.blob.size)}</span></span>
                  <button onClick={() => download(result.blob, result.name)} aria-label="Download PDF again" className="grid size-11 shrink-0 place-items-center rounded-[10px] text-brand hover:bg-soft"><Download size={18} aria-hidden /></button>
                </div>
              )}
              <button onClick={convert} disabled={!images.length || busy}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <FileDown size={18} aria-hidden />}
                {busy ? 'Generating…' : 'Convert to PDF'}
              </button>
              <p className="hidden text-center text-[13px] text-muted lg:block">Simple. Private. Instant. Images never leave your device.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
