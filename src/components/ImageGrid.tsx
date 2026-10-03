import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RotateCw, Trash2 } from 'lucide-react';
import type { ImageItem } from '../types';
import { formatBytes } from '../utils';

interface Actions { onRotate: (id: string) => void; onRemove: (id: string) => void }

function Card({ item, index, onRotate, onRemove }: Actions & { item: ImageItem; index: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const btn = 'grid size-11 place-items-center rounded-[10px] transition-colors duration-200';
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-line bg-surface shadow-card ${isDragging ? 'relative z-10 opacity-90 ring-2 ring-brand' : ''}`}>
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-bg">
        <img src={item.url} alt={`Page ${index + 1}: ${item.name}`} draggable={false} loading="lazy"
          style={{ transform: `rotate(${item.rotation}deg)` }} className="size-full object-contain p-2 transition-transform duration-200" />
        <span className="absolute left-2 top-2 rounded-md bg-surface/90 px-2 py-0.5 text-[12px] font-medium text-muted ring-1 ring-line">Page {index + 1}</span>
        <button ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Reorder ${item.name}`}
          className="absolute right-1 top-1 grid size-11 cursor-grab touch-none place-items-center rounded-[10px] text-muted hover:bg-surface hover:text-brand active:cursor-grabbing">
          <GripVertical size={18} aria-hidden />
        </button>
      </div>
      <div className="flex items-center justify-between gap-1 p-3 pt-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-ink" title={item.name}>{item.name}</p>
          <p className="text-[13px] text-muted">{item.width}×{item.height} · {formatBytes(item.size)}</p>
        </div>
        <div className="flex shrink-0">
          <button onClick={() => onRotate(item.id)} aria-label={`Rotate ${item.name} 90 degrees`} className={`${btn} text-muted hover:bg-soft hover:text-brand`}><RotateCw size={18} aria-hidden /></button>
          <button onClick={() => onRemove(item.id)} aria-label={`Delete ${item.name}`} className={`${btn} text-danger hover:bg-danger/10`}><Trash2 size={18} aria-hidden /></button>
        </div>
      </div>
    </li>
  );
}

export function ImageGrid({ images, onMove, ...actions }: Actions & { images: ImageItem[]; onMove: (from: string, to: string) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onEnd = ({ active, over }: DragEndEvent) => { if (over && active.id !== over.id) onMove(String(active.id), String(over.id)); };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onEnd}>
      <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((it, n) => <Card key={it.id} item={it} index={n} {...actions} />)}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-card">
      <svg viewBox="0 0 96 80" className="mx-auto h-20" aria-hidden>
        <rect x="14" y="10" width="46" height="60" rx="8" className="fill-soft stroke-brand" strokeWidth="2" />
        <rect x="36" y="22" width="46" height="48" rx="8" className="fill-surface stroke-brand" strokeWidth="2" />
        <path d="M42 62l11-14 9 10 6-7 8 11z" className="fill-brand/20 stroke-brand" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="66" cy="36" r="4" className="fill-red-500" />
      </svg>
      <p className="mt-4 text-[17px] font-semibold text-head">No images added yet</p>
      <p className="mt-1 text-[15px] text-muted">Upload JPG, PNG, or WEBP images to get started.</p>
    </div>
  );
}
