'use client';
import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

interface Props {
  total: number;
  page: number;
  perPage: number;
  onPage: (p: number) => void;
}

export default function Pagination({ total, page, perPage, onPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  // Build page number list with ellipsis
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4)            pages.push('...');
    const start = Math.max(2, page - 1);
    const end   = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (label: React.ReactNode, target: number, disabled: boolean, active = false, keyName?: string) => (
    <button
      key={keyName ?? `page-btn-${target}`}
      onClick={() => !disabled && onPage(target)}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-lg text-sm
        transition-colors select-none
        ${active
          ? 'bg-blue-600 text-white font-semibold shadow-sm'
          : disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
      <p className="text-xs text-gray-400">
        Showing <span className="font-medium text-gray-600">{from}–{to}</span> of{' '}
        <span className="font-medium text-gray-600">{total}</span> records
      </p>

      <div className="flex items-center gap-1">
        {btn(<MdFirstPage size={16} />, 1, page === 1, false, 'page-first')}
        {btn(<MdChevronLeft size={16} />, page - 1, page === 1, false, 'page-prev')}

        {pages.map((p, idx) =>
          p === '...'
            ? <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm select-none">…</span>
            : btn(p, p, false, p === page, `page-${p}`)
        )}

        {btn(<MdChevronRight size={16} />, page + 1, page === totalPages, false, 'page-next')}
        {btn(<MdLastPage size={16} />, totalPages, page === totalPages, false, 'page-last')}
      </div>
    </div>
  );
}

/** Slice a data array for the current page */
export function paginate<T>(data: T[], page: number, perPage: number): T[] {
  return data.slice((page - 1) * perPage, page * perPage);
}
