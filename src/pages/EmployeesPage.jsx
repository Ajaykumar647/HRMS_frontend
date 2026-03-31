import { useState, useEffect } from 'react';
import { getEmployees } from '../api/employees';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeesPage({ addToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (emp) => {
    setEditEmployee(emp);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditEmployee(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${employees.length} employee${employees.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEmployee(null); setShowForm(true); }}>
          + Add Employee
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <EmployeeTable
          employees={employees}
          loading={loading}
          error={error}
          onRefresh={fetchEmployees}
          onEdit={handleEdit}
          addToast={addToast}
        />
      </div>

      {showForm && (
        <EmployeeForm
          employee={editEmployee}
          onSuccess={fetchEmployees}
          onClose={handleCloseForm}
          addToast={addToast}
        />
      )}
    </>
  );
}
