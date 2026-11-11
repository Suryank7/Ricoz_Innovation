'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'brokerage_admin' | 'franchise_adviser' | 'sop_specialist' | 'brand_owner' | 'external_counsel' | 'investor' | 'platform_admin';
  brandId?: string;
  investorId?: string;
  organization?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (roleEmail: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  switchDemoRole: async () => {},
});

export const DEMO_ACCOUNTS = [
  { label: 'Lead Adviser', email: 'adviser@ricoz.com', pass: 'Adviser@123456', role: 'franchise_adviser' },
  { label: 'Brokerage Admin', email: 'admin@ricoz.com', pass: 'Admin@123456', role: 'brokerage_admin' },
  { label: 'Operations Specialist', email: 'ops@ricoz.com', pass: 'Ops@123456', role: 'sop_specialist' },
  { label: 'External Legal Counsel', email: 'legal@franchisecounsel.in', pass: 'Legal@123456', role: 'external_counsel' },
  { label: 'Brand Owner (Chai & Chutney)', email: 'founder@chaichutney.com', pass: 'Brand@123456', role: 'brand_owner' },
  { label: 'Qualified Investor (Vikram)', email: 'vikram@apexventures.in', pass: 'Investor@123456', role: 'investor' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSession() {
      try {
        const token = localStorage.getItem('ricoz_auth_token');
        if (token) {
          const res = await api.me();
          if (res?.data) {
            setUser({
              id: res.data._id || res.data.id,
              name: res.data.name,
              email: res.data.email,
              role: res.data.role,
              brandId: res.data.brandId,
              investorId: res.data.investorId,
              organization: res.data.organization,
            });
          }
        }
      } catch (err) {
        localStorage.removeItem('ricoz_auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      if (res?.data?.token) {
        localStorage.setItem('ricoz_auth_token', res.data.token);
        setUser(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('ricoz_auth_token');
    setUser(null);
    router.push('/login');
  };

  const switchDemoRole = async (roleEmail: string, pass: string) => {
    await login(roleEmail, pass);
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
