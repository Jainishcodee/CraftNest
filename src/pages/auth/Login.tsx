
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Define the login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Define the register form schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Login = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Default role and redirect from query params
  const defaultRole = (searchParams.get('role') || 'customer') as UserRole;
  const redirectTo = searchParams.get('redirect') || '/';
  
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(defaultRole);
  const [activeTab, setActiveTab] = React.useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Handle login form submission
  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password, selectedRole);
      
      // Redirect based on role
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else if (selectedRole === 'vendor') {
        navigate('/vendor');
      } else {
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle register form submission
  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Admin role cannot register
      if (selectedRole === 'admin') {
        toast.error('Registration error', {
          description: 'Admin accounts cannot be registered. Please contact support.',
        });
        return;
      }
      
      await register(data.name, data.email, data.password, selectedRole);
      
      // Redirect based on role
      if (selectedRole === 'vendor') {
        navigate('/vendor');
      } else {
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="craft-container py-8 md:py-12 max-w-md">
      <div className="text-center mb-8">
        <h1 className="craft-heading">Welcome to CraftNest</h1>
        <p className="text-muted-foreground">
          {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Role selection */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Account Type</label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={selectedRole === 'customer' ? "default" : "outline"}
                className={selectedRole === 'customer' ? "bg-craft-teal hover:bg-craft-teal/90" : ""}
                onClick={() => setSelectedRole('customer')}
              >
                Customer
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'vendor' ? "default" : "outline"}
                className={selectedRole === 'vendor' ? "bg-craft-teal hover:bg-craft-teal/90" : ""}
                onClick={() => setSelectedRole('vendor')}
              >
                Vendor
              </Button>
              {activeTab === 'login' && (
                <Button
                  type="button"
                  variant={selectedRole === 'admin' ? "default" : "outline"}
                  className={selectedRole === 'admin' ? "bg-craft-teal hover:bg-craft-teal/90" : ""}
                  onClick={() => setSelectedRole('admin')}
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
          
          {/* Login tab */}
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="craft-btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Register tab */}
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="craft-btn-primary w-full"
                  disabled={isSubmitting || selectedRole === 'admin'}
                >
                  {isSubmitting ? 'Creating Account...' : 'Register'}
                </Button>
                
                {selectedRole === 'admin' && (
                  <p className="text-destructive text-sm text-center">
                    Admin accounts cannot be registered. Please contact support.
                  </p>
                )}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
