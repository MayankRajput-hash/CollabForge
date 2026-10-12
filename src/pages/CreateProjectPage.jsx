import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FolderPlus, 
  Layers, 
  Calendar, 
  Users, 
  Code2, 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function CreateProjectPage() {
  const { addProject } = useProjects();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & HealthTech');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [openSpots, setOpenSpots] = useState(2);
  const [deadline, setDeadline] = useState('Spring 2026');
  const [architecture, setArchitecture] = useState('Microservices with Node.js & Docker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-6 h-6 text-gradient" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading mb-2">Post a Project</CardTitle>
          <CardDescription className="mb-6">
            You must have a verified student profile before posting capstone initiatives.
          </CardDescription>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="gradient">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">Create Profile</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !requiredSkills) {
      setError('Please provide a title, description, and required skill set.');
      return;
    }

    setLoading(true);
    await addProject({
      title,
      category,
      description,
      requiredSkills,
      openSpots: Number(openSpots),
      totalSpots: Number(openSpots) + 1,
      deadline,
      architecture
    });
    setLoading(false);

    navigate('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-3">
          <Link to="/projects">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Project Directory
          </Link>
        </Button>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
          Post Capstone Project
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
          Publish your research challenge to match algorithmically with complementary student collaborators.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl">
        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Project Title *
            </label>
            <Input
              placeholder="e.g. Autonomous Fleet Scheduling & Microservices Telemetry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="AI & HealthTech">AI & HealthTech</option>
                <option value="IoT & CleanTech">IoT & CleanTech</option>
                <option value="FinTech & Analytics">FinTech & Analytics</option>
                <option value="Cybersecurity & Web3">Cybersecurity & Web3</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="EdTech & Social">EdTech & Social</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Target Cohort / Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="e.g. Spring 2026"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Problem Context & Description *
            </label>
            <textarea
              rows={4}
              placeholder="Detail the academic problem statement, research methodology, and what complementary skill niches you are recruiting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Required Tech Stack & Skills (comma separated) *
            </label>
            <div className="relative">
              <Code2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="e.g. React, Node.js, MongoDB, Docker, Python, PyTorch"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              These skill tokens determine compatibility matching scores for prospective teammates.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Open Teammate Spots
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={openSpots}
                  onChange={(e) => setOpenSpots(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Proposed System Architecture
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="e.g. Microservices with Node.js & Docker"
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link to="/projects">Cancel</Link>
            </Button>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Capstone Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
