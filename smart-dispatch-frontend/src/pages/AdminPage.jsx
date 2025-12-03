import React, { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import Dashboard from '../components/admin/Dashboard';
import SystemUsers from '../components/admin/SystemUsers';
import Vehicles from '../components/admin/Vehicles';
import VehicleLocations from '../components/admin/VehicleLocations'; // Add this
import Reports from '../components/admin/Reports';
import Analysis from '../components/admin/Analysis';
import { fetchDashboardData, fetchUsers, fetchReports } from '../utils/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
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
  const stompClientRef = useRef(null);

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
      // subscribe to websocket topic for live reports
      if (!stompClientRef.current) {
        const token = localStorage.getItem('jwt_token');
        const client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          onConnect: () => {
            client.subscribe('/topic/reports', (message) => {
              try {
                const body = JSON.parse(message.body);
                // prepend new report
                setReports(prev => [body, ...(prev || [])]);
              } catch (e) {
                console.error('Failed to parse report message', e);
              }
            });
          }
        });
        client.activate();
        stompClientRef.current = client;
      }
    }
  }, [activeMenu, currentPage, userFilter, searchQuery]);

  // cleanup websocket on unmount
  useEffect(() => {
    return () => {
      if (stompClientRef.current) {
        try { stompClientRef.current.deactivate(); } catch (e) { }
        stompClientRef.current = null;
      }
    };
  }, []);

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
          {activeMenu === 'locations' && <VehicleLocations />}  {
                  <div 
                    className={`menu-item ${activeMenu === 'locations' ? 'active' : ''}`}
                    onClick={() => setActiveMenu('locations')}
                  >
                    <span className="menu-icon">📍</span>
                    <span>Vehicle Locations</span>
                  </div>}
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