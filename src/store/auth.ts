import { create } from 'zustand';
import { AuthState, User, UserRole } from '@/types/auth';

// Mock user data for demo purposes
const mockUsers = {
  'company1@example.com': {
    id: `user_${Date.now() - 1000}`,
    email: 'company1@example.com',
    name: 'John Smith',
    companyName: 'Tech Solutions Inc.',
    role: 'company' as UserRole,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=company1',
  },
  'company2@example.com': {
    id: `user_${Date.now() - 2000}`,
    email: 'company2@example.com',
    name: 'Sarah Johnson',
    companyName: 'Digital Innovations Ltd.',
    role: 'company' as UserRole,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=company2',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Get the mock user from the email or create a new one
    const existingUser = mockUsers[email as keyof typeof mockUsers];
    const mockUser: User = existingUser || {
      id: `user_${Date.now()}`,
      email,
      name: 'Demo User',
      companyName: 'Demo Company',
      role: 'company',
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    
    // Always succeed
    set({ user: mockUser, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Clear auth cookies
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },
})); 