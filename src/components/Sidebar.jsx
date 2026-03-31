import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getEmployees } from '../api/employees';

export default function Sidebar({ isOpen, onClose }) {
  const [empCount, setEmpCount] = useState(null);

  useEffect(() => {
    getEmployees()
      .then((r) => setEmpCount(r.data.length))
      .catch(() => {});
  }, []);

  const navItems = [
    { to: '/', icon: '📊', label: 'Dashboard', end: true },
    { to: '/employees', icon: '👥', label: 'Employees', badge: empCount },
    { to: '/attendance', icon: '📅', label: 'Attendance' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏢</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">HRMS Lite</span>
            <span className="sidebar-logo-subtitle">HR Management System</span>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} title="Close menu">✕</button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
            {badge !== null && badge !== undefined && (
              <span className="nav-badge">{badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-avatar">A</div>
          <div>
            <div className="sidebar-footer-name">Admin</div>
            <div className="sidebar-footer-role">HR Manager</div>
          </div>
        </div>
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  );
}
