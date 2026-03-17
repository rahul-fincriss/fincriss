import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');

    console.error(`API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
      status: error.response?.status,
      data: JSON.stringify(error.response?.data),
      isAuthRequest
    });

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log("Attempting token refresh...");
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        
        console.log("Token refresh successful");
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed, clearing session", refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Use a less aggressive redirect if possible, or just let the app handle it via AuthContext
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
