import React, { useState } from 'react';
import { X, User, Mail, GraduationCap, Code2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }) {
  const { signUp, login } = useAuth();
  const { showToast } = useProjects();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [cohort, setCohort] = useState('');
  const [niche, setNiche] = useState('Full-Stack Engineering');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('15-20 hrs/week');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name || !email || !university) {
        setError('Please fill in your name, academic email, and university.');
        return;
      }

      signUp({
        name,
        email,
        university,
        cohort,
        niche,
        skills,
        availability
      });

      showToast(`Welcome to CollabForge, ${name}! Your profile is ready.`);
      onClose();
    } else {
      if (!email) {
        setError('Please enter your email to sign in.');
        return;
      }
      const res = login(email);
      if (res.success) {
        showToast(`Signed in successfully as ${res.user.name}`);
        onClose();
      } else {
        setError(res.message);
      }
    }
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
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
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

        {/* Modal Header */}
        <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            {isSignUp ? 'Create an account' : 'Sign in'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isSignUp
              ? 'Create a profile to find projects and collaborators.'
              : 'Sign in to see your projects and messages.'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            color: '#f87171', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isSignUp && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-grid" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    University / College *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      placeholder="e.g. Stanford University"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Cohort / Graduation
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Capstone 2026"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="modal-form-grid" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Technical Niche
                  </label>
                  <select 
                    value={niche} 
                    onChange={(e) => setNiche(e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Cloud & DevOps Architecture">Cloud & DevOps Architecture</option>
                    <option value="UI/UX & Frontend Architecture">UI/UX & Frontend</option>
                    <option value="Cybersecurity & Blockchain">Cybersecurity & Web3</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Weekly Availability
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <select 
                      value={availability} 
                      onChange={(e) => setAvailability(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '2.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      <option value="10-15 hrs/week">10-15 hrs/week</option>
                      <option value="15-20 hrs/week">15-20 hrs/week</option>
                      <option value="20+ hrs/week">20+ hrs/week</option>
                      <option value="Full-time Capstone">Full-time Capstone</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Skills (optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Code2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="e.g. React, Node.js, MongoDB, Docker, Python"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Academic Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="your.name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {/* Mode Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-1)', fontWeight: 600, cursor: 'pointer' }}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button 
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-1)', fontWeight: 600, cursor: 'pointer' }}>
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
