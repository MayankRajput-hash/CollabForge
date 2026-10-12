import React, { useState } from 'react';
import { X, FolderPlus, Layers, Users, Tag, Calendar, FileText } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function CreateProjectModal({ isOpen, onClose }) {
  const { addProject } = useProjects();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & HealthTech');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [openSpots, setOpenSpots] = useState(2);
  const [deadline, setDeadline] = useState('Fall 2026');
  const [architecture, setArchitecture] = useState('Microservices with Node.js & Docker');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    addProject({
      title,
      category,
      description,
      requiredSkills,
      openSpots: Number(openSpots),
      totalSpots: Number(openSpots) + 1,
      deadline,
      architecture
    });

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2.5rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--glass-border)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}>
          <X size={22} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '12px', background: 'var(--card-bg)', marginBottom: '0.8rem' }}>
            <FolderPlus className="text-gradient" size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Post Capstone Project
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Publish your project problem statement to algorithmically match with prospective student teammates.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Project Title *
            </label>
            <input 
              type="text" 
              placeholder="e.g. Autonomous Campus Delivery & Fleet Routing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Domain Category
              </label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="AI & HealthTech">AI & HealthTech</option>
                <option value="IoT & CleanTech">IoT & CleanTech</option>
                <option value="FinTech & Analytics">FinTech & Analytics</option>
                <option value="Cybersecurity & Web3">Cybersecurity & Web3</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="EdTech & Social">EdTech & Social</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Target Cohort / Deadline
              </label>
              <input 
                type="text" 
                placeholder="e.g. Spring 2026"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Problem Context & Description *
            </label>
            <textarea 
              rows={4}
              placeholder="Describe the research problem, methodology, and what complementary skills you are looking for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Required Tech Stack & Skills (comma separated) *
            </label>
            <input 
              type="text" 
              placeholder="e.g. React, Python, Neo4j, Docker, PyTorch"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Open Teammate Spots
              </label>
              <input 
                type="number" 
                min={1}
                max={8}
                value={openSpots}
                onChange={(e) => setOpenSpots(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Proposed Architecture
              </label>
              <input 
                type="text" 
                placeholder="e.g. Microservices / Node.js"
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}>
            Publish Project & Start Finding Collaborators
          </button>
        </form>
      </div>
    </div>
  );
}
