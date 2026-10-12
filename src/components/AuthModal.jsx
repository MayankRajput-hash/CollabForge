import React, { useState } from 'react';
import { X, Sparkles, User, Mail, GraduationCap, Code2, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }) {
  const { signUp, login, users } = useAuth();
  const { showToast } = useProjects();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [cohort, setCohort] = useState('Capstone 2026');
  const [niche, setNiche] = useState('Full-Stack Engineering');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('15-20 hrs/week');
  const [bio, setBio] = useState('');
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
        availability,
        bio: bio || `Student at ${university} focusing on ${niche}. Looking for ambitious capstone collaborators.`
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

  const handleQuickLogin = (demoEmail) => {
    const res = login(demoEmail);
    if (res.success) {
      showToast(`Logged in as ${res.user.name}!`);
      onClose();
    }
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
        maxWidth: '560px',
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

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '12px', background: 'var(--card-bg)', marginBottom: '0.8rem' }}>
            <Sparkles className="text-gradient" size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {isSignUp ? 'Create Student Profile' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isSignUp 
              ? 'Join CollabForge to showcase your capstone portfolio and match with peers.' 
              : 'Sign in to access your capstone team and collaboration requests.'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  Skills (comma separated)
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  These skills are ingested directly into the Cosine Similarity & Jaccard matching models.
                </span>
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
            {isSignUp ? 'Create Profile & Start Matching' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.8rem' }}>
            Or quickly test the platform as an existing student persona:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {users.slice(0, 3).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u.email)}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <CheckCircle size={14} className="text-gradient" />
                {u.name} ({u.niche.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? (
            <>
              Already have a student profile?{' '}
              <button 
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-1)', fontWeight: 600, cursor: 'pointer' }}>
                Sign In
              </button>
            </>
          ) : (
            <>
              New to CollabForge?{' '}
              <button 
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-1)', fontWeight: 600, cursor: 'pointer' }}>
                Create a Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
