import { useState, useEffect } from 'react';
import { getEmployees } from '../api/employees';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeesPage({ addToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${employees.length} employee${employees.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Employee
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <EmployeeTable
          employees={employees}
          loading={loading}
          error={error}
          onRefresh={fetchEmployees}
          addToast={addToast}
        />
      </div>

      {showForm && (
        <EmployeeForm
          onSuccess={fetchEmployees}
          onClose={() => setShowForm(false)}
          addToast={addToast}
        />
      )}
    </>
  );
}
