export type UserRole = 'company';

export interface User {
  id: string;
  email: string;
  name: string;
  companyName: string;
  role: UserRole;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} 