import axios from 'axios';

const api = axios.create({
  baseURL: '',
  validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
});

// Interceptor to inject JWT token in request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle authentication failures (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and reload or redirect if necessary (handled by AuthContext/App)
      console.error('Session expired or unauthorized access.');
    }
    return Promise.reject(error);
  }
);

export default api;
