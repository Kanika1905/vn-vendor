import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ROUTES, BASE_URL } from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of endpoints where token must NOT be added
const noAuthEndpoints = [
  API_ROUTES.VENDOR_LOGIN,
  API_ROUTES.VENDOR_REGISTER,
  API_ROUTES.VENDOR_OTP_VERIFY,


];

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    const skipAuth = noAuthEndpoints.some((url) => config.url.includes(url));

    if (!skipAuth) {
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (Token refresh handling)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('REFRESH_TOKEN');

        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefresh } = res.data.data;

          // Save new tokens
          await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
          await AsyncStorage.setItem('REFRESH_TOKEN', newRefresh);

          // Retry old request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        await AsyncStorage.multiRemove(['ACCESS_TOKEN', 'REFRESH_TOKEN']);
      }
    }

    return Promise.reject(error);
  }
);

//
// =======================
// API MODULES
// =======================
//

// VENDOR API
export const vendorAPI = {
  login: (data) => api.post('/vendor/login', data),
  register: (data) => api.post('/vendor/register', data),
  verifyOtp: (data) => api.post('/vendor/verify-otp', data),
  getProfile: () => api.get('/vendor/profile'),
  updateProfile: (data) => api.put('/vendor/profile', data),
};

// WHOLESALER API
export const wholesalerAPI = {
  login: (data) => api.post('/wholesaler/login', data),
  register: (data) => api.post('/wholesaler/register', data),
  verifyOtp: (data) => api.post('/wholesaler/verify-otp', data),
  getProfile: () => api.get('/wholesaler/profile'),
  updateProfile: (data) => api.put('/wholesaler/profile', data),
};

// COMMON AUTH
export const authAPI = {
  logout: () => api.post('/auth/logout'),
  refreshToken: (token) =>
    api.post('/auth/refresh-token', { refreshToken: token }),
};

// EXPORT AXIOS INSTANCE
export default api;