import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/employees', icon: '👥', label: 'Employees' },
  { to: '/attendance', icon: '📅', label: 'Attendance' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏢</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">HRMS Lite</span>
            <span className="sidebar-logo-subtitle">HR Management System</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">HRMS Lite v1.0.0</p>
      </div>
    </aside>
  );
}
