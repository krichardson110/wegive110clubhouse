import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Lock, ArrowLeft, Mail } from 'lucide-react';
import clubhouseLogo from '@/assets/clubhouse-logo.png';

const SUPER_ADMIN_EMAIL = 'krichardson@wegive110.com';

type ViewMode = 'login' | 'forgot-password' | 'reset-password';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  // Check for password reset token in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      setViewMode('reset-password');
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: 'Access Denied',
        description: 'This login is restricted to super administrators only.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password 
      });
      
      if (error) {
        console.error('Admin login error:', error);
        toast({
          title: 'Sign In Failed',
          description: error.message.includes('Invalid login credentials') 
            ? 'Invalid password. Please check your credentials and try again.'
            : error.message,
          variant: 'destructive',
        });
      } else if (data.user) {
        if (data.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          toast({
            title: 'Welcome Back',
            description: 'Super Admin access granted.',
          });
          navigate('/admin');
        } else {
          await supabase.auth.signOut();
          toast({
            title: 'Access Denied',
            description: 'You do not have super admin privileges.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Admin login exception:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      toast({
        title: 'Access Denied',
        description: 'Password reset is only available for the super admin account.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/admin`,
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset Email Sent',
          description: 'Check your email for a password reset link.',
        });
        setViewMode('login');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully reset.',
        });
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        setViewMode('login');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-email" className="text-sm font-medium">
          Admin Email
        </Label>
        <div className="relative">
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10"
            required
          />
          <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="admin-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            required
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Authenticating...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Access Admin Portal
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full text-muted-foreground hover:text-foreground"
        onClick={() => setViewMode('forgot-password')}
      >
        Forgot your password?
      </Button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-sm font-medium">
          Admin Email
        </Label>
        <div className="relative">
          <Input
            id="reset-email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-10"
            required
          />
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Reset Link
          </>
        )}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full text-muted-foreground hover:text-foreground"
        onClick={() => setViewMode('login')}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to login
      </Button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-sm font-medium">
          New Password
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10"
            required
            minLength={6}
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pr-10"
            required
            minLength={6}
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Updating...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Update Password
          </>
        )}
      </Button>
    </form>
  );

  const getTitle = () => {
    switch (viewMode) {
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-password':
        return 'Set New Password';
      default:
        return 'Admin Portal';
    }
  };

  const getDescription = () => {
    switch (viewMode) {
      case 'forgot-password':
        return 'Enter your admin email to receive a reset link';
      case 'reset-password':
        return 'Enter your new password below';
      default:
        return 'Restricted access for super administrators only';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <img src={clubhouseLogo} alt="Clubhouse" className="h-16 w-auto" />
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <div>
            <CardTitle className="font-display text-2xl text-foreground">{getTitle()}</CardTitle>
            <CardDescription className="mt-2">
              {getDescription()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'login' && renderLoginForm()}
          {viewMode === 'forgot-password' && renderForgotPasswordForm()}
          {viewMode === 'reset-password' && renderResetPasswordForm()}
          
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              This portal is for authorized administrators only. 
              Unauthorized access attempts are logged.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
