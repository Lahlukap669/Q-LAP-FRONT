// src/utils/api.js
import axios from 'axios';

// Your existing base URL (perfect!)
const API_BASE_URL = 'http://qlap-flaskapi.ddns.net:5000/api';

// Create centralized axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-add Authorization header to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 Auto-adding token to:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration automatically
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Your existing endpoints (keep these!)
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  TRAINER_PERIODIZATIONS: `${API_BASE_URL}/users/trainer/periodizations`,
  SEARCH_ATHLETES: `${API_BASE_URL}/users/trainer/search-athletes`,
  ADD_ATHLETE: `${API_BASE_URL}/users/trainer/add-athlete`,
  MY_ATHLETES: `${API_BASE_URL}/users/trainer/my-athletes`,
  TRAINING_METHODS: `${API_BASE_URL}/users/trainer/methods`,
  CREATE_PERIODIZATION: `${API_BASE_URL}/users/trainer/create-periodization`,
  SEARCH_ATHLETES: `${API_BASE_URL}/users/trainer/search-athletes`,
  ADD_ATHLETE: `${API_BASE_URL}/users/trainer/add-athlete`,
  GET_TEST_EXERCISES: `${API_BASE_URL}/users/trainer/get-test-exercises`,
  GET_PAST_TEST_EXERCISES: `${API_BASE_URL}/users/trainer/get-past-test-exercises`,
  CREATE_TEST: `${API_BASE_URL}/users/trainer/create-test`,
  DELETE_PERIODIZATION: `${API_BASE_URL}/users/trainer/delete-periodization`,
  MICROCYCLE_INFO: `${API_BASE_URL}/users/trainer/microcycle-info`,
  DELETE_ATHLETE: `${API_BASE_URL}/users/trainer/delete-athlete`,
  GET_TESTS: `${API_BASE_URL}/users/trainer/get-tests`,
  DELETE_TEST: `${API_BASE_URL}/users/trainer/delete-test`,
  GET_TEST_ANALYTICS: `${API_BASE_URL}/users/trainer/get-test-analytics`,
  GET_MOTOR_ABILITY_ANALYTICS: `${API_BASE_URL}/users/trainer/get-motor-ability-analytics`,
  PERIODIZATION_INFO: `${API_BASE_URL}/periodization-info`
};

// Export both the client and base URL
export { apiClient, API_BASE_URL };
export default API_BASE_URL;
