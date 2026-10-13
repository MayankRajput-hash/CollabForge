import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

export default function CreateProjectModal({ isOpen, onClose }) {
  const { addProject } = useProjects();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & HealthTech');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [openSpots, setOpenSpots] = useState(2);
  const [deadline, setDeadline] = useState('');

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
      deadline
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="glass-panel responsive-modal-content" style={{
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
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

        <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            New project
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Share what you're working on and who you'd like to work with.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Project name *
            </label>
            <input 
              type="text" 
              placeholder="e.g. A better way to share rides to campus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="modal-form-grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                Category
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
                Deadline (optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g. Spring 2027"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              About the project *
            </label>
            <textarea 
              rows={4}
              placeholder="What are you working on? What would you like help with?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Skills (optional)
            </label>
            <input 
              type="text" 
              placeholder="e.g. React, writing, research"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="modal-form-grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                People needed
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

          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}>
            Publish project
          </button>
        </form>
      </div>
    </div>
  );
}
