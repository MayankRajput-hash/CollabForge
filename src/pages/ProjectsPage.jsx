import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  Users, 
  Calendar, 
  Send, 
  Check, 
  X,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { computeCompatibilityScore } from '../utils/matchingAlgorithm';

import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function ProjectsPage() {
  const { projects, sendCollaborationRequest, requests } = useProjects();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');

  const categories = ['All', 'AI & HealthTech', 'IoT & CleanTech', 'Cybersecurity & Web3', 'Cloud Infrastructure', 'FinTech & Analytics'];

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.requiredSkills.some(s => s.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const handleOpenApply = (project) => {
    if (!currentUser) return;
    setApplyModalProject(project);
    setApplyMessage(`Hi ${project.ownerName}, I'd love to join your team for "${project.title}". My experience in ${currentUser.skills.slice(0, 3).join(', ')} directly aligns with your requirements!`);
  };

  const handleSendApplication = (e) => {
    e.preventDefault();
    if (!applyModalProject) return;

    sendCollaborationRequest({
      projectId: applyModalProject.id,
      toUserId: applyModalProject.ownerId,
      message: applyMessage
    });

    setApplyModalProject(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> Capstone Project Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
            Discover Projects & Research
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Explore active academic initiatives looking for specific technical niches and complementary skills.
          </p>
        </div>

        <Button asChild variant="gradient">
          <Link to={currentUser ? '/create-project' : '/signup'}>
            <PlusCircle className="w-4 h-4 mr-2" /> Post Capstone Project
          </Link>
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 sm:p-5 mb-8 border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by title, description, or skill (e.g. React, Docker, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 flex-wrap w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map(proj => {
          const compatibility = currentUser ? computeCompatibilityScore(currentUser, proj) : null;
          const hasRequested = requests.some(r => r.projectId === proj.id && r.fromUserId === currentUser?.id);
          const isOwner = currentUser?.id === proj.ownerId;

          return (
            <Card key={proj.id} className="p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <Badge variant="gradient" className="mb-2">
                      {proj.category}
                    </Badge>
                    <CardTitle className="text-xl">{proj.title}</CardTitle>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Posted by <strong>{proj.ownerName}</strong> • {proj.ownerUniversity}
                    </p>
                  </div>

                  {compatibility && (
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold text-gradient font-heading">
                        {compatibility.score}%
                      </div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Match
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> <strong>{proj.openSpots}</strong> open / {proj.totalSpots} spots
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {proj.deadline}
                  </span>
                  {proj.architecture && (
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> {proj.architecture}
                    </span>
                  )}
                </div>

                {/* Required Skills */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Required Stack:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.requiredSkills.map(skill => {
                      const isUserSkill = currentUser?.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                      return (
                        <span
                          key={skill}
                          className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                            isUserSkill
                              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {skill} {isUserSkill && '✓'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {proj.status}
                </span>

                {isOwner ? (
                  <Badge variant="outline" className="text-indigo-500">
                    Your Initiative
                  </Badge>
                ) : hasRequested ? (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="w-3 h-3 text-emerald-500" /> Requested
                  </Badge>
                ) : currentUser ? (
                  <Button size="sm" onClick={() => handleOpenApply(proj)}>
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Apply to Team
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="gradient">
                    <Link to="/signup">Join to Apply</Link>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center text-zinc-500">
          <p className="text-base font-semibold mb-1">No matching projects found</p>
          <p className="text-xs">Try adjusting your search criteria or category filter.</p>
        </Card>
      )}

      {/* Collaboration Pitch Modal */}
      {applyModalProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setApplyModalProject(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <CardTitle className="text-xl mb-1">Apply to Join {applyModalProject.title}</CardTitle>
            <CardDescription className="mb-4">
              Send a collaboration pitch directly to project owner <strong>{applyModalProject.ownerName}</strong>.
            </CardDescription>

            <form onSubmit={handleSendApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Your Pitch & Weekly Availability
                </label>
                <textarea
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setApplyModalProject(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">
                  <Send className="w-4 h-4 mr-2" /> Send Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
