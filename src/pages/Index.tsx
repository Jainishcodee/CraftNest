
import Home from './Home';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to appropriate dashboard if user is logged in
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" />;
    } else if (user?.role === 'vendor') {
      return <Navigate to="/vendor" />;
    } else if (user?.role === 'customer') {
      return <Navigate to="/customer" />;
    }
  }
  
  // If not authenticated or role doesn't match, show home page
  return <Home />;
};

export default Index;
