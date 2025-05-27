'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { login, logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, LogOut } from 'lucide-react';

export function AuthTest() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>Test the authentication flow with the backend</CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div>
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Authenticated</AlertTitle>
              <AlertDescription className="text-green-700">
                You are logged in as {user?.full_name} ({user?.email}).
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium mb-2">User Information:</h4>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="w-full mt-4"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            {error && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Authentication Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@example.com"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
