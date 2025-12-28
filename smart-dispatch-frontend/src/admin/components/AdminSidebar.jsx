import { Users, FileText, BarChart3, Truck, MapPin, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/AdminSidebar.css';

const AdminSidebar = ({ activeMenu, setActiveMenu, collapsed, setCollapsed,onLogout  }) => {
  const MenuItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveMenu(id)}
      className={activeMenu === id ? 'menu-item menu-item-active' : 'menu-item'}
      title={collapsed ? label : ''}
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div className={`admin-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-avatar">ED</div>
        {!collapsed && (
          <div>
            <h2>Emergency</h2>
            <p>Dispatch System</p>
          </div>
        )}
      </div>

      <div className="sidebar-menu">
        <MenuItem icon={Users} label="System Users" id="users" />
        <MenuItem icon={Truck} label="Vehicles" id="vehicles" />
        <MenuItem icon={Map} label="Live Map" id="livemap" />
        <MenuItem icon={FileText} label="Reports" id="reports" />
        <MenuItem icon={BarChart3} label="Analysis" id="analysis" />
      </div>
 <button className="sidebar-logout-btn" onClick={onLogout}>
        Logout
      </button>
      <button 
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
};

export default AdminSidebar;