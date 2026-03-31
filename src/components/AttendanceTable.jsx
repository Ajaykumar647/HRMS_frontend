import { useState } from 'react';
import { deleteAttendance } from '../api/attendance';
import { LoadingSpinner, EmptyState, ErrorState } from './States';

export default function AttendanceTable({ records, loading, error, onRefresh, onEdit, addToast }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

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

  if (loading) return <LoadingSpinner text="Loading attendance records..." />;
  if (error) return <ErrorState message={error} onRetry={onRefresh} />;
  if (!records.length) {
    return (
      <EmptyState
        icon="📅"
        title="No attendance records found"
        description="Mark attendance or adjust your filters to see records."
      />
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec.id}>
                <td className="text-muted text-sm">{idx + 1}</td>
                <td><span className="td-id">{rec.employee_emp_id}</span></td>
                <td style={{ fontWeight: 600 }}>{rec.employee_name}</td>
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
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => onEdit(rec)}
                      title="Edit attendance"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(rec.id)}
                      disabled={deletingId === rec.id}
                      title="Delete record"
                    >
                      {deletingId === rec.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setConfirmId(null)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete Record</h2>
              <button className="modal-close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete this attendance record? This action cannot be undone.
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
