import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

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
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-background p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-glow">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">FinCrisS</h1>
            <p className="text-sm text-muted-foreground">
              Financial Crime Intelligence & STR System
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Enterprise-Grade
            <br />
            <span className="text-gradient-primary">AML Compliance</span>
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">
            AI-driven suspicious transaction detection with full audit trail,
            regulatory compliance, and explainable decisions.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-primary">99.2%</p>
              <p className="text-sm text-muted-foreground">Detection Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">-45%</p>
              <p className="text-sm text-muted-foreground">False Positives</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">2.5h</p>
              <p className="text-sm text-muted-foreground">Avg. Resolution</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2024 FinCrisS Platform. Enterprise AML Solution.
        </p>
      </div>

      {/* Right panel - Login form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile branding */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FinCrisS</span>
          </div>

          <div className="text-center lg:text-left">
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
        </div>
      </div>
    </div>
  );
}
