import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on aborted requests (StrictMode cleanup)
    if (axios.isCancel(error) || error.code === 'ECONNABORTED') {
      console.log('Request cancelled:', error.message);
      return Promise.reject(error);
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const responderAPI = {
  // Get responder profile
  getProfile: (signal) =>
    api.get(`/responder/info`, { signal }),

  // Get all assignments (not just active) - paginated
  getAllAssignments: (page = 0, size = 20, signal) =>
    api.get(`/responder/assignments`, {
      params: { page, size },
      signal
    }),

  // Get assignment details
  getAssignmentDetails: (assignmentId, signal) =>
    api.get(`/responder/assignments/${assignmentId}`, { signal }),

  // Get assignment locations (vehicle and incident)
  getAssignmentLocations: (assignmentId, signal) =>
    api.get(`/responder/assignments/${assignmentId}/locations`, { signal }),

  // Get notifications for responder - paginated
  getNotifications: (page = 0, size = 20, signal) =>
    api.get(`/responder/notifications`, {
      params: { page, size },
      signal
    }),

  // Respond to assignment notification (accept/reject)
  respondToAssignment: (assignment, signal) =>
    api.post(`/responder/assignments/${assignment.id}/respond`, responseData, { signal }),

  // Update vehicle location
  updateLocation: (locationData, signal) =>
    api.post(`/responder/location`, locationData, { signal }),

  // Update status
  updateStatus: (assignmentId, statusData, signal) =>
    api.put(`/responder/assignments/${assignmentId}/status`, statusData, { signal }),

  // Cancel assignment
  cancelAssignment: (assignmentId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/cancel`, {}, { signal }),

  // Mark arrival (legacy)
  markArrival: (assignmentId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/arrive`, {}, { signal }),

  // Complete assignment (legacy)
  completeAssignment: (assignmentId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/complete`, {}, { signal }),

};

export default api;