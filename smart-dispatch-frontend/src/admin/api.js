const API_BASE = 'http://localhost:8080';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    console.error(`API Error (${response.status}):`, data);
    throw new Error(typeof data === 'string' ? data : (data.message || `API Error: ${response.status}`));
  }

  return data;
};

export const fetchVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/vehicle/getAllVehicles`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

export const createVehicle = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/api/vehicle/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...formData,
        capacity: parseInt(formData.capacity),
        operatorId: formData.operatorId ? parseInt(formData.operatorId) : null
      })
    });

    const data = await handleResponse(response);
    return { success: true, data: formData, message: data };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return { success: false, error: error.message };
  }
};

export const updateVehicle = async (formData, vehicleId) => {
  try {
    const response = await fetch(`${API_BASE}/api/vehicle/edit/${vehicleId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...formData,
        capacity: parseInt(formData.capacity),
        operatorId: formData.operatorId ? parseInt(formData.operatorId) : null
      })
    });

    const data = await handleResponse(response);
    return { success: true, data: formData, message: data };
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return { success: false, error: error.message };
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await fetch(`${API_BASE}/api/vehicle/delete/${vehicleId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const data = await handleResponse(response);
    return { success: true, message: data };
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return { success: false, error: error.message };
  }
};

export const fetchUsers = async (page = 1, filter = 'all', search = '') => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/users?page=${page}&role=${filter}&search=${encodeURIComponent(search)}`,
      { headers: getHeaders() }
    );

    const data = await handleResponse(response);
    return {
      users: data.data || [],
      total: data.totalElements || 0,
      pages: data.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0, pages: 1 };
  }
};

export const fetchReports = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: getHeaders()
    });

    const data = await handleResponse(response);
    return {
      reports: data || [],
      total: (data && data.length) || 0,
      pages: 1
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { reports: [], total: 0, pages: 1 };
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role: newRole })
    });

    const data = await handleResponse(response);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
};