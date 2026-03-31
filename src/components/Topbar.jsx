import { useLocation } from 'react-router-dom';

const PAGE_META = {
  '/':           { title: 'Dashboard',  icon: '📊' },
  '/employees':  { title: 'Employees',  icon: '👥' },
  '/attendance': { title: 'Attendance', icon: '📅' },
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || PAGE_META['/'];

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} title="Toggle menu">
          <span /><span /><span />
        </button>
        <div className="topbar-breadcrumb">
          <span className="topbar-page-icon">{meta.icon}</span>
          <span className="topbar-page-title">{meta.title}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-date">
          <span className="topbar-date-icon">📅</span>
          <span>{today}</span>
        </div>
        <div className="topbar-admin">
          <div className="topbar-admin-avatar">A</div>
          <div className="topbar-admin-info">
            <span className="topbar-admin-name">Admin</span>
            <span className="topbar-admin-role">HR Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
}
