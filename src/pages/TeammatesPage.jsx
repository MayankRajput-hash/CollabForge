import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, 
  Clock, 
  CheckCircle, 
  Send, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { computeCompatibilityScore } from '../utils/matchingAlgorithm';

import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardTitle, CardDescription } from '../components/ui/card';

export default function TeammatesPage() {
  const { users, currentUser } = useAuth();
  const { sendCollaborationRequest, projects } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [activeProfileModal, setActiveProfileModal] = useState(null);
  const [connectStudent, setConnectStudent] = useState(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectProjectId, setConnectProjectId] = useState('');

  const niches = [
    'All',
    'Full-Stack Engineering',
    'AI & Data Science',
    'Cloud & DevOps Architecture',
    'UI/UX & Frontend Architecture',
    'Cybersecurity & Blockchain',
    'Mobile App Development'
  ];

  // Exclude current user from prospective candidate cards
  const candidateStudents = users.filter(u => u.id !== currentUser?.id);

  // Compute live match scores using Cosine Similarity & Jaccard Index
  const scoredStudents = candidateStudents.map(student => {
    const comp = currentUser 
      ? computeCompatibilityScore(currentUser, student) 
      : { score: 75, jaccardScore: 60, cosineScore: 80, sharedSkills: [], missingSkills: [] };
    return { ...student, compatibility: comp };
  }).sort((a, b) => b.compatibility.score - a.compatibility.score);

  // Filter students
  const filteredStudents = scoredStudents.filter(student => {
    const matchesNiche = selectedNiche === 'All' || student.niche === selectedNiche;
    const matchesAvailability = selectedAvailability === 'All' || student.availability === selectedAvailability;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(query) ||
      student.university.toLowerCase().includes(query) ||
      student.skills.some(s => s.toLowerCase().includes(query)) ||
      student.bio.toLowerCase().includes(query);

    return matchesNiche && matchesAvailability && matchesSearch;
  });

  const handleOpenConnect = (student) => {
    if (!currentUser) return;
    setConnectStudent(student);
    const userProjects = projects.filter(p => p.ownerId === currentUser.id);
    const defaultProjId = userProjects[0]?.id || projects[0]?.id || '';
    setConnectProjectId(defaultProjId);
    setConnectMessage(`Hi ${student.name}, I'd like to connect about working together.`);
  };

  const handleSendConnect = (e) => {
    e.preventDefault();
    if (!connectStudent) return;

    sendCollaborationRequest({
      projectId: connectProjectId,
      toUserId: connectStudent.id,
      message: connectMessage
    });

    setConnectStudent(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" /> People to work with
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
          Find collaborators
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
          Browse profiles by skills and availability.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="project-filters mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search people or skills"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Focus Area Tabs with animations */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-1.5 flex-wrap items-center" role="tablist" aria-label="Role Niches">
            {niches.map(n => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={selectedNiche === n}
                onClick={() => setSelectedNiche(n)}
                className={`tab-pill text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  selectedNiche === n
                    ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                    : 'bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                {n === 'UI/UX & Frontend Architecture' ? 'UI/UX & Frontend' : n === 'Cloud & DevOps Architecture' ? 'Cloud & DevOps' : n}
              </button>
            ))}

            {(selectedNiche !== 'All' || selectedAvailability !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedNiche('All');
                  setSelectedAvailability('All');
                  setSearchQuery('');
                }}
                className="text-xs px-2 py-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-medium ml-1"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">Availability:</span>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Availabilities</option>
              <option value="10-15 hrs/week">10-15 hrs/week</option>
              <option value="15-20 hrs/week">15-20 hrs/week</option>
              <option value="20+ hrs/week">20+ hrs/week</option>
              <option value="Full-time Capstone">Full-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* People Grid with animated tab switch */}
      <div key={`${selectedNiche}-${selectedAvailability}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 tab-content-enter">
        {filteredStudents.map(student => (
          <Card key={student.id} className="people-listing flex flex-col justify-between">
            <div>
              {/* Top Profile Bar */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{student.name}</h3>
                      {student.verified && (
                        <CheckCircle className="w-4 h-4 text-zinc-500" title="Verified account" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {student.niche}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {student.university} • {student.cohort}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
                {student.bio}
              </p>

              {/* Availability & Rating */}
              <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {student.availability}
                </span>
              </div>

              {/* Technical Skills */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map(s => {
                    const isShared = currentUser?.skills?.some(x => x.toLowerCase() === s.toLowerCase());
                    return (
                      <span
                        key={s}
                        className={`project-skill ${isShared ? 'project-skill-shared' : ''}`}
                      >
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setActiveProfileModal(student)}>
                View profile
              </Button>
              
              <div className="flex items-center gap-2">
                {currentUser && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/messages?partnerId=${student.id}`}>
                      Chat &rarr;
                    </Link>
                  </Button>
                )}

                {currentUser ? (
                  <Button variant="gradient" size="sm" onClick={() => handleOpenConnect(student)}>
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Invite
                  </Button>
                ) : (
                  <Button asChild variant="gradient" size="sm">
                    <Link to="/signup">Sign in to connect</Link>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {filteredStudents.length === 0 && (
        <div className="project-empty-state">
          <p className="text-base font-semibold mb-1">
            {candidateStudents.length === 0 ? 'No collaborator profiles yet' : 'No profiles found'}
          </p>
          <p className="text-sm">
            {candidateStudents.length === 0
              ? 'New profiles will appear here when students join CollabForge.'
              : 'Try another search or filter.'}
          </p>
        </div>
      )}

      {/* Full Student Profile Modal */}
      {activeProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveProfileModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeProfileModal.avatar}
                alt={activeProfileModal.name}
                className="w-16 h-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
              />
              <div>
                <h2 className="text-xl font-bold">{activeProfileModal.name}</h2>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeProfileModal.niche}
                </div>
                <div className="text-xs text-zinc-500">
                  {activeProfileModal.university} • {activeProfileModal.cohort}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">About</h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {activeProfileModal.bio}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProfileModal.skills.map(s => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex gap-2">
                {activeProfileModal.github && (
                  <a href={activeProfileModal.github} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500">
                    <Globe className="w-3 h-3" /> GitHub
                  </a>
                )}
                {activeProfileModal.linkedin && (
                  <a href={activeProfileModal.linkedin} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500">
                    <ExternalLink className="w-3 h-3" /> LinkedIn
                  </a>
                )}
              </div>

              <Button 
                variant="gradient" 
                size="sm"
                onClick={() => {
                  setActiveProfileModal(null);
                  handleOpenConnect(activeProfileModal);
                }}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Send a message
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Connect & Invite Modal */}
      {connectStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setConnectStudent(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <CardTitle className="text-xl mb-1">Message {connectStudent.name}</CardTitle>
            <CardDescription className="mb-4">
              Choose a project and say hello.
            </CardDescription>

            <form onSubmit={handleSendConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Project
                </label>
                <select
                  value={connectProjectId}
                  onChange={(e) => setConnectProjectId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setConnectStudent(null)}>
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
