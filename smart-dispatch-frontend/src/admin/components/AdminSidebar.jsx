import { LayoutDashboard, Users, FileText, BarChart3, Truck, MapPin, Map, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import '../styles/AdminSidebar.css';
// import SidebarNotificationMenu from './SidebarNotificationMenu';

const AdminSidebar = ({ activeMenu, setActiveMenu, collapsed, setCollapsed, hasNewNotification ,onLogout }) => {
  const MenuItem = ({ icon: Icon, label, id, showDot }) => (
    <button
      onClick={() => setActiveMenu(id)}
      className={activeMenu === id ? 'menu-item menu-item-active' : 'menu-item'}
      title={collapsed ? label : ''}
      style={{ position: 'relative' }}
    >
      <Icon size={20} />
      {showDot && <span className="notif-dot-sidebar" />}
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
        <MenuItem icon={BarChart3} label="Dashboard" id="analysis" />
        <MenuItem icon={Map} label="Live Map" id="livemap" />
        <MenuItem icon={Bell} label="Notifications" id="notifications" showDot={hasNewNotification} />
        <MenuItem icon={Users} label="Users" id="users" />
        <MenuItem icon={Truck} label="Vehicles" id="vehicles" />
        <MenuItem icon={FileText} label="Reports" id="reports" />
      </div>
 
 <button 
        className="sidebar-logout-btn" 
        onClick={onLogout}
        title={collapsed ? 'Logout' : ''}
      >
        {collapsed ? '🚪' : 'Logout'}
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