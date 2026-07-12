'use client';
import { useEffect, useState } from 'react';
import api, { Course } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import Pagination, { paginate } from '@/components/Pagination';
import axios from 'axios';

const empty: Course = { name: '', description: '', price: 0, duration: '' };

const PER_PAGE = 10;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export default function CoursesPage() {
  const [records, setRecords]           = useState<Course[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [viewing, setViewing]           = useState<Course | null>(null);
  const [editing, setEditing]           = useState<Course | null>(null);
  const [form, setForm]                 = useState<Course>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [saving, setSaving]             = useState(false);
  const [page, setPage]                 = useState(1);
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    api.get<Course[]>('/courses')
      .then(r => setRecords(r.data))
      .catch(() => error('Failed to load courses.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setShowForm(true); };
  const openEdit = (r: Course) => { setEditing(r); setForm({ ...r }); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?._id) {
        await api.put(`/courses/${editing._id}`, form);
        success('Course updated successfully.');
      } else {
        await api.post('/courses', form);
        success('Course created successfully.');
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
      await api.delete(`/courses/${deleteTarget._id}`);
      success('Course deleted.'); setDeleteTarget(null); load();
    } catch { error('Failed to delete course.'); }
  };

  return (
    <div className="bg-white min-h-full">
      <ToastContainer toasts={toasts} remove={remove} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm mt-0.5">{records.length} courses registered</p>
        </div>
        <button onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium transition-colors">
          + Add Course
        </button>
      </div>

      {loading ? <Spinner /> : records.length === 0 ? (
        <div className="text-center py-24 text-gray-400">No courses yet. Add one to get started.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['#','Course Name','Description','Price','Duration',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginate(records, page, PER_PAGE).map((r, i) => (
                <tr key={r._id} className="hover:bg-indigo-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.description || '—'}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">{r.price ? `₦${Number(r.price).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.duration || '—'}</td>
                  <td className="px-4 py-3">
                    <ActionMenu onView={() => setViewing(r)} onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination total={records.length} page={page} perPage={PER_PAGE} onPage={setPage} />
          </div>
        </div>
      )}

      {viewing && (
        <ViewModal title="Course Details" onClose={() => setViewing(null)} fields={[
          { label: 'Course Name',  value: viewing.name },
          { label: 'Description',  value: viewing.description },
          { label: 'Price',        value: viewing.price ? `₦${Number(viewing.price).toLocaleString()}` : '—' },
          { label: 'Duration',     value: viewing.duration },
        ]} />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Course' : 'Add Course'} onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Course Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className={inputCls} placeholder="e.g. Web Development" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })}
                className={inputCls} placeholder="Short description" />
            </div>
            <div>
              <label className={labelCls}>Course Price (₦)</label>
              <input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className={inputCls} min={0} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input type="text" value={form.duration ?? ''} onChange={e => setForm({ ...form, duration: e.target.value })}
                className={inputCls} placeholder="e.g. 3 months" />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving || !form.name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60 min-w-[72px]">
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
