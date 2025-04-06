
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Define user roles
export type UserRole = 'customer' | 'vendor' | 'admin' | null;

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demonstration
const SAMPLE_USERS = [
  { id: '1', name: 'John Customer', email: 'customer@example.com', password: 'password', role: 'customer' as UserRole },
  { id: '2', name: 'Jane Vendor', email: 'vendor@example.com', password: 'password', role: 'vendor' as UserRole },
  { id: '3', name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin' as UserRole },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = SAMPLE_USERS.find(
      u => u.email === email && u.password === password && u.role === role
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${foundUser.name}!`,
      });
      return Promise.resolve();
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
      });
      return Promise.reject("Invalid credentials");
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (SAMPLE_USERS.some(u => u.email === email)) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Email already exists. Please use a different email.",
      });
      return Promise.reject("Email already exists");
    }
    
    // Create new user (in a real app, this would be an API call)
    const newUser = {
      id: String(SAMPLE_USERS.length + 1),
      name,
      email,
      role
    };
    
    setUser(newUser);
    toast({
      title: "Registered successfully",
      description: `Welcome to CraftNest, ${name}!`,
    });
    
    return Promise.resolve();
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
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
