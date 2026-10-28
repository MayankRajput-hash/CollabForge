import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ProjectContext = createContext();

const LEGACY_DEMO_PROJECT_IDS = new Set([
  'proj-neural-health',
  'proj-decentralized-mesh',
  'proj-autonomous-drone'
]);
const LEGACY_DEMO_PROFILE_IDS = new Set([
  'student-alex-chen',
  'student-priya-patel',
  'student-marcus-vance',
  'student-elena-rostova',
  'student-david-kim'
]);

export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('collabforge_projects_v2');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(project =>
          !LEGACY_DEMO_PROJECT_IDS.has(project.id)
          && !LEGACY_DEMO_PROFILE_IDS.has(project.ownerId || project.owner_id))
        : [];
    } catch {
      return [];
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('collabforge_requests_v2');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.filter(request =>
          request.id !== 'req-initial-1'
          && !LEGACY_DEMO_PROJECT_IDS.has(request.projectId || request.project_id)
          && !LEGACY_DEMO_PROFILE_IDS.has(request.fromUserId || request.from_user_id)
          && !LEGACY_DEMO_PROFILE_IDS.has(request.toUserId || request.to_user_id))
        : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync Supabase Projects and Requests if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchSupabaseProjects = async () => {
        try {
          const { data, error } = await supabase.from('projects').select('*');
          if (error) throw error;
          if (data) {
            setProjects(prev => {
              const liveProjects = data.filter(project =>
                !LEGACY_DEMO_PROJECT_IDS.has(project.id)
                && !LEGACY_DEMO_PROFILE_IDS.has(project.owner_id || project.ownerId));
              const liveIds = new Set(liveProjects.map(project => project.id));
              const combined = [...liveProjects, ...prev.filter(project => !liveIds.has(project.id))];
              return combined;
            });
          }
        } catch (err) {
          console.warn('Supabase projects fetch warning:', err);
        }
      };

      const fetchSupabaseRequests = async () => {
        try {
          const { data, error } = await supabase.from('requests').select('*');
          if (error) throw error;
          if (data) {
            setRequests(data.filter(request =>
              request.id !== 'req-initial-1'
              && !LEGACY_DEMO_PROJECT_IDS.has(request.project_id || request.projectId)
              && !LEGACY_DEMO_PROFILE_IDS.has(request.from_user_id || request.fromUserId)
              && !LEGACY_DEMO_PROFILE_IDS.has(request.to_user_id || request.toUserId)));
          }
        } catch (err) {
          console.warn('Supabase requests fetch warning:', err);
        }
      };

      fetchSupabaseProjects();
      fetchSupabaseRequests();
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('collabforge_projects_v2', JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed saving projects:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('collabforge_requests_v2', JSON.stringify(requests));
    } catch (e) {
      console.warn('Failed saving requests:', e);
    }
  }, [requests]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const addProject = async (projectData) => {
    const newProj = {
      id: `proj-${Date.now()}`,
      ownerId: currentUser?.id || 'anonymous',
      ownerName: currentUser?.name || 'Anonymous Student',
      ownerUniversity: currentUser?.university || 'University Member',
      members: [currentUser?.id || 'anonymous'],
      status: 'Recruiting Collaborators',
      requiredSkills: Array.isArray(projectData.requiredSkills) 
        ? projectData.requiredSkills 
        : (projectData.requiredSkills || '').split(',').map(s => s.trim()).filter(Boolean),
      tasks: [
        { id: `task-${Date.now()}-1`, title: 'Repository setup and baseline documentation', status: 'completed', assigneeId: currentUser?.id, assigneeName: currentUser?.name || 'Owner', priority: 'medium' },
        { id: `task-${Date.now()}-2`, title: 'Draft system architecture diagram', status: 'in-progress', assigneeId: currentUser?.id, assigneeName: currentUser?.name || 'Owner', priority: 'high' }
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Initial MVP Specification', completed: true, dueDate: 'In 2 weeks' },
        { id: `m-${Date.now()}-2`, title: 'First Sprint Integration Release', completed: false, dueDate: 'In 1 month' }
      ],
      announcements: [
        { id: `ann-${Date.now()}`, title: 'Project Created', content: `Excited to kick off ${projectData.title}! Looking for dedicated teammates.`, date: 'Just now', authorName: currentUser?.name || 'Owner' }
      ],
      ...projectData
    };

    setProjects(prev => [newProj, ...prev]);
    showToast(`Project "${newProj.title}" posted successfully!`);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').insert([newProj]);
      } catch (err) {
        console.warn('Supabase project insert warning:', err);
      }
    }

    return newProj;
  };

  const updateProject = async (projectId, updatedFields) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').update(updatedFields).eq('id', projectId);
      } catch (err) {
        console.warn('Supabase project update warning:', err);
      }
    }
  };

  // Add a task to a project dashboard
  const addProjectTask = async (projectId, taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assigneeId: taskData.assigneeId || null,
      assigneeName: taskData.assigneeName || 'Unassigned',
      dueDate: taskData.dueDate || 'Sprint 1'
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const tasks = p.tasks ? [newTask, ...p.tasks] : [newTask];
        return { ...p, tasks };
      }
      return p;
    }));

    showToast(`Task "${taskData.title}" added to project board.`);
    return newTask;
  };

  // Update a task status or details
  const updateProjectTask = async (projectId, taskId, updates) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const tasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            return { ...t, ...updates };
          }
          return t;
        });
        return { ...p, tasks };
      }
      return p;
    }));
  };

  // Delete a task
  const deleteProjectTask = async (projectId, taskId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: (p.tasks || []).filter(t => t.id !== taskId) };
      }
      return p;
    }));
    showToast('Task removed from board.', 'info');
  };

  // Add an announcement
  const addProjectAnnouncement = async (projectId, { title, content }) => {
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      date: 'Just now',
      authorName: currentUser?.name || 'Team Member'
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, announcements: [newAnnouncement, ...(p.announcements || [])] };
      }
      return p;
    }));

    showToast('Project announcement posted!');
  };

  // Toggle milestone status
  const toggleMilestone = async (projectId, milestoneId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const milestones = (p.milestones || []).map(m => {
          if (m.id === milestoneId) {
            return { ...m, completed: !m.completed };
          }
          return m;
        });
        return { ...p, milestones };
      }
      return p;
    }));
  };

  const sendCollaborationRequest = async ({ projectId, toUserId, message }) => {
    if (!currentUser) {
      showToast('Please sign in or create a profile to collaborate!', 'warning');
      return false;
    }

    const targetProject = projects.find(p => p.id === projectId);
    
    // Check if already requested
    const existing = requests.find(r => r.projectId === projectId && r.fromUserId === currentUser.id);
    if (existing) {
      showToast('You have already submitted a request to this project.', 'info');
      return false;
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      projectId,
      projectTitle: targetProject?.title || 'Capstone Project',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserNiche: currentUser.niche,
      toUserId: toUserId || targetProject?.ownerId,
      message: message || `Hi! I would love to collaborate on ${targetProject?.title}. My skills align well with your tech stack.`,
      status: 'pending',
      timestamp: 'Just now'
    };

    setRequests(prev => [newRequest, ...prev]);
    showToast(`Collaboration request sent to ${targetProject?.ownerName || 'project owner'}!`);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').insert([newRequest]);
      } catch (err) {
        console.warn('Supabase request insert warning:', err);
      }
    }

    return true;
  };

  const updateRequestStatus = async (requestId, status) => {
    const targetReq = requests.find(r => r.id === requestId);

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status };
      }
      return req;
    }));

    if (status === 'accepted') {
      showToast('Collaboration request accepted! Teammate added to the project roster.');
      // Automatically add user to project members list and decrement open spots if possible
      if (targetReq?.projectId) {
        setProjects(prev => prev.map(p => {
          if (p.id === targetReq.projectId) {
            const currentMembers = Array.isArray(p.members) ? p.members : [];
            const updatedMembers = currentMembers.includes(targetReq.fromUserId) 
              ? currentMembers 
              : [...currentMembers, targetReq.fromUserId];
            const updatedOpenSpots = Math.max(0, (p.openSpots || 1) - 1);
            return {
              ...p,
              members: updatedMembers,
              openSpots: updatedOpenSpots
            };
          }
          return p;
        }));
      }
    } else {
      showToast('Collaboration request declined.', 'info');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').update({ status }).eq('id', requestId);
      } catch (err) {
        console.warn('Supabase status update warning:', err);
      }
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      requests,
      toastMessage,
      showToast,
      addProject,
      updateProject,
      addProjectTask,
      updateProjectTask,
      deleteProjectTask,
      addProjectAnnouncement,
      toggleMilestone,
      sendCollaborationRequest,
      updateRequestStatus
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectContext);
}
