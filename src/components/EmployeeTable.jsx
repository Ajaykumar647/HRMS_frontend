import { useState } from 'react';
import { deleteEmployee } from '../api/employees';
import { LoadingSpinner, EmptyState, ErrorState } from './States';

export default function EmployeeTable({ employees, loading, error, onRefresh, onEdit, addToast }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmName, setConfirmName] = useState('');

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

  if (loading) return <LoadingSpinner text="Loading employees..." />;
  if (error) return <ErrorState message={error} onRetry={onRefresh} />;
  if (!employees.length) {
    return (
      <EmptyState
        icon="👥"
        title="No employees yet"
        description="Add your first employee to get started."
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
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={emp.id}>
                <td className="text-muted text-sm">{idx + 1}</td>
                <td><span className="td-id">{emp.employee_id}</span></td>
                <td style={{ fontWeight: 600 }}>{emp.full_name}</td>
                <td className="text-muted">{emp.email}</td>
                <td><span className="badge badge-dept">{emp.department}</span></td>
                <td className="text-muted text-sm">
                  {new Date(emp.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => onEdit(emp)}
                      title="Edit employee"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(emp)}
                      disabled={deletingId === emp.id}
                      title="Delete employee"
                    >
                      {deletingId === emp.id ? '⏳' : '🗑️ Delete'}
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
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Confirm Delete</h2>
              <button className="modal-close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Are you sure you want to delete{' '}
                <span className="confirm-name">{confirmName}</span>?{' '}
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
