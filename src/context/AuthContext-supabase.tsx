/**
 * Auth Context
 * Global authentication state management using Supabase
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile, onAuthChange, getCurrentUserProfile } from '../lib/auth-supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFreelancer: boolean;
  isClient: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const subscription = onAuthChange(async (supabaseUser) => {
      setUser(supabaseUser);
      
      if (supabaseUser) {
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    isFreelancer: userProfile?.role === 'freelancer',
    isClient: userProfile?.role === 'client',
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
