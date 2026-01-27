import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // Demo only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for different roles
const demoUsers: Record<UserRole, User> = {
  analyst: {
    id: 'usr-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@bank.com',
    role: 'analyst',
  },
  investigator: {
    id: 'usr-002',
    name: 'Michael Torres',
    email: 'michael.torres@bank.com',
    role: 'investigator',
  },
  principal_officer: {
    id: 'usr-003',
    name: 'Dr. Amanda Williams',
    email: 'amanda.williams@bank.com',
    role: 'principal_officer',
  },
  compliance: {
    id: 'usr-004',
    name: 'Robert Kim',
    email: 'robert.kim@bank.com',
    role: 'compliance',
  },
  admin: {
    id: 'usr-005',
    name: 'James Patterson',
    email: 'james.patterson@bank.com',
    role: 'admin',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string) => {
    // Demo: Find user by email or default to analyst
    const matchedUser = Object.values(demoUsers).find(u => u.email === email);
    setUser(matchedUser || demoUsers.analyst);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(demoUsers[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
