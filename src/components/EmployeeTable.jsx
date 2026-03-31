import { useState, useMemo } from 'react';
import { deleteEmployee } from '../api/employees';
import { markAttendance } from '../api/attendance';
import { SkeletonTableRows } from './Skeleton';
import { EmptyState, ErrorState } from './States';

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="sort-icon neutral">↕</span>;
  return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

const today = new Date().toISOString().split('T')[0];

export default function EmployeeTable({ employees, loading, error, onRefresh, onEdit, addToast }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmName, setConfirmName] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkDate, setBulkDate] = useState(today);
  const [bulkStatus, setBulkStatus] = useState('Present');
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.employee_id.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortField] ?? '';
      let bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const allSelected = sorted.length > 0 && sorted.every((e) => selected.includes(e.id));

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(allSelected ? [] : sorted.map((e) => e.id));

  const handleBulkMark = async () => {
    setBulkLoading(true);
    let success = 0, failed = 0;
    for (const id of selected) {
      try {
        await markAttendance({ employee: id, date: bulkDate, status: bulkStatus });
        success++;
      } catch {
        failed++;
      }
    }
    setBulkLoading(false);
    setBulkModal(false);
    setSelected([]);
    if (success > 0) addToast(`${success} attendance record${success > 1 ? 's' : ''} marked as ${bulkStatus}.`, 'success');
    if (failed > 0) addToast(`${failed} record${failed > 1 ? 's' : ''} already marked or failed.`, 'error');
  };

  const handleDeleteClick = (emp) => {
    setConfirmId(emp.id);
    setConfirmName(emp.full_name);
  };

  const handleConfirmDelete = async () => {
    setDeletingId(confirmId);
    setConfirmId(null);
    try {
      await deleteEmployee(confirmId);
      addToast('Employee deleted successfully.', 'success');
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={onRefresh} />;

  return (
    <>
      {/* Search bar */}
      <div className="table-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search name, ID, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        {search && (
          <span className="search-results-count">
            {filtered.length} / {employees.length}
          </span>
        )}
        <span className="table-toolbar-info" style={{ marginLeft: 'auto' }}>
          {!loading && `${employees.length} total`}
        </span>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selected.length} employee{selected.length > 1 ? 's' : ''} selected</span>
          <button className="btn btn-primary btn-sm" onClick={() => setBulkModal(true)}>
            📅 Mark Attendance
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      )}

      <div className="table-wrapper" style={{ borderRadius: selected.length > 0 ? '0 0 var(--radius-lg) var(--radius-lg)' : undefined }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent)' }} />
              </th>
              <th>#</th>
              <th className="sortable" onClick={() => handleSort('employee_id')}>
                Employee ID <SortIcon field="employee_id" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('full_name')}>
                Full Name <SortIcon field="full_name" sortField={sortField} sortDir={sortDir} />
              </th>
              <th>Email</th>
              <th className="sortable" onClick={() => handleSort('department')}>
                Department <SortIcon field="department" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('created_at')}>
                Joined <SortIcon field="created_at" sortField={sortField} sortDir={sortDir} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTableRows rows={5} cols={8} />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                  {search ? (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <p className="empty-title">No results for "{search}"</p>
                      <p className="empty-desc">Try a different name, ID, or department.</p>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')} style={{ marginTop: '0.5rem' }}>
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <EmptyState icon="👥" title="No employees yet" description="Add your first employee to get started." />
                  )}
                </td>
              </tr>
            ) : (
              sorted.map((emp, idx) => (
                <tr key={emp.id} className={selected.includes(emp.id) ? 'row-selected' : ''}>
                  <td>
                    <input type="checkbox" checked={selected.includes(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent)' }} />
                  </td>
                  <td className="text-muted text-sm">{idx + 1}</td>
                  <td><span className="td-id">{emp.employee_id}</span></td>
                  <td>
                    <div className="emp-name-cell">
                      <div className="emp-avatar sm">{emp.full_name[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{emp.email}</td>
                  <td><span className="badge badge-dept">{emp.department}</span></td>
                  <td className="text-muted text-sm">
                    {new Date(emp.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-warning btn-sm" onClick={() => onEdit(emp)}>✏️ Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(emp)}
                        disabled={deletingId === emp.id}
                      >
                        {deletingId === emp.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {!loading && sorted.length > 0 && (
        <div className="table-footer">
          Showing {sorted.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Bulk Mark Modal */}
      {bulkModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setBulkModal(false)}>
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 className="modal-title">📅 Bulk Mark Attendance</h2>
              <button className="modal-close" onClick={() => setBulkModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text" style={{ marginBottom: '0.5rem' }}>
                Marking attendance for <strong>{selected.length} employee{selected.length > 1 ? 's' : ''}</strong>
              </p>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <div className="status-toggle">
                  <button type="button"
                    className={`status-btn present ${bulkStatus === 'Present' ? 'active' : ''}`}
                    onClick={() => setBulkStatus('Present')}>
                    ✅ Present
                  </button>
                  <button type="button"
                    className={`status-btn absent ${bulkStatus === 'Absent' ? 'active' : ''}`}
                    onClick={() => setBulkStatus('Absent')}>
                    ❌ Absent
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setBulkModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBulkMark} disabled={bulkLoading}>
                {bulkLoading ? '⏳ Marking...' : `✅ Mark ${selected.length} Employee${selected.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Confirm Delete</h2>
              <button className="modal-close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete <span className="confirm-name">{confirmName}</span>?{' '}
                This will also remove all their attendance records and cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>🗑️ Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
