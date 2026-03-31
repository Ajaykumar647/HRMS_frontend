import { useState } from 'react';
import { markAttendance, updateAttendance } from '../api/attendance';

const today = new Date().toISOString().split('T')[0];

export default function AttendanceForm({ record, employees, onSuccess, onClose, addToast }) {
  const isEdit = Boolean(record);

  const [form, setForm] = useState({
    employee: record?.employee ?? '',
    date: record?.date ?? today,
    status: record?.status ?? 'Present',
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedEmp = employees.find((e) => String(e.id) === String(form.employee));

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectEmployee = (emp) => {
    setForm((prev) => ({ ...prev, employee: emp.id }));
    setSearch('');
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee) {
      addToast('Please select an employee.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateAttendance(record.id, { status: form.status, date: form.date });
        addToast('Attendance updated successfully!', 'success');
      } else {
        await markAttendance(form);
        addToast('Attendance marked successfully!', 'success');
      }
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
          <h2 className="modal-title">{isEdit ? '✏️ Edit Attendance' : '📅 Mark Attendance'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* Employee Selector */}
            <div className="form-group">
              <label>Employee *</label>
              {isEdit ? (
                <div className="emp-selected-box">
                  <div className="emp-avatar">{record.employee_name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="emp-selected-name">{record.employee_name}</div>
                    <div className="emp-selected-meta">{record.employee_emp_id} · {record.employee_department}</div>
                  </div>
                </div>
              ) : (
                <div className="emp-dropdown-wrapper">
                  {/* Trigger */}
                  <button
                    type="button"
                    className={`emp-dropdown-trigger ${dropdownOpen ? 'open' : ''}`}
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    {selectedEmp ? (
                      <div className="emp-trigger-selected">
                        <div className="emp-avatar sm">{selectedEmp.full_name[0].toUpperCase()}</div>
                        <div>
                          <span className="emp-trigger-name">{selectedEmp.full_name}</span>
                          <span className="emp-trigger-meta">{selectedEmp.employee_id} · {selectedEmp.department}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="emp-trigger-placeholder">— Select Employee —</span>
                    )}
                    <span className="emp-dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="emp-dropdown-panel">
                      <div className="emp-search-box">
                        <span className="emp-search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="Search by name, ID or department..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          autoFocus
                          className="emp-search-input"
                        />
                      </div>
                      <div className="emp-list">
                        {filtered.length === 0 ? (
                          <div className="emp-no-results">No employees found</div>
                        ) : (
                          filtered.map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              className={`emp-option ${String(form.employee) === String(emp.id) ? 'selected' : ''}`}
                              onClick={() => handleSelectEmployee(emp)}
                            >
                              <div className="emp-avatar sm">{emp.full_name[0].toUpperCase()}</div>
                              <div className="emp-option-info">
                                <span className="emp-option-name">{emp.full_name}</span>
                                <span className="emp-option-meta">{emp.employee_id} · {emp.department}</span>
                              </div>
                              {String(form.employee) === String(emp.id) && <span className="emp-check">✓</span>}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="att-date">Date *</label>
                <input
                  id="att-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <div className="status-toggle">
                  <button
                    type="button"
                    className={`status-btn present ${form.status === 'Present' ? 'active' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, status: 'Present' }))}
                  >
                    ✅ Present
                  </button>
                  <button
                    type="button"
                    className={`status-btn absent ${form.status === 'Absent' ? 'active' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, status: 'Absent' }))}
                  >
                    ❌ Absent
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : isEdit ? '💾 Save Changes' : '📅 Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
