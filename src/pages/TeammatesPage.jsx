import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  Send, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  X,
  Star,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { computeCompatibilityScore } from '../utils/matchingAlgorithm';

import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

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
    return {
      ...student,
      compatibility: comp
    };
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
    setConnectMessage(`Hi ${student.name}, I found your profile on CollabForge! I'm putting together a capstone initiative and would love to collaborate based on your expertise in ${student.skills.slice(0, 2).join(' & ')}.`);
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
          <Sparkles className="w-4 h-4" /> Algorithmic Peer Matchmaker
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-heading">
          Find Capstone Teammates
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
          Peers dynamically ranked by <strong>Cosine Similarity</strong> and <strong>Jaccard Index</strong> based on your verified skill vector and availability.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 mb-8 border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by student name, university, or skill (e.g. Node.js, PyTorch)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {niches.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 px-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Availabilities</option>
              <option value="10-15 hrs/week">10-15 hrs/week</option>
              <option value="15-20 hrs/week">15-20 hrs/week</option>
              <option value="20+ hrs/week">20+ hrs/week</option>
              <option value="Full-time Capstone">Full-time Capstone</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStudents.map(student => (
          <Card key={student.id} className="p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              {/* Top Profile Bar */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{student.name}</h3>
                      {student.verified && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" title="Verified Capstone Student" />
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

                {currentUser && (
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-extrabold text-gradient font-heading">
                      {student.compatibility.score}%
                    </div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Match
                    </div>
                  </div>
                )}
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
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {student.rating} ({student.completedProjects} Capstones)
                </span>
              </div>

              {/* Technical Skills */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Technical Skill Vector:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map(s => {
                    const isShared = currentUser?.skills?.some(x => x.toLowerCase() === s.toLowerCase());
                    return (
                      <span
                        key={s}
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          isShared
                            ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {s} {isShared && '✓'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setActiveProfileModal(student)}>
                View Portfolio
              </Button>
              {currentUser ? (
                <Button variant="gradient" size="sm" onClick={() => handleOpenConnect(student)}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Invite Teammate
                </Button>
              ) : (
                <Button asChild variant="gradient" size="sm">
                  <Link to="/signup">Connect</Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

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
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">About Student</h4>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {activeProfileModal.bio}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Verified Skill Vector</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProfileModal.skills.map(s => (
                  <Badge key={s} variant="gradient">
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
                <Send className="w-3.5 h-3.5 mr-1.5" /> Invite Teammate
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

            <CardTitle className="text-xl mb-1">Collaborate with {connectStudent.name}</CardTitle>
            <CardDescription className="mb-4">
              Invite {connectStudent.name} to join your project or propose a research initiative.
            </CardDescription>

            <form onSubmit={handleSendConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Select Your Capstone Project
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
                  Personal Invitation Message
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
                  <Send className="w-4 h-4 mr-2" /> Send Invitation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
