import { useState } from 'react';
import { createEmployee, updateEmployee } from '../api/employees';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'Human Resources', 'Finance', 'Operations',
  'Customer Support', 'Legal', 'IT', 'Other',
];

export default function EmployeeForm({ employee, onSuccess, onClose, addToast }) {
  const isEdit = Boolean(employee);

  const [form, setForm] = useState({
    employee_id: employee?.employee_id || '',
    full_name: employee?.full_name || '',
    email: employee?.email || '',
    department: employee?.department || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateEmployee(employee.id, form);
        addToast('Employee updated successfully!', 'success');
      } else {
        await createEmployee(form);
        addToast('Employee added successfully!', 'success');
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
          <h2 className="modal-title">
            {isEdit ? '✏️ Edit Employee' : '➕ Add New Employee'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="employee_id">Employee ID *</label>
                <input
                  id="employee_id"
                  name="employee_id"
                  type="text"
                  placeholder="e.g. EMP001"
                  value={form.employee_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="e.g. Jane Smith"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="e.g. jane.smith@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? (isEdit ? '⏳ Saving...' : '⏳ Adding...')
                : (isEdit ? '💾 Save Changes' : '✅ Add Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
