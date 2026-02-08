import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Lock } from 'lucide-react';
import clubhouseLogo from '@/assets/clubhouse-logo.png';

const SUPER_ADMIN_EMAIL = 'krichardson@wegive110.com';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Sign out any existing session first to avoid conflicts
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
          // Navigate instead of reload for better UX
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
            <CardTitle className="font-display text-2xl text-foreground">Admin Portal</CardTitle>
            <CardDescription className="mt-2">
              Restricted access for super administrators only
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
          </form>
          
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
