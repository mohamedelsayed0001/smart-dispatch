import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import Dashboard from '../components/admin/Dashboard';
import SystemUsers from '../components/admin/SystemUsers';
import Vehicles from '../components/admin/Vehicles';
import Reports from '../components/admin/Reports';
import Analysis from '../components/admin/Analysis';
import { fetchDashboardData, fetchUsers, fetchReports } from '../utils/api';
import './styles/AdminPage.css';

const AdminPage = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      fetchDashboardData().then(setDashboardData);
    } else if (activeMenu === 'users') {
      fetchUsers(currentPage, userFilter, searchQuery).then(data => {
        setUsers(data.users);
        setTotalPages(data.pages);
      });
    } else if (activeMenu === 'reports') {
      fetchReports(currentPage).then(data => {
        setReports(data.reports);
        setTotalPages(data.pages);
      });
    }
  }, [activeMenu, currentPage, userFilter, searchQuery]);

  const handleRefreshUsers = () => {
    fetchUsers(currentPage, userFilter, searchQuery).then(data => {
      setUsers(data.users);
      setTotalPages(data.pages);
    });
  };

  return (
    <div className="admin-container">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <div className="admin-main">
        <div className="admin-content">
          {activeMenu === 'dashboard' && <Dashboard dashboardData={dashboardData} />}
          {activeMenu === 'users' && (
            <SystemUsers
              users={users}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onRefresh={handleRefreshUsers}
            />
          )}
          {activeMenu === 'vehicles' && <Vehicles />}
          {activeMenu === 'reports' && (
            <Reports
              reports={reports}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
          {activeMenu === 'analysis' && <Analysis />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;