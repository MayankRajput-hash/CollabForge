import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  Edit3, 
  Save, 
  Plus, 
  X, 
  Globe, 
  ExternalLink, 
  FolderPlus,
  ShieldCheck,
  Star,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function ProfilePage({ onOpenCreateProject }) {
  const { currentUser, updateProfile, isSupabaseConfigured } = useAuth();
  const { projects, showToast } = useProjects();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [university, setUniversity] = useState(currentUser?.university || '');
  const [cohort, setCohort] = useState(currentUser?.cohort || '');
  const [niche, setNiche] = useState(currentUser?.niche || 'Full-Stack Engineering');
  const [availability, setAvailability] = useState(currentUser?.availability || '15-20 hrs/week');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [github, setGithub] = useState(currentUser?.github || '');
  const [linkedin, setLinkedin] = useState(currentUser?.linkedin || '');

  // Skills state
  const [skills, setSkills] = useState(currentUser?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center border-zinc-200/80 dark:border-zinc-800/80 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-gradient" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading mb-2">Student Profile</CardTitle>
          <CardDescription className="mb-6">
            Please sign in or create an account to view and customize your capstone profile.
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

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.some(s => s.toLowerCase() === newSkill.trim().toLowerCase())) return;

    const updated = [...skills, newSkill.trim()];
    try {
      await updateProfile({ skills: updated });
      setSkills(updated);
      setNewSkill('');
      showToast('Skill added to your profile.');
    } catch (error) {
      showToast(error.message || 'Could not save this skill.', 'warning');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    try {
      await updateProfile({ skills: updated });
      setSkills(updated);
      showToast('Skill removed from your profile.');
    } catch (error) {
      showToast(error.message || 'Could not remove this skill.', 'warning');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      await updateProfile({
        name,
        university,
        cohort,
        niche,
        availability,
        bio,
        github,
        linkedin,
        skills
      });
      setIsEditing(false);
      showToast('Your student profile has been updated!');
    } catch (error) {
      setProfileError(error.message || 'Could not save your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const userProjects = projects.filter(p => p.ownerId === currentUser.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Profile Header Card */}
      <Card className="p-6 sm:p-8 mb-8 border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
                  {currentUser.name}
                </h1>
                <Badge variant={currentUser.verified ? 'success' : 'outline'} className="gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {currentUser.verified ? 'Verified Student' : 'Student Profile'}
                </Badge>
                {isSupabaseConfigured && (
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    ⚡ Supabase Synced
                  </Badge>
                )}
              </div>
              <div className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {currentUser.niche}
              </div>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> {currentUser.university} ({currentUser.cohort})
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {currentUser.availability}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {currentUser.rating} ({currentUser.completedProjects} Capstones Completed)
                </span>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'outline' : 'secondary'}
            className="self-start md:self-auto"
          >
            {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </Button>
        </div>

        {/* Bio Preview */}
        {!isEditing && (
          <div className="mt-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-2">
              Bio & Research Focus
            </h3>
            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
              {currentUser.bio}
            </p>

            {/* Links */}
            <div className="flex gap-3 mt-4">
              {currentUser.github && (
                <a 
                  href={currentUser.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 hover:border-indigo-500 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> GitHub Profile
                </a>
              )}
              {currentUser.linkedin && (
                <a 
                  href={currentUser.linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 hover:border-indigo-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Profile
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Profile Edit Form */}
      {isEditing && (
        <Card className="p-6 sm:p-8 mb-8 border-indigo-500/30 shadow-xl">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-xl">Update Student Details</CardTitle>
            <CardDescription>Changes will update your algorithmic match vectors immediately.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {profileError && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                {profileError}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    University / College
                  </label>
                  <Input value={university} onChange={(e) => setUniversity(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Technical Niche
                  </label>
                  <select 
                    value={niche} 
                    onChange={(e) => setNiche(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Cloud & DevOps Architecture">Cloud & DevOps Architecture</option>
                    <option value="UI/UX & Frontend Architecture">UI/UX & Frontend</option>
                    <option value="Cybersecurity & Blockchain">Cybersecurity & Blockchain</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Weekly Availability
                  </label>
                  <select 
                    value={availability} 
                    onChange={(e) => setAvailability(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="10-15 hrs/week">10-15 hrs/week</option>
                    <option value="15-20 hrs/week">15-20 hrs/week</option>
                    <option value="20+ hrs/week">20+ hrs/week</option>
                    <option value="Full-time Capstone">Full-time Capstone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Bio & Capstone Goals
                </label>
                <textarea 
                  rows={3} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    GitHub URL
                  </label>
                  <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    LinkedIn URL
                  </label>
                  <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>

              <Button type="submit" variant="gradient" disabled={savingProfile}>
                <Save className="w-4 h-4 mr-2" /> {savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Technical Skill Vector Manager Card */}
      <Card className="p-6 sm:p-8 mb-8 border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" /> Algorithmic Matching Vector
            </div>
            <CardTitle className="text-xl mt-1">Verified Technical Skills</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              These skill tokens represent your node in the campus collaboration graph.
            </CardDescription>
          </div>
        </div>

        {/* Existing skill chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skills.map(s => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(s)}
                className="hover:text-red-500 transition-colors cursor-pointer"
                title="Remove Skill"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Skill Input Form */}
        <form onSubmit={handleAddSkill} className="flex gap-3 max-w-md">
          <Input 
            placeholder="Add skill (e.g. Next.js, Rust, Neo4j, PyTorch)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Skill
          </Button>
        </form>
      </Card>

      {/* My Posted Capstone Projects */}
      <Card className="p-6 sm:p-8 border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex justify-between items-center mb-6">
          <div>
            <CardTitle className="text-xl">My Capstone Projects ({userProjects.length})</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Initiatives you are currently leading on CollabForge.
            </CardDescription>
          </div>
          <Button asChild variant="gradient" size="sm">
            <Link to="/create-project">
              <FolderPlus className="w-4 h-4 mr-2" /> Post New Project
            </Link>
          </Button>
        </div>

        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProjects.map(p => (
              <Card key={p.id} className="p-5 border-zinc-200/60 dark:border-zinc-800/60">
                <Badge variant="gradient" className="mb-2">
                  {p.category}
                </Badge>
                <h4 className="font-bold text-base mb-1">{p.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                  {p.description}
                </p>
                <div className="flex justify-between items-center text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>{p.openSpots} spots remaining</span>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500 text-sm">
            You haven't posted any capstone initiatives yet. Click "Post New Project" to get started!
          </div>
        )}
      </Card>
    </div>
  );
}
