function SkeletonBox({ width = '100%', height = '14px', radius = '6px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function SkeletonTableRows({ rows = 5, cols = 6 }) {
  const widths = ['32px', '90px', '130px', '150px', '100px', '90px', '80px'];
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-row">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ padding: '1rem' }}>
              <SkeletonBox width={widths[j] || '100px'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonStatCards() {
  return (
    <div className="stats-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="stat-card" style={{ gap: '1rem' }}>
          <SkeletonBox width="50px" height="50px" radius="10px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <SkeletonBox width="55%" height="2rem" radius="6px" />
            <SkeletonBox width="75%" height="12px" radius="4px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboardTable() {
  return (
    <div className="table-wrapper" style={{ border: 'none' }}>
      <table>
        <thead>
          <tr>
            {['#', 'Employee ID', 'Name', 'Department', 'Present', 'Absent', 'Rate'].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SkeletonTableRows rows={4} cols={7} />
        </tbody>
      </table>
    </div>
  );
}
