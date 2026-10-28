import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  Code2, 
  Clock, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function SignupPage() {
  const { signUp, isSupabaseConfigured } = useAuth();
  const { showToast } = useProjects();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [cohort, setCohort] = useState('');
  const [niche, setNiche] = useState('Full-Stack Engineering');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('15-20 hrs/week');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!name || !email || !password || !university) {
      setError('Please fill in your name, email, password, and university.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp({
        name,
        email,
        password,
        university,
        cohort,
        niche,
        skills,
        availability
      });

      if (!res.success) {
        setError(res.message || 'Error creating account. Please try again.');
      } else if (res.requiresEmailConfirmation) {
        setNotice("We've sent a confirmation code to your email. ");
      } else {
        showToast(`Welcome to CollabForge, ${name}! Your profile is ready.`);
        navigate('/profile');
      }
    } catch (signupError) {
      setError(signupError.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center relative">
      <Card className="w-full max-w-xl p-2 sm:p-4 border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold font-heading">
            Create an account
          </CardTitle>
          <CardDescription className="text-sm">
            Create a profile to find projects and collaborators.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSupabaseConfigured && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-between gap-2">
              <span>🚀 Local workspace active: You can create your account and explore immediately!</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Academic Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Password * (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  University / College *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Cohort / Year
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Class of 2027"
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Primary Technical Niche
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Cloud & DevOps Architecture">Cloud & DevOps Architecture</option>
                  <option value="UI/UX & Frontend Architecture">UI/UX & Frontend Architecture</option>
                  <option value="Cybersecurity & Blockchain">Cybersecurity & Blockchain</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Weekly Availability
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="10-15 hrs/week">10-15 hrs/week</option>
                    <option value="15-20 hrs/week">15-20 hrs/week</option>
                    <option value="20+ hrs/week">20+ hrs/week</option>
                    <option value="Full-time Capstone">Full-time Capstone</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Skills (optional)
              </label>
              <div className="relative">
                <Code2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="e.g. React, writing, research"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="pl-10"
                />
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                Add a few skills so people can find you.
              </span>
            </div>

            <Button type="submit" variant="gradient" className="w-full mt-4" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-xs text-zinc-500 pt-2 pb-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1 hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
