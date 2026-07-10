'use client';
import { useEffect, useState } from 'react';
import api, { FinanceEntry } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import axios from 'axios';

const emptyForm: FinanceEntry = {
  date: new Date().toISOString().slice(0, 10),
  description: '', credit: 0, debit: 0, balance: 0,
};

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function FinancePage() {
  const [records, setRecords]           = useState<FinanceEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [viewing, setViewing]           = useState<FinanceEntry | null>(null);
  const [editing, setEditing]           = useState<FinanceEntry | null>(null);
  const [form, setForm]                 = useState<FinanceEntry>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<FinanceEntry | null>(null);
  const [saving, setSaving]             = useState(false);
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    api.get<FinanceEntry[]>('/finance')
      .then(r => setRecords(r.data))
      .catch(() => error('Failed to load finance data.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const totalCredit = records.reduce((a, r) => a + r.credit, 0);
  const totalDebit  = records.reduce((a, r) => a + r.debit,  0);
  const netBalance  = totalCredit - totalDebit;

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (r: FinanceEntry) => { setEditing(r); setForm({ ...r }); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?.id) {
        await api.put(`/finance/${editing.id}`, form);
        success('Entry updated successfully.');
      } else {
        await api.post('/finance', form);
        success('Finance entry added successfully.');
      }
      setShowForm(false); load();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Unexpected error.';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await api.delete(`/finance/${deleteTarget.id}`);
      success('Entry deleted.'); setDeleteTarget(null); load();
    } catch { error('Failed to delete entry.'); }
  };

  const set = (k: keyof FinanceEntry, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-white min-h-full">
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Income &amp; Expense Records</p>
        </div>
        <button onClick={openAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 font-medium transition-colors">
          + Add Entry
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-xs text-green-600 uppercase font-medium">Total Income</p>
          <p className="text-2xl font-bold text-green-700">₦{totalCredit.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-xs text-red-600 uppercase font-medium">Total Expense</p>
          <p className="text-2xl font-bold text-red-700">₦{totalDebit.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${netBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-xs uppercase font-medium ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Balance</p>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>₦{netBalance.toLocaleString()}</p>
        </div>
      </div>

      {loading ? <Spinner /> : records.length === 0 ? (
        <div className="text-center py-24 text-gray-400">No entries yet. Add the first record.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['Date','Description','Credit (Income)','Debit (Expense)','Balance',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r, i) => (
                <tr key={r.id} className="hover:bg-green-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.description}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">{r.credit > 0 ? `₦${r.credit.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{r.debit > 0 ? `₦${r.debit.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">₦{r.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <ActionMenu onView={() => setViewing(r)} onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <ViewModal title="Finance Entry Details" onClose={() => setViewing(null)} fields={[
          { label: 'Date',        value: viewing.date },
          { label: 'Description', value: viewing.description },
          { label: 'Credit',      value: `₦${viewing.credit.toLocaleString()}` },
          { label: 'Debit',       value: `₦${viewing.debit.toLocaleString()}` },
          { label: 'Balance',     value: `₦${viewing.balance.toLocaleString()}` },
        ]} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Entry' : 'Add Finance Entry'} onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)}
                className={inputCls} placeholder="e.g. School fees payment" />
            </div>
            <div>
              <label className={labelCls}>Credit — Income (₦)</label>
              <input type="number" value={form.credit} onChange={e => set('credit', Number(e.target.value))} className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Debit — Expense (₦)</label>
              <input type="number" value={form.debit} onChange={e => set('debit', Number(e.target.value))} className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Balance (₦)</label>
              <input type="number" value={form.balance} onChange={e => set('balance', Number(e.target.value))} className={inputCls} min={0} />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60 min-w-[72px]">
              {saving ? '...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <DeleteConfirm itemName={deleteTarget.description} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
