import { Bell } from 'lucide-react';
import '../styles/AdminSidebar.css';

const SidebarNotificationMenu = ({ hasNew, onClick, collapsed }) => (
  <button className={hasNew ? 'menu-item menu-item-notif menu-item-active' : 'menu-item menu-item-notif'} onClick={onClick} title={collapsed ? 'Notifications' : ''}>
    <Bell size={20} />
    {!collapsed && <span>Notifications</span>}
    {hasNew && <span className="notif-dot" />}
  </button>
);

export default SidebarNotificationMenu;
