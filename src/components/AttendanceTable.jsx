import { useState, useMemo } from 'react';
import { deleteAttendance } from '../api/attendance';
import { SkeletonTableRows } from './Skeleton';
import { EmptyState, ErrorState } from './States';

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="sort-icon neutral">↕</span>;
  return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export default function AttendanceTable({ records, loading, error, onRefresh, onEdit, addToast }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => {
      let av = a[sortField] ?? '';
      let bv = b[sortField] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortField, sortDir]);

  const exportCSV = () => {
    const headers = ['#', 'Employee ID', 'Full Name', 'Department', 'Date', 'Status'];
    const rows = sorted.map((r, i) => [
      i + 1,
      r.employee_emp_id,
      `"${r.employee_name}"`,
      r.employee_department,
      r.date,
      r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (id) => setConfirmId(id);

  const handleConfirmDelete = async () => {
    setDeletingId(confirmId);
    setConfirmId(null);
    try {
      await deleteAttendance(confirmId);
      addToast('Attendance record deleted.', 'success');
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
      {/* Toolbar */}
      <div className="table-toolbar">
        <span className="table-toolbar-info">
          {loading ? '' : `${records.length} record${records.length !== 1 ? 's' : ''}`}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={exportCSV}
            disabled={loading || records.length === 0}
            title="Export to CSV"
          >
            ⬇️ Export CSV
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()} title="Print report">
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="table-wrapper" style={{ borderTop: '1px solid var(--border)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th className="sortable" onClick={() => handleSort('employee_emp_id')}>
                Employee ID <SortIcon field="employee_emp_id" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('employee_name')}>
                Name <SortIcon field="employee_name" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('employee_department')}>
                Department <SortIcon field="employee_department" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('date')}>
                Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="sortable" onClick={() => handleSort('status')}>
                Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTableRows rows={6} cols={7} />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                  <EmptyState
                    icon="📅"
                    title="No attendance records found"
                    description="Mark attendance or adjust your filters."
                  />
                </td>
              </tr>
            ) : (
              sorted.map((rec, idx) => (
                <tr key={rec.id}>
                  <td className="text-muted text-sm">{idx + 1}</td>
                  <td><span className="td-id">{rec.employee_emp_id}</span></td>
                  <td>
                    <div className="emp-name-cell">
                      <div className="emp-avatar sm">{rec.employee_name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{rec.employee_name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-dept">{rec.employee_department}</span></td>
                  <td className="text-muted">
                    {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className={`badge badge-${rec.status.toLowerCase()}`}>
                      {rec.status === 'Present' ? '✅' : '❌'} {rec.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-warning btn-sm" onClick={() => onEdit(rec)}>✏️ Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(rec.id)}
                        disabled={deletingId === rec.id}
                      >
                        {deletingId === rec.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && sorted.length > 0 && (
        <div className="table-footer print-hide">
          Showing {sorted.length} record{sorted.length !== 1 ? 's' : ''}
        </div>
      )}

      {confirmId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete Record</h2>
              <button className="modal-close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">Are you sure you want to delete this attendance record? This cannot be undone.</p>
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
