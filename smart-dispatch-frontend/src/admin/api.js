// API utility functions for admin panel

export const fetchDashboardData = async () => {
    return {
        activeCars: 12,
        pendingEmergencies: 5,
        responseTime: '4.5 min',
        efficiency: 92
    };
};

export const fetchUsers = async (page = 1, filter = 'all', search = '') => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            `http://localhost:8080/api/admin/users?page=${page}&role=${filter}&search=${encodeURIComponent(search)}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();

        console.log('[API] Fetched users:', data);

        return {
            users: data.data || [],
            total: data.totalElements || 0,
            pages: data.totalPages || 1
        };
    } catch (error) {
        console.error('[API] Error fetching users:', error);
        // Return mock data as fallback
        const allUsers = [
            { id: 1, name: 'John Smith', email: 'john@emergency.com', role: 'ADMIN', status: 'active', joinedDate: '2024-01-15' },
            { id: 2, name: 'Sarah Johnson', email: 'sarah@emergency.com', role: 'DISPATCHER', status: 'active', joinedDate: '2024-02-20' },
            { id: 3, name: 'Mike Wilson', email: 'mike@emergency.com', role: 'OPERATOR', status: 'active', joinedDate: '2024-03-10' },
        ];

        let filtered = allUsers;
        if (filter !== 'all') {
            filtered = allUsers.filter(u => u.role.toLowerCase() === filter.toLowerCase());
        }
        if (search) {
            filtered = filtered.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
        }

        return {
            users: filtered.slice((page - 1) * 6, page * 6),
            total: filtered.length,
            pages: Math.ceil(filtered.length / 6)
        };
    }
};

export const fetchReports = async (page = 1) => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:8080/api/admin/reports`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error('Failed to fetch reports');

        const data = await res.json();
        // backend returns an array of AdminIncidentReportDto
        return {
            reports: data || [],
            total: (data && data.length) || 0,
            pages: 1
        };
    } catch (error) {
        console.error('[API] Error fetching reports, falling back to mock:', error);
        const reports = [
            { id: 1, title: 'System Performance Report', date: '2024-10-15', type: 'Performance', status: 'completed' },
            { id: 2, title: 'Emergency Response Times', date: '2024-10-20', type: 'Analytics', status: 'completed' },
            { id: 3, title: 'Monthly Dispatch Summary', date: '2024-10-28', type: 'Summary', status: 'pending' },
            { id: 4, title: 'User Activity Log', date: '2024-11-01', type: 'Activity', status: 'completed' },
            { id: 5, title: 'Equipment Maintenance', date: '2024-11-05', type: 'Maintenance', status: 'completed' },
        ];

        return {
            reports: reports.slice((page - 1) * 6, page * 6),
            total: reports.length,
            pages: Math.ceil(reports.length / 6)
        };
    }
};

export const updateUserRole = async (userId, newRole) => {
    try {
        console.log(`[API] Updating user ${userId} to ${newRole}`);
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
            throw new Error('Failed to update user role');
        }

        const result = await response.json();
        console.log('[API] User role updated successfully:', result);
        return result;
    } catch (error) {
        console.error('[API] Error updating user role:', error);
        throw error;
    }
};