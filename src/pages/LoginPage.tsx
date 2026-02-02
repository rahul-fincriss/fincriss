import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ThemedLogo } from '@/components/shared/ThemedLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    switchRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      {/* Theme toggle in top-right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Centered login panel */}
      <div className="w-full max-w-md space-y-8 px-8 py-12">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-20 w-20 items-center justify-center">
            <ThemedLogo className="h-20 w-20 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">FinCrisS</h1>
            <p className="text-sm text-muted-foreground">
              Financial Crime Intelligence
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your enterprise credentials to access the platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in with SSO
          </Button>
        </form>

        {/* Demo logins */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Demo Access
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('analyst')}
            >
              AML Analyst
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('investigator')}
            >
              Investigator
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('principal_officer')}
            >
              Principal Officer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('super_admin')}
            >
              Super Admin
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          © 2026 FinCrisS Platform
        </p>
      </div>
    </div>
  );
}
