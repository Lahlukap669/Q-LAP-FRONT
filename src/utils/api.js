// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  TRAINER_PERIODIZATIONS: `${API_BASE_URL}/users/trainer/periodizations`
  // Add other endpoints as needed
}

export default API_BASE_URL
