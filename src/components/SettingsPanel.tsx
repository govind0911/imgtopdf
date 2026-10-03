import type { ReactNode } from 'react';
import type { PdfSettings } from '../types';

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-bg p-1 ring-1 ring-line">
      {options.map(([v, text]) => (
        <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={`min-h-11 rounded-[10px] px-2 text-[14px] font-medium transition-colors duration-200 ${value === v ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink'}`}>{text}</button>
      ))}
    </div>
  );
}
const Field = ({ label, extra, children }: { label: string; extra?: string; children: ReactNode }) => (
  <div><div className="mb-2 flex justify-between text-[13px] font-medium"><span className="text-ink">{label}</span><span className="text-muted">{extra}</span></div>{children}</div>
);

export function SettingsPanel({ s, set }: { s: PdfSettings; set: (p: Partial<PdfSettings>) => void }) {
  return (
    <section aria-labelledby="settings-h" className="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 id="settings-h" className="text-xl font-semibold text-head">PDF Settings</h2>
      <Field label="Page size"><Seg label="Page size" value={s.pageSize} onChange={(pageSize) => set({ pageSize })} options={[['a4', 'A4'], ['letter', 'Letter'], ['legal', 'Legal']]} /></Field>
      <Field label="Orientation"><Seg label="Orientation" value={s.orientation} onChange={(orientation) => set({ orientation })} options={[['portrait', 'Portrait'], ['landscape', 'Landscape']]} /></Field>
      <Field label="Image fit"><Seg label="Image fit" value={s.fit} onChange={(fit) => set({ fit })} options={[['contain', 'Contain'], ['cover', 'Cover'], ['fill', 'Fill']]} /></Field>
      {s.fit !== 'contain' && <p className="-mt-3 text-[13px] text-muted">{s.fit === 'cover' ? 'Cover crops the edges of images to fill the page.' : 'Fill stretches images and can distort them.'}</p>}
      <Field label="Margin" extra={`${s.margin} mm`}>
        <input type="range" min={0} max={40} value={s.margin} aria-label="Margin in millimetres" onChange={(e) => set({ margin: +e.target.value })} className="h-11 w-full accent-brand" />
      </Field>
      <Field label="JPEG quality" extra={`${Math.round(s.quality * 100)}%`}>
        <input type="range" min={40} max={100} value={Math.round(s.quality * 100)} aria-label="JPEG quality percent" onChange={(e) => set({ quality: +e.target.value / 100 })} className="h-11 w-full accent-brand" />
      </Field>
      <Field label="Filename">
        <input value={s.filename} onChange={(e) => set({ filename: e.target.value })} aria-label="PDF filename" maxLength={100}
          className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-[15px] text-ink transition-colors duration-200 focus:border-brand" />
      </Field>
    </section>
  );
}
