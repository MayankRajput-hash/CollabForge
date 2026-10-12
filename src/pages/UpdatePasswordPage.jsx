import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

export default function UpdatePasswordPage() {
  const { updatePassword, isSupabaseConfigured } = useAuth();
  const { showToast } = useProjects();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(password);
      if (!result.success) {
        setError(result.message || 'This reset link is invalid or has expired.');
        return;
      }

      showToast('Your password has been updated.');
      navigate('/profile', { replace: true });
    } catch (updateError) {
      setError(updateError.message || 'Unable to update your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-2 sm:p-4 border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-heading">Set a New Password</CardTitle>
          <CardDescription>Choose a new password for your CollabForge account.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
              Password recovery requires a configured Supabase project.
            </div>
          )}
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="pl-10"
                minLength={8}
                required
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                className="pl-10"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={loading || !isSupabaseConfigured}>
              {loading ? 'Updating...' : 'Update Password'} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
          <div className="text-center text-xs text-zinc-500 mt-5">
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Return to sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}