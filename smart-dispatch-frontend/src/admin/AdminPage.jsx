import { useState, useEffect, useRef, act } from 'react';
import AdminSidebar from './components/AdminSidebar';
import SystemUsers from './components/SystemUsers';
import Vehicles from './components/Vehicles';
import LiveMap from './components/LiveMap';
import Reports from './components/Reports';
import Analysis from './components/Analysis';
import {fetchUsers, fetchReports } from './api.js';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './AdminPage.css';
import { useNavigate } from 'react-router-dom';
const AdminPage = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem('authToken'); // or whatever key you use
  localStorage.removeItem('user');
    window.location.href = '/login'; // redirect to login page
}; 
  const [activeMenu, setActiveMenu] = useState('analysis');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (activeMenu === 'users') {
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
        const token = localStorage.getItem('authToken');
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
      
      <AdminSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />
      
      <div className="admin-main" style={{ marginLeft: sidebarCollapsed ? '80px' : '250px', transition: 'margin-left 0.3s ease' }}>
        <div className="admin-content">
         
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
          {activeMenu === 'livemap' && <LiveMap />}
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