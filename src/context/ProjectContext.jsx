import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();

  // Known legacy mock/demo project IDs to purge
  const DEMO_PROJECT_IDS = new Set(['proj-101', 'proj-102', 'proj-103', 'proj-104']);

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('collabforge_projects');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Remove any legacy mock/demo projects
      const cleaned = Array.isArray(parsed) ? parsed.filter(p => !DEMO_PROJECT_IDS.has(p?.id)) : [];
      return cleaned;
    } catch {
      return [];
    }
  });

  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('collabforge_requests');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Remove any mock demo requests associated with demo projects
      const cleaned = Array.isArray(parsed) ? parsed.filter(r => !DEMO_PROJECT_IDS.has(r?.projectId) && r?.id !== 'req-1') : [];
      return cleaned;
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
          if (data && !error) {
            // Keep only non-demo real projects
            const validRealProjects = data.filter(d => !DEMO_PROJECT_IDS.has(d.id));
            setProjects(validRealProjects);
          }
        } catch (err) {
          console.warn('Supabase projects fetch warning:', err);
        }
      };

      const fetchSupabaseRequests = async () => {
        try {
          const { data, error } = await supabase.from('requests').select('*');
          if (data && !error) {
            const validRealRequests = data.filter(r => !DEMO_PROJECT_IDS.has(r.projectId));
            setRequests(validRealRequests);
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
    localStorage.setItem('collabforge_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('collabforge_requests', JSON.stringify(requests));
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
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status };
      }
      return req;
    }));

    if (status === 'accepted') {
      showToast('Collaboration request accepted! Teammate added to the project roster.');
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
