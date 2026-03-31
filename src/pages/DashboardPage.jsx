import { useState, useEffect } from 'react';
import { getDashboard } from '../api/attendance';
import { ErrorState } from '../components/States';
import { SkeletonStatCards, SkeletonDashboardTable } from '../components/Skeleton';

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

  useEffect(() => { fetchDashboard(); }, []);

  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const { summary, employee_stats } = data || {};

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your workforce for today</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchDashboard} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <SkeletonStatCards />
      ) : (
        <div className="stats-grid">
          {[
            { color: 'blue',   icon: '👥', value: summary.total_employees,  label: 'Total Employees'  },
            { color: 'green',  icon: '✅', value: summary.present_today,     label: 'Present Today'   },
            { color: 'red',    icon: '❌', value: summary.absent_today,      label: 'Absent Today'    },
            { color: 'purple', icon: '🕐', value: summary.not_marked_today,  label: 'Not Marked Today'},
          ].map(({ color, icon, value, label }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className={`stat-icon ${color}`}>{icon}</div>
              <div className="stat-body">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Employee Attendance Summary
            </h2>
            <p className="page-subtitle">Total present &amp; absent days per employee</p>
          </div>
          {!loading && employee_stats?.length > 0 && (
            <span className="badge badge-dept">{employee_stats.length} employees</span>
          )}
        </div>

        {loading ? (
          <SkeletonDashboardTable />
        ) : employee_stats?.length === 0 ? (
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
                      <td>
                        <div className="emp-name-cell">
                          <div className="emp-avatar sm">{emp.full_name[0].toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{emp.full_name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-dept">{emp.department}</span></td>
                      <td><span className="badge badge-present">✅ {emp.total_present} days</span></td>
                      <td>
                        <span className={`badge ${emp.total_absent > 0 ? 'badge-absent' : 'badge-present'}`}>
                          {emp.total_absent > 0 ? '❌' : '✅'} {emp.total_absent} days
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${rate}%`,
                                background: rate >= 75 ? 'var(--success-light)' : rate >= 50 ? 'var(--warning-light)' : 'var(--danger-light)',
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted" style={{ minWidth: 32 }}>{rate}%</span>
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
