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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const MENU_WIDTH = 176; // w-44 in pixels
      const MENU_HEIGHT = 140; // Approximate menu height
      const GAP = 8;
      
      // Check if there's space to the right
      const spaceOnRight = window.innerWidth - rect.right;
      const canFitRight = spaceOnRight >= MENU_WIDTH + GAP;
      
      // Calculate left position
      let left = canFitRight ? rect.right + GAP : rect.left - MENU_WIDTH - GAP;
      
      // Keep menu within viewport horizontally
      if (left < 0) left = GAP;
      if (left + MENU_WIDTH > window.innerWidth) left = window.innerWidth - MENU_WIDTH - GAP;
      
      // Position menu directly beside button, aligned to button top
      let top = rect.top;
      
      // Adjust if menu goes below viewport
      if (top + MENU_HEIGHT > window.innerHeight) {
        top = window.innerHeight - MENU_HEIGHT - GAP;
      }
      
      // Adjust if menu goes above viewport
      if (top < 0) {
        top = GAP;
      }
      
      setPosition({ top, left });
    }
    setOpen(!open);
  };

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors text-left font-medium ${
        danger
          ? 'text-red-400 hover:bg-red-600/20'
          : 'text-white hover:bg-slate-700'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {label}
    </button>
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 bg-white hover:text-gray-700 transition-colors"
        aria-label="Actions"
      >
        <MdMoreVert size={18} />
      </button>

      {open && (
        <div className="fixed z-[9999] w-44 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden" style={{left: `${position.left}px` }}>
        {/* // <div className="fixed z-[9999] w-44 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden"> */}
          <div className="flex flex-col p-2">
            {onView && item('View', MdVisibility, onView)}
            {item('Edit', MdEdit, onEdit)}
            {item('Delete', MdDelete, onDelete, true)}
          </div>
        </div>
      )}
    </div>
  );
}
