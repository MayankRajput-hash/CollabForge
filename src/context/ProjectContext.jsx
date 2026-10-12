import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INITIAL_PROJECTS = [
  {
    id: 'proj-101',
    title: 'EcoTrack IoT & Carbon Footprint Engine',
    category: 'IoT & CleanTech',
    ownerId: 'user-1',
    ownerName: 'Jane Doe',
    ownerUniversity: 'Stanford University',
    description: 'A distributed IoT dashboard collecting sensor telemetry across university labs to quantify, verify, and reduce academic carbon emissions via automated audits.',
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'Docker', 'MQTT', 'Express'],
    openSpots: 2,
    totalSpots: 4,
    members: ['user-1'],
    deadline: 'Spring 2026',
    status: 'Recruiting Collaborators',
    architecture: 'Microservices with Node.js & Docker'
  },
  {
    id: 'proj-102',
    title: 'MedGraph: Clinical Trial Algorithmic Matcher',
    category: 'AI & HealthTech',
    ownerId: 'user-2',
    ownerName: 'Alex Smith',
    ownerUniversity: 'MIT',
    description: 'Graph-based deep learning system modeling relationships between genomic markers, clinical trial requirements, and patient records using Neo4j and Cosine Similarity.',
    requiredSkills: ['Python', 'Neo4j', 'FastAPI', 'PyTorch', 'Vector DB', 'React'],
    openSpots: 1,
    totalSpots: 3,
    members: ['user-2'],
    deadline: 'Fall 2026',
    status: 'In Prototyping',
    architecture: 'Graph Database & Deep Neural Network'
  },
  {
    id: 'proj-103',
    title: 'UniCred: Cryptographic Credential Protocol',
    category: 'Cybersecurity & Web3',
    ownerId: 'user-5',
    ownerName: 'Sara Lindqvist',
    ownerUniversity: 'KTH Royal Institute',
    description: 'Decentralized identity protocol allowing university graduates to cryptographically prove degrees and capstone credentials using JWTs and Zero-Knowledge proofs.',
    requiredSkills: ['Solidity', 'Rust', 'OAuth 2.0', 'JWT', 'React', 'Node.js'],
    openSpots: 2,
    totalSpots: 4,
    members: ['user-5'],
    deadline: 'Spring 2026',
    status: 'Recruiting Collaborators',
    architecture: 'Hybrid Cloud Microservices + Smart Contracts'
  },
  {
    id: 'proj-104',
    title: 'CampusMesh: High-Throughput Resource Scheduler',
    category: 'Cloud Infrastructure',
    ownerId: 'user-3',
    ownerName: 'Priya Sharma',
    ownerUniversity: 'Carnegie Mellon University',
    description: 'Scalable cloud infrastructure managing containerized high-performance computing tasks across academic computer labs with auto-scaling Kubernetes controllers.',
    requiredSkills: ['Docker', 'Kubernetes', 'Go', 'AWS', 'PostgreSQL', 'Terraform'],
    openSpots: 3,
    totalSpots: 5,
    members: ['user-3'],
    deadline: 'Fall 2026',
    status: 'Recruiting Collaborators',
    architecture: 'Containerized Kubernetes Mesh'
  }
];

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    projectId: 'proj-101',
    projectTitle: 'EcoTrack IoT & Carbon Footprint Engine',
    fromUserId: 'user-4',
    fromUserName: 'Liam Chen',
    fromUserNiche: 'UI/UX & Frontend Architecture',
    toUserId: 'user-1',
    message: 'Hey Jane! I love the IoT dashboard concept. I can design the full Figma system and build the responsive React data visualization components.',
    status: 'pending',
    timestamp: '2 hours ago'
  }
];

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('collabforge_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('collabforge_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync Supabase Projects and Requests if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchSupabaseProjects = async () => {
        try {
          const { data, error } = await supabase.from('projects').select('*');
          if (data && data.length > 0 && !error) {
            setProjects(prev => {
              const ids = new Set(data.map(d => d.id));
              return [...data, ...prev.filter(p => !ids.has(p.id))];
            });
          }
        } catch (err) {
          console.warn('Supabase projects fetch warning:', err);
        }
      };

      const fetchSupabaseRequests = async () => {
        try {
          const { data, error } = await supabase.from('requests').select('*');
          if (data && data.length > 0 && !error) {
            setRequests(data);
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
