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
  Compass
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardTitle, CardDescription } from '../components/ui/card';

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
      (project.requiredSkills || []).some(s => s.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const handleOpenApply = (project) => {
    if (!currentUser) return;
    setApplyModalProject(project);
    setApplyMessage(`Hi ${project.ownerName}, I'd love to collaborate on "${project.title}".`);
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
            <Compass className="w-4 h-4" /> Projects
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
            Find a project
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
            Browse projects and see who is looking for collaborators.
          </p>
        </div>

        <Button asChild variant="gradient">
          <Link to={currentUser ? '/create-project' : '/signup'}>
            <PlusCircle className="w-4 h-4 mr-2" /> New project
          </Link>
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="project-filters mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search projects or skills"
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
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                    : 'bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="project-list">
        {filteredProjects.map(proj => {
          const hasRequested = requests.some(r => r.projectId === proj.id && r.fromUserId === currentUser?.id);
          const isOwner = currentUser?.id === proj.ownerId;

          return (
            <article key={proj.id} className="project-listing">
              <div>
                <div className="project-listing-heading">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {proj.category}
                    </Badge>
                    <CardTitle className="text-xl">{proj.title}</CardTitle>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {proj.ownerName}{proj.ownerUniversity ? ` · ${proj.ownerUniversity}` : ''}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 max-w-3xl">
                  {proj.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {proj.openSpots} {proj.openSpots === 1 ? 'spot' : 'spots'} open
                  </span>
                  {proj.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {proj.deadline}</span>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {(proj.requiredSkills || []).map(skill => {
                      return (
                        <span
                          key={skill}
                          className="project-skill"
                        >
                          {skill}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="project-listing-actions">
                {isOwner ? (
                  <Badge variant="outline">
                    Your project
                  </Badge>
                ) : hasRequested ? (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="w-3 h-3" /> Requested
                  </Badge>
                ) : currentUser ? (
                  <Button size="sm" onClick={() => handleOpenApply(proj)}>
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Contact owner
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="gradient">
                    <Link to="/login">Sign in to contact</Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="project-empty-state">
          <p className="text-base font-semibold mb-1">No matching projects found</p>
          <p className="text-xs">Try adjusting your search criteria or category filter.</p>
        </div>
      )}

      {/* Collaboration Pitch Modal */}
      {applyModalProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 relative">
            <button
              onClick={() => setApplyModalProject(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <CardTitle className="text-xl mb-1">Contact {applyModalProject.ownerName}</CardTitle>
            <CardDescription className="mb-4">
              Send a message about <strong>{applyModalProject.title}</strong>.
            </CardDescription>

            <form onSubmit={handleSendApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Message
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
                  <Send className="w-4 h-4 mr-2" /> Send message
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
