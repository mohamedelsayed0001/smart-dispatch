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

  console.log("📌 Axios Request:", {
    url: config.url,
    method: config.method,
    token: token ? token : "NO TOKEN FOUND",
  });

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

  // Get incident details
  getIncidentDetails: (incidentId, signal) =>
    api.get(`/responder/incidents/${incidentId}`, { signal }),

  // Update vehicle location
  updateLocation: (locationData, signal) =>
    api.post(`/responder/location`, locationData, { signal }),

  // Update status
  updateStatus: (assignmentId, statusData, signal) =>
    api.put(`/responder/assignments/${assignmentId}/status`, statusData, { signal }),
};

export default api;