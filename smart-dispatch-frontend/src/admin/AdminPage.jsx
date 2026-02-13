import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

import AdminSidebar from './components/AdminSidebar';
import SystemUsers from './components/SystemUsers';
import Vehicles from './components/Vehicles';
import LiveMap from './components/LiveMap';
import Reports from './components/Reports';
import Analysis from './components/Analysis';
import AdminNotifications from './components/AdminNotifications';

import { useCallback } from 'react';
import { fetchUsers, fetchReports } from './api.js';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import './AdminPage.css';

const AdminPage = () => {
  
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // or whatever key you use
    localStorage.removeItem('user');
    window.location.href = '/login'; // redirect to login page
  };

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [activeMenu, setActiveMenu] = useState('analysis');
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [snackbarNotif, setSnackbarNotif] = useState(null);
  const stompNotifClientRef = useRef(null);
  const snackbarTimeoutRef = useRef(null);

  // Subscribe to admin notifications WebSocket globally
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        client.subscribe('/topic/admin/notifications', (message) => {
          try {
            const notifRaw = JSON.parse(message.body);
            const notif = {
              type: notifRaw.notificationType,
              message: notifRaw.content,
              time: notifRaw.timeSent,
              unread: true
            };
            setNotifList(prev => {
              const uniqueKey = `${notif.type}-${notif.time}`;
              if (prev.some(n => `${n.type}-${n.time}` === uniqueKey)) {
                return prev;
              }
              const newList = [notif, ...prev];
              return newList.length > 40 ? newList.slice(0, 40) : newList;
            });
            setSnackbarNotif(notif);
            // Clear previous timeout
            if (snackbarTimeoutRef.current) {
              clearTimeout(snackbarTimeoutRef.current);
            }
            snackbarTimeoutRef.current = setTimeout(() => setSnackbarNotif(null), 4000);
          } catch (e) {
            console.error('Failed to parse admin notification', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    client.activate();
    stompNotifClientRef.current = client;
    return () => {
      if (stompNotifClientRef.current) {
        try { stompNotifClientRef.current.deactivate(); } catch (e) { }
        stompNotifClientRef.current = null;
      }
      // Clear snackbar timeout on unmount
      if (snackbarTimeoutRef.current) {
        clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, []);
  
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

  // Handler for new notification (called from AdminNotifications via prop)
  // Add unread status to new notifications
  const handleNotifNew = useCallback((notif) => {
    setNotifList(prev => {
      const newList = [{ ...notif, unread: true }, ...prev];
      return newList.length > 10 ? newList.slice(0, 10) : newList;
    });
    setSnackbarNotif(notif);
    // Clear previous timeout
    if (snackbarTimeoutRef.current) {
      clearTimeout(snackbarTimeoutRef.current);
    }
    snackbarTimeoutRef.current = setTimeout(() => setSnackbarNotif(null), 4000);
  }, []);
  // Fetch notifications from backend and mark all as read
  const fetchNotifications = async (limit = 10) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/notifications/getNotifications?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setNotifList(res.data.map(n => ({
        type: n.notificationType,
        message: n.content,
        time: n.timeSent,
        unread: false // Mark all as read when fetched from backend
      })));
    } catch (e) {
      setNotifList(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };


  // Handler for menu open, supports limit
  const handleNotifMenuOpen = (limit) => fetchNotifications(limit);
  // Fetch notifications on reload if notifications is the current page
  useEffect(() => {
    if (activeMenu === 'notifications') {
      fetchNotifications();
    }
  }, [activeMenu]);
  // Handler for notification click
  // Mark notification as read on click (only open popup, do not navigate)
  const handleNotificationClick = (notif, idx) => {
    setNotifList(prev => prev.map((n, i) =>
      n.type === notif.type && n.time === notif.time ? { ...n, unread: false } : n
    ));
    // No navigation to live map
  };

  // Pass notification state to sidebar and notification component
  return (
    <div className="admin-container">

      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        hasNewNotification={notifList.some(n => n.unread)}
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
          {activeMenu === 'vehicles' && <Vehicles vehicles={vehicles} setVehicles={setVehicles} />}
          {activeMenu === 'livemap' && <LiveMap vehicles={vehicles} setVehicles={setVehicles} />}
          {activeMenu === 'reports' && (
            <Reports
              reports={reports}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
          {activeMenu === 'analysis' && <Analysis />}
          {activeMenu === 'notifications' && (
            <AdminNotifications
              notifications={notifList}
              onNotificationClick={handleNotificationClick}
              onMenuOpen={handleNotifMenuOpen}
              onNewNotification={handleNotifNew}
            />
          )}
        </div>
        {/* Snackbar notification for any page (moved outside admin-content for global visibility) */}
        {snackbarNotif && (
          <div style={{
            position: 'fixed',
            top: 32,
            right: 32,
            background: '#fff',
            color: '#222',
            padding: '1em 2em',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontWeight: 600,
            border: '1px solid #ddd'
          }}>
            <span style={{marginRight: 12}}>🔔</span>
            {snackbarNotif.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;