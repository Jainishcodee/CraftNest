
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'customer' | 'vendor' | 'admin' | null;

// Define user interface
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Define auth context interface
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile && !error) {
          setUser({
            id: session.user.id,
            name: profile.name || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            role: profile.role as UserRole,
          });
        }
      }
      setLoading(false);
    };

    checkSession();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              role: profile.role as UserRole,
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
        return Promise.reject(error.message);
      }
      
      if (data.user) {
        // Get user profile including role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          toast({
            variant: "destructive",
            title: "Profile error",
            description: "Could not fetch user profile.",
          });
          return Promise.reject(profileError.message);
        }
        
        // Check if role matches the requested role
        if (profile && profile.role !== role) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: `You do not have ${role} privileges.`,
          });
          await supabase.auth.signOut();
          return Promise.reject("Role mismatch");
        }
        
        // Set user data in state
        setUser({
          id: data.user.id,
          name: profile.name || data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          role: profile.role as UserRole,
        });
        
        toast({
          title: "Logged in successfully",
          description: `Welcome back!`,
        });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login.",
      });
      return Promise.reject(error);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      // Admin role cannot register
      if (role === 'admin') {
        toast({
          variant: "destructive",
          title: "Registration error",
          description: "Admin accounts cannot be registered. Please contact support.",
        });
        return Promise.reject("Admin registration not allowed");
      }
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
        return Promise.reject(error.message);
      }

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          role,
        });

        if (profileError) {
          toast({
            variant: "destructive",
            title: "Profile creation failed",
            description: profileError.message,
          });
          return Promise.reject(profileError.message);
        }

        // Set user data in state
        setUser({
          id: data.user.id,
          name,
          email,
          role,
        });

        toast({
          title: "Registered successfully",
          description: `Welcome to CraftNest, ${name}!`,
        });
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
      });
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
