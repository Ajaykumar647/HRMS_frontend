import { LoadingSpinner, EmptyState, ErrorState } from './States';

export default function AttendanceTable({ records, loading, error, onRefresh }) {
  if (loading) return <LoadingSpinner text="Loading attendance records..." />;
  if (error) return <ErrorState message={error} onRetry={onRefresh} />;
  if (!records.length) {
    return (
      <EmptyState
        icon="📅"
        title="No attendance records found"
        description="Mark attendance or adjust your filter to see records."
      />
    );
  }

  return (
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
          </tr>
        </thead>
        <tbody>
          {records.map((rec, idx) => (
            <tr key={rec.id}>
              <td className="text-muted text-sm">{idx + 1}</td>
              <td><span className="td-id">{rec.employee_emp_id}</span></td>
              <td style={{ fontWeight: 500 }}>{rec.employee_name}</td>
              <td><span className="badge badge-dept">{rec.employee_department}</span></td>
              <td className="text-muted">
                {new Date(rec.date).toLocaleDateString('en-IN', {
                  weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                })}
              </td>
              <td>
                <span className={`badge badge-${rec.status.toLowerCase()}`}>
                  {rec.status === 'Present' ? '✅' : '❌'} {rec.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
