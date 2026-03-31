import { useState, useEffect } from 'react';
import { getAttendance } from '../api/attendance';
import { getEmployees } from '../api/employees';
import AttendanceTable from '../components/AttendanceTable';
import AttendanceForm from '../components/AttendanceForm';

export default function AttendancePage({ addToast }) {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterEmployee) params.employee = filterEmployee;
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      const res = await getAttendance(params);
      setRecords(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch {
      // employees list is only for filter/form dropdowns; silent fail
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filterEmployee, filterDate, filterStatus]);

  const clearFilters = () => {
    setFilterEmployee('');
    setFilterDate('');
    setFilterStatus('');
  };

  const hasFilters = filterEmployee || filterDate || filterStatus;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${records.length} record${records.length !== 1 ? 's' : ''}${hasFilters ? ' (filtered)' : ''}`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Mark Attendance
        </button>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Employee</label>
          <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_id} – {emp.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
        <div className="filter-actions">
          {hasFilters && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <AttendanceTable
          records={records}
          loading={loading}
          error={error}
          onRefresh={fetchAttendance}
        />
      </div>

      {showForm && (
        <AttendanceForm
          employees={employees}
          onSuccess={fetchAttendance}
          onClose={() => setShowForm(false)}
          addToast={addToast}
        />
      )}
    </>
  );
}
