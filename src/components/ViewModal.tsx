'use client';
import { ReactNode } from 'react';
import Modal from './Modal';

interface Field { label: string; value: ReactNode }

interface Props {
  title: string;
  fields: Field[];
  onClose: () => void;
}

export default function ViewModal({ title, fields, onClose }: Props) {
  return (
    <Modal title={title} onClose={onClose}>
      <dl className="divide-y divide-gray-100">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex py-2.5 gap-4">
            <dt className="w-36 shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide pt-0.5">
              {label}
            </dt>
            <dd className="flex-1 text-sm text-gray-900 break-words">{value ?? '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
