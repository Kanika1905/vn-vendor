// // app/constants/config.js

// // 🔥 Base API URL (change only here)
// export const BASE_URL = "http://192.168.0.101:5000/api"; 
// // Replace with your backend LAN/IP or hosted URL

// // 🔥 Complete API Route Mapping
// export const API_ROUTES = {
//   // Vendor Auth
//   VENDOR_LOGIN: `${BASE_URL}/vendor/login`,
//   VENDOR_REGISTER: `${BASE_URL}/vendor/register`,
//   VENDOR_OTP_VERIFY: `${BASE_URL}/vendor/verify-otp`,

//   // Common User Actions
//   REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
//   LOGOUT: `${BASE_URL}/auth/logout`,
// };

// // 🔥 Default Headers Used in Fetch Requests
// export const DEFAULT_HEADERS = {
//   "Content-Type": "application/json",
// };
const CONFIG = {
  BASE_URL: "http://192.168.0.102:5000/api", // 🔁 Change to your local IP
};

export default CONFIG;