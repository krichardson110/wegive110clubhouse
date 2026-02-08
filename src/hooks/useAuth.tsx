import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Role types matching the database enum
export type AppRole = 'super_admin' | 'admin' | 'coach' | 'player' | 'parent' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  userRoles: AppRole[];
  forcePasswordChange: boolean;
  clearForcePasswordChange: () => void;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // IMPORTANT: Always reset state immediately when auth changes
        // This prevents stale admin state from being shown to wrong users
        if (!session?.user) {
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setUserRoles([]);
          setForcePasswordChange(false);
        } else {
          // Reset first, then check - prevents brief flash of admin access
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setUserRoles([]);
          setForcePasswordChange(false);
          
          // Check roles from database using RPC
          setTimeout(() => {
            fetchUserRoles(session.user.id);
            checkForcePasswordChange(session.user.id);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
        checkForcePasswordChange(session.user.id);
      } else {
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setUserRoles([]);
        setForcePasswordChange(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      // Fetch user roles from the user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (!error && data) {
        const roles = data.map(r => r.role as AppRole);
        setUserRoles(roles);
        setIsSuperAdmin(roles.includes('super_admin'));
        setIsAdmin(roles.includes('super_admin') || roles.includes('admin'));
      } else {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
        setIsSuperAdmin(false);
        setIsAdmin(false);
      }
    } catch (e) {
      console.error('Error fetching user roles:', e);
      setUserRoles([]);
      setIsSuperAdmin(false);
      setIsAdmin(false);
    }
  };

  const checkForcePasswordChange = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('force_password_change')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setForcePasswordChange(data.force_password_change === true);
      } else {
        setForcePasswordChange(false);
      }
    } catch (e) {
      console.error('Error checking force password change:', e);
      setForcePasswordChange(false);
    }
  };

  const clearForcePasswordChange = () => {
    setForcePasswordChange(false);
  };

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
  };

  const signOut = async () => {
    // Reset state immediately before signout
    setIsSuperAdmin(false);
    setIsAdmin(false);
    setUserRoles([]);
    setForcePasswordChange(false);
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isSuperAdmin,
      isAdmin,
      userRoles,
      forcePasswordChange,
      clearForcePasswordChange,
      signOut,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
