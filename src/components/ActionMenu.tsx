'use client';
import { useEffect, useRef, useState } from 'react';
import { MdMoreVert, MdVisibility, MdEdit, MdDelete } from 'react-icons/md';

interface Props {
  onView?:   () => void;
  onEdit:    () => void;
  onDelete:  () => void;
}

export default function ActionMenu({ onView, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const item = (
    label: string,
    Icon: React.ElementType,
    onClick: () => void,
    danger = false,
  ) => (
    <button
      onClick={() => { onClick(); setOpen(false); }}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon size={15} className="shrink-0" />
      {label}
    </button>
  );

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 bg-white hover:text-gray-700 transition-colors"
        aria-label="Actions"
      >
        <MdMoreVert size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg p-1">
          {onView  && item('View',   MdVisibility, onView)}
          {item('Edit',   MdEdit,       onEdit)}
          {item('Delete', MdDelete,     onDelete, true)}
        </div>
      )}
    </div>
  );
}
