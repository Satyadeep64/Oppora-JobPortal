import axios from 'axios';

// Create base Axios instance using environment variables
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5024/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for generic error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Network error occurred while contacting Oppora servers.',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
