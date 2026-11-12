import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const createRecordId = prefix =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;

function fromSupabaseProject(project) {
  const members = Array.isArray(project.members) ? project.members : [];
  const requiredSkills = Array.isArray(project.required_skills)
    ? project.required_skills
    : typeof project.required_skills === 'string'
      ? project.required_skills.split(',').map(skill => skill.trim()).filter(Boolean)
      : [];
  return {
    ...project,
    ownerId: project.owner_id,
    ownerName: project.owner_name,
    ownerUniversity: project.owner_university || '',
    requiredSkills,
    openSpots: project.open_spots ?? 0,
    totalSpots: project.total_spots ?? 1,
    members: members.includes(project.owner_id) ? members : [...members, project.owner_id],
    githubRepo: project.github_repo || '',
    liveDemo: project.live_demo || '',
    tasks: project.tasks || [],
    milestones: project.milestones || [],
    announcements: project.announcements || []
  };
}

function toSupabaseProject(project) {
  const columnMap = {
    ownerId: 'owner_id',
    ownerName: 'owner_name',
    ownerUniversity: 'owner_university',
    requiredSkills: 'required_skills',
    openSpots: 'open_spots',
    totalSpots: 'total_spots',
    githubRepo: 'github_repo',
    liveDemo: 'live_demo'
  };

  return Object.fromEntries(
    Object.entries(project).map(([key, value]) => [columnMap[key] || key, value])
  );
}

function fromSupabaseRequest(request) {
  return {
    ...request,
    projectId: request.project_id,
    projectTitle: request.project_title,
    fromUserId: request.from_user_id,
    fromUserName: request.from_user_name,
    fromUserNiche: request.from_user_niche,
    toUserId: request.to_user_id,
    timestamp: request.created_at || 'Just now'
  };
}

function toSupabaseRequest(request) {
  return {
    id: request.id,
    project_id: request.projectId,
    project_title: request.projectTitle,
    from_user_id: request.fromUserId,
    from_user_name: request.fromUserName,
    from_user_niche: request.fromUserNiche,
    to_user_id: request.toUserId,
    message: request.message,
    status: request.status
  };
}

