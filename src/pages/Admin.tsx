import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

const SUPER_ADMIN_EMAIL = 'krichardson@wegive110.com';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.email === SUPER_ADMIN_EMAIL) {
        setIsAuthorized(true);
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in or not the super admin, show login
  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return <AdminLogin />;
  }

  // Show the admin dashboard
  return <AdminDashboard />;
};

export default Admin;
