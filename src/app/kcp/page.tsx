'use client';
import { useEffect, useMemo, useState } from 'react';
import api, { KcpEntry } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import Pagination, { paginate } from '@/components/Pagination';
import axios from 'axios';

const emptyForm = {
  name: '', feeToPay: 0, amountPaid: 0, balance: 0,
  date: new Date().toISOString().slice(0, 10), age: '',
  completed: false, certificateIssued: false,
};
type FormData = typeof emptyForm;

const PER_PAGE = 10;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function KcpPage() {
  const [records, setRecords]           = useState<KcpEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [viewing, setViewing]           = useState<KcpEntry | null>(null);
  const [editing, setEditing]           = useState<KcpEntry | null>(null);
  const [form, setForm]                 = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<KcpEntry | null>(null);
  const [saving, setSaving]             = useState(false);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [fromDate, setFromDate]         = useState('');
  const [toDate, setToDate]             = useState('');
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    api.get<KcpEntry[]>('/kcp')
      .then(r => setRecords(r.data))
      .catch(() => error('Failed to load data.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const totalFee     = records.reduce((a, r) => a + r.feeToPay,   0);
  const totalPaid    = records.reduce((a, r) => a + r.amountPaid, 0);
  const totalBalance = records.reduce((a, r) => a + r.balance,    0);

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (r: KcpEntry) => {
    setEditing(r);
    setForm({ 
      name: r.name, feeToPay: r.feeToPay, amountPaid: r.amountPaid, 
      balance: r.balance, date: r.date, age: r.age,
      completed: r.completed ?? false, certificateIssued: r.certificateIssued ?? false
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?._id) {
        await api.put(`/kcp/${editing._id}`, form);
        success('KCP record updated successfully.');
      } else {
        await api.post('/kcp', form);
        success('Child registered successfully.');
      }
      setShowForm(false); load();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Unexpected error.';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/kcp/${deleteTarget._id}`);
      success('KCP record deleted.'); setDeleteTarget(null); load();
    } catch { error('Failed to delete.'); }
  };

  const set = (k: keyof FormData, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesText = !term || [r.name, r.age, r.sn].some((value) => value?.toString().toLowerCase().includes(term));
      const recordDate = new Date(r.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const matchesDate = (!from || recordDate >= from) && (!to || recordDate <= to);
      return matchesText && matchesDate;
    });
  }, [records, search, fromDate, toDate]);

  return (
    <div className="bg-white min-h-full">
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KCP — KidsCode Program</h1>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} enrolled</p>
        </div>
        <button onClick={openAdd}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 font-medium transition-colors">
          + Add Child
        </button>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-center">
            <p className="text-xs text-orange-600 uppercase font-medium">Total Fee</p>
            <p className="text-xl font-bold text-orange-700">₦{totalFee.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-xs text-green-600 uppercase font-medium">Total Paid</p>
            <p className="text-xl font-bold text-green-700">₦{totalPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-xs text-red-600 uppercase font-medium">Total Balance</p>
            <p className="text-xl font-bold text-red-700">₦{totalBalance.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, age or ID" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">{records.length === 0 ? 'No children registered yet.' : 'No records match your search or date filter.'}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['ID','Name','Age','Fee Payment','Amount Paid','Balance','Date','Completed','Certificate',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginate(filtered, page, PER_PAGE).map((r, i) => (
                <tr key={r._id} className="hover:bg-orange-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-4 py-3">
                    <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded">{r.sn}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.age}</td>
                  <td className="px-4 py-3">₦{r.feeToPay.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-700">₦{r.amountPaid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600">₦{r.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      r.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.completed ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      r.certificateIssued ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.certificateIssued ? 'Issued' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionMenu onView={() => setViewing(r)} onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onPage={setPage} />
          </div>
        </div>
      )}

      {viewing && (
        <ViewModal title="KCP Child Details" onClose={() => setViewing(null)} fields={[
          { label: 'ID',          value: viewing.sn },
          { label: 'Name',        value: viewing.name },
          { label: 'Age',         value: viewing.age },
          { label: 'Fee Payment', value: `₦${viewing.feeToPay.toLocaleString()}` },
          { label: 'Amount Paid', value: `₦${viewing.amountPaid.toLocaleString()}` },
          { label: 'Balance',     value: `₦${viewing.balance.toLocaleString()}` },
          { label: 'Date',        value: viewing.date },
          { label: 'Completed',   value: viewing.completed ? 'Yes' : 'No' },
          { label: 'Certificate', value: viewing.certificateIssued ? 'Issued' : 'Pending' },
        ]} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit KCP Record' : 'Register KCP Child'} onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls} placeholder="Child's full name" />
            </div>
            <div>
              <label className={labelCls}>Age</label>
              <input type="text" value={form.age} onChange={e => set('age', e.target.value)}
                className={inputCls} placeholder="e.g. 10" />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fee Payment (₦)</label>
              <input type="number" value={form.feeToPay || ''} onChange={e => set('feeToPay', Number(e.target.value))} className={inputCls} min={0} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Amount Paid (₦)</label>
              <input type="number" value={form.amountPaid || ''} onChange={e => set('amountPaid', Number(e.target.value))} className={inputCls} min={0} placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Balance (₦)</label>
              <input type="number" value={form.balance || ''} onChange={e => set('balance', Number(e.target.value))} className={inputCls} min={0} placeholder="0" />
            </div>
            {editing && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.completed}
                      onChange={(e) => set('completed', e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    Course Completed
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.certificateIssued}
                      onChange={(e) => set('certificateIssued', e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    Certificate Issued
                  </label>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-60 min-w-[72px]">
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
