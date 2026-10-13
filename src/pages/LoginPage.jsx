import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function LoginPage() {
  const { login, signInWithOAuth, requestPasswordReset, isSupabaseConfigured } = useAuth();
  const { showToast } = useProjects();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Logged in successfully!');
        navigate('/profile');
      } else {
        setError(res.message || 'Invalid login credentials.');
      }
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) {
      setError('Enter your email address first, then choose Forgot password.');
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setNotice('If an account exists for this email, password reset instructions are on the way.');
      } else {
        setError(result.message || 'Unable to request a password reset.');
      }
    } catch (resetError) {
      setError(resetError.message || 'Unable to request a password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    const res = await signInWithOAuth(provider);
    if (res.success) {
      showToast(`Signed in via ${provider}!`);
      navigate('/profile');
    } else if (res.message) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center relative">
      <Card className="w-full max-w-md p-2 sm:p-4 border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold font-heading">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm">
            Sign in to see your projects and messages.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSupabaseConfigured && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
              Sign-in is currently unavailable. Please try again later.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div role="status" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Academic Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" onClick={handlePasswordReset} disabled={loading || !isSupabaseConfigured} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full mt-2" disabled={loading || !isSupabaseConfigured}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* OAuth Buttons */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-zinc-900 text-xs text-zinc-500 uppercase tracking-wider">
              Or use
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOAuth('github')}
              disabled={loading || !isSupabaseConfigured}
              className="text-xs font-medium"
            >
              GitHub
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOAuth('google')}
              disabled={loading || !isSupabaseConfigured}
              className="text-xs font-medium"
            >
              Google
            </Button>
          </div>

        </CardContent>

        <CardFooter className="justify-center text-xs text-zinc-500 pt-2 pb-4">
          New here?{' '}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1 hover:underline">
            Create an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
