import React from 'react';
import { LayoutDashboard, Users, FileText, BarChart3 } from 'lucide-react';
import './styles/AdminSidebar.css';

const AdminSidebar = ({ activeMenu, setActiveMenu }) => {
  const MenuItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveMenu(id)}
      className={activeMenu === id ? 'menu-item menu-item-active' : 'menu-item'}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-avatar">ED</div>
        <div>
          <h2>Emergency</h2>
          <p>Dispatch System</p>
        </div>
      </div>

      <div className="sidebar-menu">
        <MenuItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
        <MenuItem icon={Users} label="System Users" id="users" />
        <MenuItem icon={FileText} label="Reports" id="reports" />
        <MenuItem icon={BarChart3} label="Analysis" id="analysis" />
      </div>
    </div>
  );
};

export default AdminSidebar;
