import { useState, useEffect } from 'react';
import { getDashboard } from '../api/attendance';
import { LoadingSpinner, ErrorState } from '../components/States';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const { summary, employee_stats } = data;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your workforce for today</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchDashboard}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue">👥</div>
          <div className="stat-body">
            <div className="stat-value">{summary.total_employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">✅</div>
          <div className="stat-body">
            <div className="stat-value">{summary.present_today}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red">❌</div>
          <div className="stat-body">
            <div className="stat-value">{summary.absent_today}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">🕐</div>
          <div className="stat-body">
            <div className="stat-value">{summary.not_marked_today}</div>
            <div className="stat-label">Not Marked Today</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Employee Attendance Summary
            </h2>
            <p className="page-subtitle">Total present &amp; absent days per employee</p>
          </div>
        </div>

        {employee_stats.length === 0 ? (
          <p className="text-muted text-sm" style={{ padding: '2rem', textAlign: 'center' }}>
            No employees found. Add employees to see stats.
          </p>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {employee_stats.map((emp, idx) => {
                  const total = emp.total_present + emp.total_absent;
                  const rate = total > 0 ? Math.round((emp.total_present / total) * 100) : 0;
                  return (
                    <tr key={emp.id}>
                      <td className="text-muted text-sm">{idx + 1}</td>
                      <td><span className="td-id">{emp.employee_id}</span></td>
                      <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                      <td><span className="badge badge-dept">{emp.department}</span></td>
                      <td>
                        <span className="badge badge-present">{emp.total_present} days</span>
                      </td>
                      <td>
                        <span className={`badge ${emp.total_absent > 0 ? 'badge-absent' : 'badge-present'}`}>
                          {emp.total_absent} days
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1, height: 6, background: 'var(--bg-hover)',
                            borderRadius: 100, overflow: 'hidden', minWidth: 60,
                          }}>
                            <div style={{
                              width: `${rate}%`, height: '100%',
                              background: rate >= 75 ? 'var(--success-light)' : rate >= 50 ? 'var(--warning-light)' : 'var(--danger-light)',
                              borderRadius: 100, transition: 'width 0.4s ease',
                            }} />
                          </div>
                          <span className="text-sm text-muted">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
