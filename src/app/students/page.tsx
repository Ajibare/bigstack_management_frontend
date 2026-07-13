'use client';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import api, { Student, Course } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import axios from 'axios';
import Pagination, { paginate } from '@/components/Pagination';

const PER_PAGE = 10;

const emptyForm = {
  name: '', course: '', tutor: '', amountPaid: 0, balance: 0,
  feeToPay: 0, duration: '', date: new Date().toISOString().slice(0, 10),
  completed: false, certificateIssued: false,
};
type FormData = typeof emptyForm;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function StudentsPage() {
  const [records, setRecords]       = useState<Student[]>([]);
  const [courses, setCourses]       = useState<Course[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [viewing, setViewing]       = useState<Student | null>(null);
  const [editing, setEditing]       = useState<Student | null>(null);
  const [form, setForm]             = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [saving, setSaving]         = useState(false);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [fromDate, setFromDate]     = useState('');
  const [toDate, setToDate]         = useState('');
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    setPage(1);
    Promise.all([api.get<Student[]>('/students'), api.get<Course[]>('/courses')])
      .then(([s, c]) => { setRecords(s.data); setCourses(c.data); })
      .catch(() => error('Failed to load data.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (r: Student) => {
    setEditing(r);
    setForm({ 
      name: r.name, course: r.course, tutor: r.tutor, amountPaid: r.amountPaid,
      balance: r.balance, feeToPay: r.feeToPay, duration: r.duration, date: r.date,
      completed: r.completed ?? false, certificateIssued: r.certificateIssued ?? false
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?._id) {
        await api.put(`/students/${editing._id}`, form);
        success('Student updated successfully.');
      } else {
        await api.post('/students', form);
        success('Student registered successfully.');
      }
      setShowForm(false);
      load();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message)
        : 'Unexpected error occurred.';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/students/${deleteTarget._id}`);
      success('Student deleted.');
      setDeleteTarget(null);
      load();
    } catch { error('Failed to delete student.'); }
  };

  const set = (k: keyof FormData, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  const setCourse = (courseName: string) => {
    const selected = courses.find(c => c.name === courseName);
    setForm(f => ({
      ...f,
      course: courseName,
      feeToPay: selected?.price ?? f.feeToPay,
      duration: selected?.duration ?? f.duration,
    }));
  };

  const courseOptions = courses.map((c) => ({ value: c.name, label: c.name, course: c }));

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesText = !term || [r.name, r.course, r.tutor, r.sn].some((value) => value?.toString().toLowerCase().includes(term));
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regular Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} records</p>
        </div>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium transition-colors">
          + Add Student
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, course, tutor or ID" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">{records.length === 0 ? 'No records yet. Add the first student.' : 'No records match your search or date filter.'}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['Student ID','Name','Course','Tutor','Fee','Paid','Balance','Duration','Date','Completed','Certificate',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginate(filtered, page, PER_PAGE).map((r, i) => (
                <tr key={r._id} className="hover:bg-blue-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">{r.sn}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.course}</td>
                  <td className="px-4 py-3 text-gray-600">{r.tutor}</td>
                  <td className="px-4 py-3">₦{r.feeToPay.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-700">₦{r.amountPaid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-600">₦{r.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{r.duration}</td>
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
                    <ActionMenu
                      onView={() => setViewing(r)}
                      onEdit={() => openEdit(r)}
                      onDelete={() => setDeleteTarget(r)}
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

      {/* View modal */}
      {viewing && (
        <ViewModal title="Student Details" onClose={() => setViewing(null)} fields={[
          { label: 'Student ID',  value: viewing.sn },
          { label: 'Name',        value: viewing.name },
          { label: 'Course',      value: viewing.course },
          { label: 'Tutor',       value: viewing.tutor },
          { label: 'Fee to Pay',  value: `₦${viewing.feeToPay.toLocaleString()}` },
          { label: 'Amount Paid', value: `₦${viewing.amountPaid.toLocaleString()}` },
          { label: 'Balance',     value: `₦${viewing.balance.toLocaleString()}` },
          { label: 'Duration',    value: viewing.duration },
          { label: 'Date',        value: viewing.date },
          { label: 'Completed',   value: viewing.completed ? 'Yes' : 'No' },
          { label: 'Certificate', value: viewing.certificateIssued ? 'Issued' : 'Pending' },
        ]} />
      )}

      {/* Form modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Student' : 'Register Student'} onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className={inputCls} placeholder="Enter full name" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Course</label>
              {courses.length === 0 ? (
                <p className="text-xs text-red-500 mt-1">No courses found. Add courses first.</p>
              ) : (
                <Select
                  options={courseOptions}
                  value={courseOptions.find((option) => option.value === form.course) ?? null}
                  onChange={(option) => setCourse(option ? option.value : '')}
                  isClearable
                  placeholder="Select or search course"
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              )}
            </div>
            <div>
              <label className={labelCls}>Tutor</label>
              <input type="text" value={form.tutor} onChange={e => set('tutor', e.target.value)}
                className={inputCls} placeholder="Tutor name" />
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)}
                className={inputCls} placeholder="e.g. 3 months" />
            </div>
            <div>
              <label className={labelCls}>Fee to Pay (₦)</label>
              <input type="number" value={form.feeToPay || ''} onChange={e => set('feeToPay', Number(e.target.value))}
                className={inputCls} min={0} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Amount Paid (₦)</label>
              <input type="number" value={form.amountPaid || ''} onChange={e => set('amountPaid', Number(e.target.value))}
                className={inputCls} min={0} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Balance (₦)</label>
              <input type="number" value={form.balance || ''} onChange={e => set('balance', Number(e.target.value))}
                className={inputCls} min={0} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            {editing && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.completed}
                      onChange={(e) => set('completed', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60 min-w-[72px]">
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
