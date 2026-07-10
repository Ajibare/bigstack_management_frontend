'use client';
import { useEffect, useState } from 'react';
import { MdCheckCircle, MdError, MdClose } from 'react-icons/md';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface Props {
  toasts: ToastMessage[];
  remove: (id: number) => void;
}

export function ToastContainer({ toasts, remove }: Props) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} remove={remove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, remove }: { toast: ToastMessage; remove: (id: number) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 3500);
    const clean = setTimeout(() => remove(toast.id), 3800);
    return () => { clearTimeout(hide); clearTimeout(clean); };
  }, [toast.id, remove]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`toast-enter flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${
        isSuccess
          ? 'bg-white border-green-200 text-gray-800'
          : 'bg-white border-red-200 text-gray-800'
      }`}
    >
      {isSuccess
        ? <MdCheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
        : <MdError size={20} className="text-red-500 shrink-0 mt-0.5" />
      }
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        className="text-gray-400 hover:text-gray-600 shrink-0"
        aria-label="Dismiss"
      >
        <MdClose size={16} />
      </button>
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
let _nextId = 1;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const add = (type: ToastType, message: string) => {
    const id = _nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const success = (msg: string) => add('success', msg);
  const error   = (msg: string) => add('error', msg);

  return { toasts, remove, success, error };
}