export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState(() => {
    if (isSupabaseConfigured) return [];
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
    if (isSupabaseConfigured) return [];
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
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    window.setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Sync Supabase Projects and Requests if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchSupabaseProjects = async () => {
        try {
          const { data, error } = await supabase.from('projects').select('*');
          if (error) throw error;
          setProjects((data || [])
            .filter(project =>
              !LEGACY_DEMO_PROJECT_IDS.has(project.id)
              && !LEGACY_DEMO_PROFILE_IDS.has(project.owner_id || project.ownerId))
            .map(fromSupabaseProject));
        } catch (err) {
          console.warn('Supabase projects fetch warning:', err);
          showToast(`Could not load projects: ${err.message}`, 'warning');
        }
      };

      const fetchSupabaseRequests = async () => {
        try {
          const { data, error } = await supabase.from('requests').select('*');
          if (error) throw error;
          setRequests((data || [])
            .filter(request =>
              request.id !== 'req-initial-1'
              && !LEGACY_DEMO_PROJECT_IDS.has(request.project_id || request.projectId)
              && !LEGACY_DEMO_PROFILE_IDS.has(request.from_user_id || request.fromUserId)
              && !LEGACY_DEMO_PROFILE_IDS.has(request.to_user_id || request.toUserId))
            .map(fromSupabaseRequest));
        } catch (err) {
          console.warn('Supabase requests fetch warning:', err);
          showToast(`Could not load collaboration requests: ${err.message}`, 'warning');
        }
      };

      Promise.all([fetchSupabaseProjects(), fetchSupabaseRequests()])
        .finally(() => setIsLoading(false));
    }
  }, [showToast]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem('collabforge_projects_v2', JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed saving projects:', e);
    }
  }, [projects]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem('collabforge_requests_v2', JSON.stringify(requests));
    } catch (e) {
      console.warn('Failed saving requests:', e);
    }
  }, [requests]);

  const addProject = async (projectData) => {
    if (!currentUser) {
      showToast('Sign in before creating a project.', 'warning');
      return null;
    }
    const openSpots = Number(projectData.openSpots ?? 2);
    if (!Number.isInteger(openSpots) || openSpots < 1 || openSpots > 8) {
      showToast('Choose between 1 and 8 collaborator spots.', 'warning');
      return null;
    }

    const newProj = {
      ...projectData,
      id: createRecordId('proj'),
      ownerId: currentUser?.id || 'anonymous',
      ownerName: currentUser?.name || 'Anonymous Student',
      ownerUniversity: currentUser?.university || 'University Member',
      members: [currentUser?.id || 'anonymous'],
      status: 'Recruiting Collaborators',
      openSpots,
      totalSpots: openSpots + 1,
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
        { id: createRecordId('ann'), title: 'Project Created', content: `Excited to kick off ${projectData.title}! Looking for dedicated teammates.`, date: 'Just now', authorName: currentUser?.name || 'Owner' }
      ]
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([toSupabaseProject(newProj)])
          .select('id')
          .single();
        if (error) throw error;
        if (!data) throw new Error('The server did not confirm the project was saved.');
      } catch (err) {
        showToast(`Could not publish project: ${err.message}`, 'warning');
        return null;
      }
    }

    setProjects(prev => [newProj, ...prev]);
    showToast(`Project "${newProj.title}" posted successfully!`);
    return newProj;
  };

  const updateProject = async (projectId, updatedFields) => {
    const project = projects.find(item => item.id === projectId);
    const isMember = currentUser && (
      currentUser.id === project?.ownerId || (project?.members || []).includes(currentUser.id)
    );
    if (!project || !isMember) {
      showToast('You do not have permission to change this project.', 'warning');
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('projects')
          .update(toSupabaseProject(updatedFields))
          .eq('id', projectId)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Project not found or you do not have permission to change it.');
      } catch (err) {
        showToast(`Could not save project changes: ${err.message}`, 'warning');
        return false;
      }
    }

    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updatedFields } : p));
    return true;
  };

  // Add a task to a project dashboard
  const addProjectTask = async (projectId, taskData) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    const newTask = {
      id: createRecordId('task'),
      title: taskData.title,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assigneeId: taskData.assigneeId || null,
      assigneeName: taskData.assigneeName || 'Unassigned',
      dueDate: taskData.dueDate || 'Sprint 1'
    };

    const saved = await updateProject(projectId, { tasks: [newTask, ...(project.tasks || [])] });
    if (!saved) return false;

    showToast(`Task "${taskData.title}" added to project board.`);
    return true;
  };

  // Update a task status or details
  const updateProjectTask = async (projectId, taskId, updates) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    const tasks = (project.tasks || []).map(task => task.id === taskId ? { ...task, ...updates } : task);
    return updateProject(projectId, { tasks });
  };

  // Delete a task
  const deleteProjectTask = async (projectId, taskId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    const saved = await updateProject(projectId, {
      tasks: (project.tasks || []).filter(task => task.id !== taskId)
    });
    if (!saved) return false;
    showToast('Task removed from board.', 'info');
    return true;
  };

  // Add an announcement
  const addProjectAnnouncement = async (projectId, { title, content }) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    const newAnnouncement = {
      id: createRecordId('ann'),
      title,
      content,
      date: 'Just now',
      authorName: currentUser?.name || 'Team Member'
    };

    const saved = await updateProject(projectId, {
      announcements: [newAnnouncement, ...(project.announcements || [])]
    });
    if (!saved) return false;

    showToast('Project announcement posted!');
    return true;
  };

  // Toggle milestone status
  const toggleMilestone = async (projectId, milestoneId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    const milestones = (project.milestones || []).map(milestone =>
      milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
    );
    return updateProject(projectId, { milestones });
  };

  const sendCollaborationRequest = async ({ projectId, toUserId, message }) => {
    if (!currentUser) {
      showToast('Please sign in or create a profile to collaborate!', 'warning');
      return false;
    }

    const targetProject = projects.find(p => p.id === projectId);
    
    // Check if already requested
    if (!targetProject) {
      showToast('This project is no longer available.', 'warning');
      return false;
    }
    if ((targetProject.openSpots ?? 0) <= 0) {
      showToast('This project has no open collaborator spots.', 'warning');
      return false;
    }
    const recipientId = toUserId || targetProject.ownerId;
    if (targetProject.ownerId !== currentUser.id && targetProject.ownerId !== recipientId) {
      showToast('A collaboration request must include the project owner.', 'warning');
      return false;
    }

    const existing = requests.find(r =>
      r.projectId === projectId
      && r.fromUserId === currentUser.id
      && r.toUserId === recipientId
      && r.status !== 'declined'
    );
    if (existing) {
      showToast('You have already submitted a request to this project.', 'info');
      return false;
    }

    const newRequest = {
      id: createRecordId('req'),
      projectId,
      projectTitle: targetProject?.title || 'Capstone Project',
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserNiche: currentUser.niche,
      toUserId: recipientId,
      message: message || `Hi! I would love to collaborate on ${targetProject?.title}. My skills align well with your tech stack.`,
      status: 'pending',
      timestamp: 'Just now'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('requests')
          .insert([toSupabaseRequest(newRequest)])
          .select('id')
          .single();
        if (error) throw error;
        if (!data) throw new Error('The server did not confirm the request was sent.');
      } catch (err) {
        showToast(`Could not send request: ${err.message}`, 'warning');
        return false;
      }
    }

    setRequests(prev => [newRequest, ...prev]);
    showToast(`Collaboration request sent to ${targetProject.ownerName || 'project owner'}!`);
    return true;
  };

  const updateRequestStatus = async (requestId, status) => {
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq || !currentUser || targetReq.toUserId !== currentUser.id) {
      showToast('This request cannot be updated from your account.', 'warning');
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('respond_to_collaboration_request', {
          p_request_id: requestId,
          p_response_status: status
        });
        if (error) throw error;
        const result = Array.isArray(data) ? data[0] : data;
        if (!result) throw new Error('The server did not confirm the request update.');

        if (result.response_status === 'accepted') {
          setProjects(prev => prev.map(project =>
            project.id === result.project_id
              ? { ...project, members: result.members || [], openSpots: result.open_spots }
              : project
          ));
        }
      } catch (err) {
        showToast(`Could not update request: ${err.message}`, 'warning');
        return false;
      }
    }

    setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));

    if (status === 'accepted') {
      const project = projects.find(item => item.id === targetReq.projectId);
      if (!isSupabaseConfigured && project) {
        const newMemberId = project.ownerId === targetReq.fromUserId
          ? targetReq.toUserId
          : targetReq.fromUserId;
        const members = project.members || [];
        const alreadyMember = members.includes(newMemberId);
        if (!alreadyMember && (project.openSpots || 0) <= 0) {
          setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'pending' } : req));
          showToast('This project has no open collaborator spots.', 'warning');
          return false;
        }
        setProjects(prev => prev.map(item => item.id === project.id ? {
          ...item,
          members: alreadyMember ? members : [...members, newMemberId],
          openSpots: alreadyMember ? project.openSpots : Math.max(project.openSpots - 1, 0)
        } : item));
      }
      showToast('Collaboration request accepted!');
    } else {
      showToast('Collaboration request declined.', 'info');
    }
    return true;
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      isLoading,
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
