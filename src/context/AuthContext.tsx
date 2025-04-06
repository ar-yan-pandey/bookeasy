import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserType = 'user' | 'provider' | 'admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userType: UserType | null;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userType: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserType = async (user: User): Promise<UserType> => {
    if (user.email === 'admin@gmail.com') return 'admin';
    return (user.user_metadata?.user_type as UserType) || 'user';
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const type = await getUserType(currentUser);
        setUserType(type);
      } else {
        setUserType(null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const type = await getUserType(currentUser);
        setUserType(type);
      } else {
        setUserType(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userType }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
