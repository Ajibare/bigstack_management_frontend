'use client';
import { useEffect, useMemo, useState } from 'react';
import api, { HubSubscription } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import Pagination, { paginate } from '@/components/Pagination';
import { formatCurrency, parseCurrencyInput } from '@/lib/format';
import axios from 'axios';

const emptyForm = {
  name: '', email: '', amountPaid: 0, duration: '',
  isMonthly: false, months: 1,
  date: new Date().toISOString().slice(0, 10),
  expiresAt: new Date().toISOString().slice(0, 10),
};
type FormData = typeof emptyForm;

const PER_PAGE = 10;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function HubSubscriptionsPage() {
  const [records, setRecords]           = useState<HubSubscription[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [viewing, setViewing]           = useState<HubSubscription | null>(null);
  const [editing, setEditing]           = useState<HubSubscription | null>(null);
  const [form, setForm]                 = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<HubSubscription | null>(null);
  const [saving, setSaving]             = useState(false);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [fromDate, setFromDate]         = useState('');
  const [toDate, setToDate]             = useState('');
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    api.get<HubSubscription[]>('/hub-subscriptions')
      .then(r => setRecords(r.data))
      .catch(() => error('Failed to load data.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const computeExpiry = (date: string, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  };

  const openEdit = (r: HubSubscription) => {
    setEditing(r);
    setForm({
      name: r.name,
      email: r.email ?? '',
      amountPaid: r.amountPaid,
      duration: r.duration,
      isMonthly: r.isMonthly ?? false,
      months: r.months ?? 1,
      date: r.date,
      expiresAt: r.expiresAt ?? (r.isMonthly ? computeExpiry(r.date, r.months ?? 1) : r.date),
    });
    setShowForm(true);
  };

  const [invoiceSending, setInvoiceSending] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (editing?._id) {
        await api.put(`/hub-subscriptions/${editing._id}`, form);
        success('Subscription updated successfully.');
      } else {
        await api.post('/hub-subscriptions', form);
        success('Subscription added successfully.');
      }
      setShowForm(false); load();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Unexpected error.';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  const sendInvoice = async (id: string) => {
    setInvoiceSending(true);
    try {
      await api.post(`/hub-subscriptions/${id}/invoice`);
      success('Invoice email triggered successfully.');
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Unexpected error.';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setInvoiceSending(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/hub-subscriptions/${deleteTarget._id}`);
      success('Subscription deleted.'); setDeleteTarget(null); load();
    } catch { error('Failed to delete.'); }
  };

  const set = (k: keyof FormData, v: string | number | boolean) => setForm(f => {
    const nextForm = { ...f, [k]: v };

    if (k === 'date' || k === 'months' || k === 'isMonthly') {
      if (nextForm.isMonthly && nextForm.months > 0) {
        nextForm.expiresAt = computeExpiry(nextForm.date, Number(nextForm.months));
      }
    }

    return nextForm;
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesText = !term || [r.name, r.sn].some((value) => value?.toString().toLowerCase().includes(term));
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
          <h1 className="text-2xl font-bold text-gray-900">Hub Subscriptions</h1>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} records</p>
        </div>
        <button onClick={openAdd}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 font-medium transition-colors">
          + Add Subscription
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">{records.length === 0 ? 'No subscriptions yet.' : 'No records match your search or date filter.'}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['User ID','Name','Email','Amount Paid','Duration','Expires','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginate(filtered, page, PER_PAGE).map((r, i) => (
                <tr key={r._id} className="hover:bg-teal-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-4 py-3">
                    <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded">{r.sn}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="px-4 py-3 text-green-700">₦{r.amountPaid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{r.duration}</td>
                  <td className="px-4 py-3 text-gray-600">{r.expiresAt}</td>
                  <td className="px-4 py-3">
                    <ActionMenu
                      onView={() => setViewing(r)}
                      onEdit={() => openEdit(r)}
                      onDelete={() => setDeleteTarget(r)}
                      onInvoice={r.isMonthly ? (() => r._id && sendInvoice(r._id)) : undefined}
                    />
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
        <ViewModal title="Subscription Details" onClose={() => setViewing(null)} fields={[
          { label: 'User ID',     value: viewing.sn },
          { label: 'Name',        value: viewing.name },
          { label: 'Email',       value: viewing.email },
          { label: 'Amount Paid', value: `₦${viewing.amountPaid.toLocaleString()}` },
          { label: 'Duration',    value: viewing.duration },
          { label: 'Monthly',     value: viewing.isMonthly ? 'Yes' : 'No' },
          { label: 'Months',      value: viewing.months?.toString() ?? '1' },
          { label: 'Date',        value: viewing.date },
          { label: 'Expires',     value: viewing.expiresAt },
        ]} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Subscription' : 'Add Subscription'} onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls} placeholder="Enter full name" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Subscriber Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className={inputCls} placeholder="name@example.com" />
            </div>
            <div>
              <label className={labelCls}>Amount Paid (₦)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9,]*"
                value={formatCurrency(form.amountPaid)}
                onChange={e => set('amountPaid', parseCurrencyInput(e.target.value))}
                className={inputCls}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)}
                className={inputCls} placeholder="e.g. 1 month" />
            </div>
            <div className="flex items-center gap-3">
              <input id="monthly" type="checkbox" checked={form.isMonthly} onChange={e => set('isMonthly', e.target.checked)} className="h-4 w-4 text-teal-600 border-gray-300 rounded" />
              <label htmlFor="monthly" className="text-sm font-medium text-gray-700">Monthly subscription</label>
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            {form.isMonthly && (
              <div>
                <label className={labelCls}>Months</label>
                <input type="number" value={form.months || ''} onChange={e => set('months', Number(e.target.value))}
                  className={inputCls} min={1} placeholder="Months" />
              </div>
            )}
            <div>
              <label className={labelCls}>Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60 min-w-[72px]">
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
