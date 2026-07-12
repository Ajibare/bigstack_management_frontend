'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import api, { Staff, STAFF_STATUSES, Course, Role } from '@/lib/api';
import Modal from '@/components/Modal';
import ViewModal from '@/components/ViewModal';
import DeleteConfirm from '@/components/DeleteConfirm';
import ActionMenu from '@/components/ActionMenu';
import Spinner from '@/components/Spinner';
import { ToastContainer, useToast } from '@/components/Toast';
import Pagination, { paginate } from '@/components/Pagination';
import axios from 'axios';

const PER_PAGE = 10;

const emptyForm = {
  firstName: '',
  lastName: '',
  role: '',
  assignedClasses: '',
  phone: '',
  email: '',
  address: '',
  status: 'Active',
  date: new Date().toISOString().slice(0, 10),
};
type FormData = typeof emptyForm;

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

const statusBadge: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-200 text-gray-700',
  Suspended: 'bg-red-100 text-red-700',
};

const roleBadge: Record<string, string> = {
  Tutor: 'bg-blue-100 text-blue-700',
  'Class Teacher': 'bg-indigo-100 text-indigo-700',
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-yellow-100 text-yellow-700',
  Receptionist: 'bg-pink-100 text-pink-700',
  Accountant: 'bg-emerald-100 text-emerald-700',
  'IT Support': 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function StaffPage() {
  const [records, setRecords]   = useState<Staff[]>([]);
  const [courses, setCourses]   = useState<Course[]>([]);
  const [roles, setRoles]       = useState<Role[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [viewing, setViewing]   = useState<Staff | null>(null);
  const [editing, setEditing]   = useState<Staff | null>(null);
  const [form, setForm]         = useState<FormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [saving, setSaving]     = useState(false);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [newRoleName, setNewRoleName] = useState('');
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const coursesDropdownRef = useRef<HTMLDivElement>(null);
  const { toasts, remove, success, error } = useToast();

  const load = () => {
    setLoading(true);
    setPage(1);
    Promise.all([api.get<Staff[]>('/staff'), api.get<Course[]>('/courses'), api.get<Role[]>('/roles')])
      .then(([s, c, r]) => {
        setRecords(s.data);
        setCourses(c.data);
        setRoles(r.data);
      })
      .catch(() => error('Failed to load data.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Close courses dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(e.target as Node)) {
        setShowCoursesDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (r: Staff) => {
    setEditing(r);
    setForm({
      firstName: r.firstName,
      lastName: r.lastName,
      role: r.role,
      assignedClasses: r.assignedClasses ?? '',
      phone: r.phone ?? '',
      email: r.email ?? '',
      address: r.address ?? '',
      status: r.status ?? 'Active',
      date: r.date,
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing?._id) {
        await api.put(`/staff/${editing._id}`, form);
        success('Staff updated successfully.');
      } else {
        await api.post('/staff', form);
        success('Staff registered successfully.');
      }
      setShowForm(false);
      load();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message)
        : 'Unexpected error occurred.';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      await api.delete(`/staff/${deleteTarget._id}`);
      success('Staff removed.');
      setDeleteTarget(null);
      load();
    } catch {
      error('Failed to delete staff.');
    }
  };

  const addRole = async () => {
    if (!newRoleName.trim()) {
      error('Role name is required');
      return;
    }
    try {
      await api.post('/roles', { name: newRoleName.trim() });
      success('Role added successfully');
      setNewRoleName('');
      setShowRoleModal(false);
      load();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Failed to add role';
      error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const set = (k: keyof FormData, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      const matchesText =
        !term ||
        fullName.includes(term) ||
        r.role.toLowerCase().includes(term) ||
        (r.assignedClasses ?? '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'All' || r.role === roleFilter;
      return matchesText && matchesRole;
    });
  }, [records, search, roleFilter]);

  const fullName = (r: Staff) => `${r.firstName} ${r.lastName}`;

  return (
    <div className="bg-white min-h-full">
      <ToastContainer toasts={toasts} remove={remove} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {records.length} {records.length === 1 ? 'record' : 'records'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700 font-medium transition-colors"
        >
          + Add Staff
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, or class..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="All">All roles</option>
          {roles.map((r) => (
            <option key={r._id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          {records.length === 0
            ? 'No staff registered yet. Add the first one.'
            : 'No staff match your filters.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {[
                  'Staff ID',
                  'Name',
                  'Role',
                  'Assigned Classes',
                  'Phone',
                  'Status',
                  'Date',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginate(filtered, page, PER_PAGE).map((r, i) => (
                <tr
                  key={r._id}
                  className="hover:bg-pink-50/40 transition-colors row-animate bg-white"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-0.5 rounded">
                      {r.sn}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {fullName(r)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        roleBadge[r.role] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {r.assignedClasses || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        statusBadge[r.status ?? 'Active'] ??
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.status ?? 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
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
            <Pagination
              total={filtered.length}
              page={page}
              perPage={PER_PAGE}
              onPage={setPage}
            />
          </div>
        </div>
      )}

      {/* View modal */}
      {viewing && (
        <ViewModal
          title="Staff Details"
          onClose={() => setViewing(null)}
          fields={[
            { label: 'Staff ID',         value: viewing.sn },
            { label: 'First Name',       value: viewing.firstName },
            { label: 'Last Name',        value: viewing.lastName },
            { label: 'Role',             value: viewing.role },
            { label: 'Assigned Classes', value: viewing.assignedClasses || '—' },
            { label: 'Phone',            value: viewing.phone || '—' },
            { label: 'Email',            value: viewing.email || '—' },
            { label: 'Address',          value: viewing.address || '—' },
            { label: 'Status',           value: viewing.status ?? 'Active' },
            { label: 'Date Registered',  value: viewing.date },
          ]}
        />
      )}

      {/* Form modal */}
      {showForm && (
        <Modal
          title={editing ? 'Edit Staff' : 'Register Staff'}
          onClose={() => setShowForm(false)}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className={inputCls}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className={inputCls}
                placeholder="Last name"
              />
            </div>
            <div>
              <label className={labelCls}>Role *</label>
              <div className="flex gap-2">
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select a role —</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(true)}
                  className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
                  title="Add new role"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={inputCls}
              >
                {STAFF_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>
                Assigned Courses
              </label>
              {courses.length === 0 ? (
                <input
                  type="text"
                  value={form.assignedClasses}
                  onChange={(e) => set('assignedClasses', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Full-Stack Web Development, Mobile App"
                />
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const dropdown = document.getElementById('courses-dropdown');
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                      }
                    }}
                    className={`${inputCls} text-left flex justify-between items-center`}
                  >
                    <span>
                      {form.assignedClasses
                        ? `${form.assignedClasses.split(',').length} course(s) selected`
                        : 'Select courses...'}
                    </span>
                    <span className="text-gray-400">▼</span>
                  </button>
                  <div
                    id="courses-dropdown"
                    className="hidden absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {courses.map((c) => (
                      <label
                        key={c._id}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.assignedClasses
                            .split(',')
                            .map((s) => s.trim())
                            .includes(c.name)}
                          onChange={(e) => {
                            const current = form.assignedClasses
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            if (e.target.checked) {
                              current.push(c.name);
                            } else {
                              const idx = current.indexOf(c.name);
                              if (idx > -1) current.splice(idx, 1);
                            }
                            set('assignedClasses', current.join(', '));
                          }}
                          className="mr-2"
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className={inputCls}
                placeholder="08012345678"
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={inputCls}
                placeholder="staff@example.com"
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className={inputCls}
                placeholder="Street, City"
              />
            </div>
            <div>
              <label className={labelCls}>Date Registered *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Register'}
            </button>
          </div>
        </Modal>
      )}

      {showRoleModal && (
        <Modal title="Add New Role" onClose={() => setShowRoleModal(false)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Role Name *</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Sales Manager"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addRole}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
              >
                Add Role
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          onConfirm={doDelete}
          onCancel={() => setDeleteTarget(null)}
          itemName={fullName(deleteTarget)}
        />
      )}
    </div>
  );
}
