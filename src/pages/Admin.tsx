import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const { user, loading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in or not the super admin (checked via RPC), show login
  if (!user || !isSuperAdmin) {
    return <AdminLogin />;
  }

  // Show the admin dashboard
  return <AdminDashboard />;
};

export default Admin;
