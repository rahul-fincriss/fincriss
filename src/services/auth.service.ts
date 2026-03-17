import api from '@/lib/api-client';
import { User } from '@/types';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string; // The API uses username, but the UI might collect email. We'll handle mapping if needed.
  password: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    // Map the API user response to our internal User type if necessary
    const apiUser = response.data;
    console.log("authService.getMe: raw API response:", apiUser);
    
    // Attempting to match based on common FastAPI patterns
    return {
      id: (apiUser.id || apiUser.user_id || "unknown").toString(),
      name: apiUser.full_name || apiUser.username || apiUser.name || "Unknown User",
      email: apiUser.email || "",
      role: apiUser.roles?.[0]?.role_name || apiUser.role || 'analyst',
      avatar: apiUser.avatar_url,
    };
  },
};
