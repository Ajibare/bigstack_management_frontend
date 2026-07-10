'use client';
import { useEffect, useState } from 'react';
import api, { ItStudent } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import axios from 'axios';

const emptyForm = {
  name: '', university: '', department: '', level: '',
  feeToPay: 0, amountPaid: 0, balance: 0,
  date: new Date().toISOString().slice(0, 10),
};
type FormData = typeof emptyForm;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function ItStudentsPage() {
  const [records, setRecords]           = useState<ItStudent[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [viewing, setViewing]           = useState<ItStudent | null>(null);
  const [editing, setEditing]           = useState<ItStudent | null>(null);
  const [form, setForm]                 = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ItStudent | null>(null);
  const [saving, setSaving]             = useState(false);
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    api.get<ItStudent[]>('/it-students')
      .then(r => setRecords(r.data))
      .catch(() => error('Failed to load data.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (r: ItStudent) => {
    setEditing(r);
    setForm({ name: r.name, university: r.university, department: r.department,
      level: r.level, feeToPay: r.feeToPay, amountPaid: r.amountPaid, balance: r.balance, date: r.date });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?.id) {
        await api.put(`/it-students/${editing.id}`, form);
        success('IT Student updated successfully.');
      } else {
        await api.post('/it-students', form);
        success('IT Student registered successfully.');
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
      await api.delete(`/it-students/${deleteTarget.id}`);
      success('IT Student deleted.'); setDeleteTarget(null); load();
    } catch { error('Failed to delete.'); }
  };

  const set = (k: keyof FormData, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-white min-h-full">
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IT Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} records</p>
        </div>
        <button onClick={openAdd}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 font-medium transition-colors">
          + Add IT Student
        </button>
      </div>

      {loading ? <Spinner /> : records.length === 0 ? (
        <div className="text-center py-24 text-gray-400">No records yet. Add the first IT student.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['Student ID','Name','University','Department','Level','Fee','Paid','Balance','Date',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r, i) => (
                <tr key={r.id} className="hover:bg-purple-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">{r.sn}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.university}</td>
                  <td className="px-4 py-3 text-gray-600">{r.department}</td>
                  <td className="px-4 py-3 text-gray-600">{r.level}</td>
                  <td className="px-4 py-3">₦{r.feeToPay.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-700">₦{r.amountPaid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600">₦{r.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
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
        <ViewModal title="IT Student Details" onClose={() => setViewing(null)} fields={[
          { label: 'Student ID',  value: viewing.sn },
          { label: 'Name',        value: viewing.name },
          { label: 'University',  value: viewing.university },
          { label: 'Department',  value: viewing.department },
          { label: 'Level',       value: viewing.level },
          { label: 'Fee to Pay',  value: `₦${viewing.feeToPay.toLocaleString()}` },
          { label: 'Amount Paid', value: `₦${viewing.amountPaid.toLocaleString()}` },
          { label: 'Balance',     value: `₦${viewing.balance.toLocaleString()}` },
          { label: 'Date',        value: viewing.date },
        ]} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit IT Student' : 'Register IT Student'} onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls} placeholder="Enter full name" />
            </div>
            <div>
              <label className={labelCls}>University</label>
              <input type="text" value={form.university} onChange={e => set('university', e.target.value)}
                className={inputCls} placeholder="University name" />
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <input type="text" value={form.department} onChange={e => set('department', e.target.value)}
                className={inputCls} placeholder="Department" />
            </div>
            <div>
              <label className={labelCls}>Level</label>
              <input type="text" value={form.level} onChange={e => set('level', e.target.value)}
                className={inputCls} placeholder="e.g. 300L" />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fee to Pay (₦)</label>
              <input type="number" value={form.feeToPay} onChange={e => set('feeToPay', Number(e.target.value))}
                className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Amount Paid (₦)</label>
              <input type="number" value={form.amountPaid} onChange={e => set('amountPaid', Number(e.target.value))}
                className={inputCls} min={0} />
            </div>
            <div>
              <label className={labelCls}>Balance (₦)</label>
              <input type="number" value={form.balance} onChange={e => set('balance', Number(e.target.value))}
                className={inputCls} min={0} />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60 min-w-[72px]">
              {saving ? '...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <DeleteConfirm itemName={deleteTarget.name} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
