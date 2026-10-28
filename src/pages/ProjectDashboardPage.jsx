import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Send, 
  ArrowLeft, 
  MessageSquare, 
  Check, 
  AlertCircle,
  ExternalLink,
  Globe,
  Layers,
  Sparkles,
  Kanban,
  Flag,
  Radio,
  FileCode2,
  Megaphone,
  UserCheck
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

export default function ProjectDashboardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { 
    projects, 
    addProjectTask, 
    updateProjectTask, 
    deleteProjectTask, 
    addProjectAnnouncement, 
    toggleMilestone,
    sendCollaborationRequest,
    requests
  } = useProjects();
  const { currentUser, users } = useAuth();
  const { openChatWith } = useChat();

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'milestones', 'announcements', 'overview'
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');

  // Find targeted project
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <p className="text-xs text-zinc-500 mb-6">The project you are looking for does not exist or has been archived.</p>
          <Button asChild variant="gradient">
            <Link to="/projects">Return to projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === project.ownerId;
  const isMember = isOwner || (project.members || []).includes(currentUser?.id);

  // Map project member IDs to full student objects
  const projectMembers = (project.members || []).map(memberId => {
    return users.find(u => u.id === memberId) || {
      id: memberId,
      name: memberId === project.ownerId ? project.ownerName : 'Team Collaborator',
      university: project.ownerUniversity || 'Member',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${memberId}`,
      niche: 'Contributor'
    };
  });

  const tasks = project.tasks || [];
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const milestones = project.milestones || [];
  const announcements = project.announcements || [];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignee = projectMembers.find(m => m.id === newTaskAssigneeId);

    addProjectTask(project.id, {
      title: newTaskTitle.trim(),
      status: newTaskStatus,
      priority: newTaskPriority,
      assigneeId: newTaskAssigneeId || null,
      assigneeName: assignee ? assignee.name : 'Unassigned'
    });

    setNewTaskTitle('');
    setNewTaskAssigneeId('');
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    addProjectAnnouncement(project.id, {
      title: announcementTitle.trim(),
      content: announcementContent.trim()
    });

    setAnnouncementTitle('');
    setAnnouncementContent('');
  };

  const handleChatWithMember = (memberId) => {
    openChatWith(memberId);
    navigate(`/messages?partnerId=${memberId}`);
  };

  // Progress percentage calculation
  const totalItems = tasks.length + milestones.length;
  const completedItems = tasks.filter(t => t.status === 'completed').length + milestones.filter(m => m.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      {/* Back Link & Header */}
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium mb-3">
          <ArrowLeft size={14} /> Back to Projects
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="outline">{project.category}</Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3 h-3 mr-1 animate-pulse" /> Active Workspace
              </Badge>
              {isOwner && (
                <Badge variant="gradient" className="text-[10px]">
                  Project Lead
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Led by <span className="font-semibold text-zinc-800 dark:text-zinc-200">{project.ownerName}</span> ({project.ownerUniversity || 'Member'})
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {project.ownerId !== currentUser?.id && (
              <Button 
                variant="gradient" 
                size="sm" 
                onClick={() => handleChatWithMember(project.ownerId)}
                className="gap-1.5 text-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message Owner
              </Button>
            )}

            {project.githubRepo && (
              <a 
                href={project.githubRepo} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary text-xs py-2 px-3 gap-1.5 inline-flex items-center"
              >
                <Globe size={14} /> Repository
              </a>
            )}

            {project.liveDemo && (
              <a 
                href={project.liveDemo} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-secondary text-xs py-2 px-3 gap-1.5 inline-flex items-center"
              >
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Sprint Progress
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
            <span className="text-xs text-zinc-400">{completedItems} of {totalItems} items done</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Active Team
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{projectMembers.length} Members</span>
            <div className="flex -space-x-2">
              {projectMembers.slice(0, 3).map((m, idx) => (
                <img
                  key={idx}
                  src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                  alt={m.name}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 object-cover"
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            {project.openSpots} open collaborator {project.openSpots === 1 ? 'spot' : 'spots'}
          </div>
        </Card>

        <Card className="p-4 bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Tasks in Pipeline
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{tasks.length} Tasks</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
              {inProgressTasks.length} in progress
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-2">
            {completedTasks.length} completed, {todoTasks.length} queued
          </div>
        </Card>

        <Card className="p-4 bg-white/70 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800/80">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Target Target Deadline
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {project.deadline || 'Ongoing'}
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Sprint Cycle #1
          </div>
        </Card>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`tab-pill px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'kanban'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Kanban size={16} /> Kanban Task Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`tab-pill px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'milestones'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Flag size={16} /> Milestones ({milestones.length})
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`tab-pill px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'announcements'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Megaphone size={16} /> Announcements ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`tab-pill px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'roster'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Users size={16} /> Team Roster ({projectMembers.length})
        </button>
      </div>

      {/* TAB 1: KANBAN SPRINT TASK BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-6">
          {/* Quick Add Task Form */}
          <Card className="p-4 border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
            <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3 items-center">
              <Input
                placeholder="Add a new deliverable or task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-950/70"
                required
              />

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 px-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>

                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 px-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <select
                  value={newTaskAssigneeId}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 px-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                >
                  <option value="">Assign Member...</option>
                  {projectMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                <Button type="submit" variant="gradient" className="gap-1.5 shrink-0">
                  <Plus size={16} /> Add Task
                </Button>
              </div>
            </form>
          </Card>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* COLUMN 1: TO DO */}
            <div className="flex flex-col bg-zinc-100/60 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 min-h-[400px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Circle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>To Do</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">{todoTasks.length}</Badge>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {todoTasks.map(task => (
                  <Card key={task.id} className="p-3.5 shadow-sm hover:shadow-md transition-all border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-semibold leading-snug">{task.title}</span>
                      <button 
                        onClick={() => deleteProjectTask(project.id, task.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span className="flex items-center gap-1 font-medium">
                        {task.assigneeName}
                      </span>
                      <button
                        onClick={() => updateProjectTask(project.id, task.id, { status: 'in-progress' })}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                      >
                        Start &rarr;
                      </button>
                    </div>
                  </Card>
                ))}

                {todoTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-zinc-400 italic">
                    No tasks waiting.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div className="flex flex-col bg-zinc-100/60 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 min-h-[400px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>In Progress</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400">{inProgressTasks.length}</Badge>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {inProgressTasks.map(task => (
                  <Card key={task.id} className="p-3.5 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-all border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-semibold leading-snug">{task.title}</span>
                      <button 
                        onClick={() => deleteProjectTask(project.id, task.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span className="flex items-center gap-1 font-medium">
                        {task.assigneeName}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateProjectTask(project.id, task.id, { status: 'todo' })}
                          className="text-zinc-400 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => updateProjectTask(project.id, task.id, { status: 'completed' })}
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                        >
                          Complete &rarr;
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}

                {inProgressTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-zinc-400 italic">
                    Nothing actively in progress.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: COMPLETED */}
            <div className="flex flex-col bg-zinc-100/60 dark:bg-zinc-900/60 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 min-h-[400px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Completed</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{completedTasks.length}</Badge>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {completedTasks.map(task => (
                  <Card key={task.id} className="p-3.5 shadow-sm border-l-4 border-l-emerald-500 bg-emerald-500/5 opacity-90 transition-all border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-semibold leading-snug line-through text-zinc-500">{task.title}</span>
                      <button 
                        onClick={() => deleteProjectTask(project.id, task.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span>Completed by {task.assigneeName}</span>
                      <button
                        onClick={() => updateProjectTask(project.id, task.id, { status: 'in-progress' })}
                        className="text-zinc-500 hover:underline cursor-pointer"
                      >
                        Reopen
                      </button>
                    </div>
                  </Card>
                ))}

                {completedTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-zinc-400 italic">
                    No deliverables finished yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPRINT MILESTONES */}
      {activeTab === 'milestones' && (
        <Card className="p-6 border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold">Key Project Milestones</h3>
              <p className="text-xs text-zinc-500">Track critical deadlines, clinical deliverables, and submission milestones.</p>
            </div>
          </div>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {milestones.map(m => (
              <div key={m.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMilestone(project.id, m.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      m.completed 
                        ? 'bg-emerald-500 text-white' 
                        : 'border-2 border-zinc-300 dark:border-zinc-700 hover:border-indigo-500'
                    }`}
                  >
                    {m.completed && <Check size={14} />}
                  </button>
                  <div>
                    <h4 className={`text-sm font-semibold ${m.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {m.title}
                    </h4>
                    <span className="text-xs text-zinc-400">Target due date: {m.dueDate}</span>
                  </div>
                </div>

                <Badge variant={m.completed ? 'secondary' : 'outline'} className={m.completed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}>
                  {m.completed ? 'Passed & Verified' : 'In Progress'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Post announcement */}
          <Card className="p-5 border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="text-base font-bold mb-1">Post Team Announcement</h3>
            <p className="text-xs text-zinc-500 mb-4">Broadcast a milestone or meeting agenda to teammates.</p>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <Input
                placeholder="Announcement headline (e.g. Sprint 1 Demo Completed)"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Provide notes, release links, or testing steps..."
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" variant="gradient" size="sm" className="gap-1.5">
                  <Megaphone size={14} /> Broadcast update
                </Button>
              </div>
            </form>
          </Card>

          {/* Announcements stream */}
          <div className="space-y-4">
            {announcements.map(ann => (
              <Card key={ann.id} className="p-5 border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{ann.title}</h4>
                  <span className="text-xs text-zinc-400">{ann.date}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                  {ann.content}
                </p>
                <div className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                  Posted by {ann.authorName}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TEAM ROSTER */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectMembers.map(member => (
            <Card key={member.id} className="p-5 flex items-center justify-between border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-3.5">
                <img
                  src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{member.name}</h4>
                    {member.id === project.ownerId && (
                      <Badge variant="outline" className="text-[10px] py-0">Lead</Badge>
                    )}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {member.niche || 'Collaborator'}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {member.university || 'University Member'}
                  </div>
                </div>
              </div>

              <div>
                {member.id !== currentUser?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleChatWithMember(member.id)}
                    className="text-xs gap-1.5"
                  >
                    <MessageSquare size={13} /> Chat
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
