import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

// Responder API endpoints
export const responderAPI = {
  // Get responder profile
  getProfile: (responderId, signal) =>
    api.get(`/responder/profile/${responderId}`, { signal }),

  // Get all assignments (not just active) - paginated
  getAllAssignments: (responderId, page = 0, size = 20, signal) =>
    api.get(`/responder/assignments/${responderId}`, {
      params: { page, size },
      signal
    }),

  // Get active assignments (legacy - for backwards compatibility)
  getActiveAssignments: (responderId, signal) =>
    api.get(`/responder/assignments/active/${responderId}`, { signal }),

  // Get assignment details
  getAssignmentDetails: (assignmentId, responderId, signal) =>
    api.get(`/responder/assignments/${assignmentId}/responder/${responderId}`, { signal }),

  // Get assignment locations (vehicle and incident)
  getAssignmentLocations: (assignmentId, responderId, signal) =>
    api.get(`/responder/assignments/${assignmentId}/locations/${responderId}`, { signal }),

  // Get notifications for responder - paginated
  getNotifications: (responderId, page = 0, size = 20, signal) =>
    api.get(`/responder/notifications/${responderId}`, {
      params: { page, size },
      signal
    }),

  // Respond to assignment notification (accept/reject)
  respondToAssignment: (assignmentId, responderId, responseData, signal) =>
    api.post(`/responder/assignments/${assignmentId}/respond/${responderId}`, responseData, { signal }),

  // Update vehicle location
  updateLocation: (responderId, locationData, signal) =>
    api.post(`/responder/location/${responderId}`, locationData, { signal }),

  // Update status
  updateStatus: (assignmentId, responderId, statusData, signal) =>
    api.put(`/responder/assignments/${assignmentId}/status/${responderId}`, statusData, { signal }),

  // Cancel assignment
  cancelAssignment: (assignmentId, responderId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/cancel/${responderId}`, {}, { signal }),

  // Accept assignment (legacy)
  acceptAssignment: (assignmentId, responderId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/accept/${responderId}`, {}, { signal }),

  // Mark arrival (legacy)
  markArrival: (assignmentId, responderId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/arrive/${responderId}`, {}, { signal }),

  // Complete assignment (legacy)
  completeAssignment: (assignmentId, responderId, signal) =>
    api.post(`/responder/assignments/${assignmentId}/complete/${responderId}`, {}, { signal }),

  // Get assignment history (legacy - use getAllAssignments instead)
  getAssignmentHistory: (responderId, page = 0, size = 10, signal) =>
    api.get(`/responder/assignments/history/${responderId}`, {
      params: { page, size },
      signal
    }),
};

export default api;