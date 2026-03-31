import { useState } from 'react';
import { markAttendance } from '../api/attendance';

export default function AttendanceForm({ employees, onSuccess, onClose, addToast }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ employee: '', date: today, status: 'Present' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee) {
      addToast('Please select an employee.', 'error');
      return;
    }
    setLoading(true);
    try {
      await markAttendance(form);
      addToast('Attendance marked successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">📅 Mark Attendance</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="att-employee">Employee *</label>
              <select
                id="att-employee"
                name="employee"
                value={form.employee}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} – {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="att-date">Date *</label>
                <input
                  id="att-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="att-status">Status *</label>
                <select
                  id="att-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Present">✅ Present</option>
                  <option value="Absent">❌ Absent</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : '📅 Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
