import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  PlusCircle, 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

export default function Navbar({ isDarkMode, setIsDarkMode, onOpenCreateProject }) {
  const { currentUser, logout } = useAuth();
  const { requests } = useProjects();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Count pending requests directed to the current user
  const pendingRequestsCount = requests.filter(
    r => r.toUserId === currentUser?.id && r.status === 'pending'
  ).length;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="nav">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <span className="brand-mark" aria-hidden="true">c</span>
          <span>CollabForge</span>
        </Link>

        {/* Desktop Links with interactive indicators */}
        <div className="nav-links desktop-only">
          <Link 
            to="/projects" 
            className="tab-pill"
            style={{ 
              color: isActive('/projects') ? 'var(--accent-1)' : 'var(--text-secondary)',
              fontWeight: isActive('/projects') ? 600 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: isActive('/projects') ? 'var(--bg-secondary)' : 'transparent'
            }}>
            Projects
          </Link>

          <Link 
            to="/teammates" 
            className="tab-pill"
            style={{ 
              color: isActive('/teammates') ? 'var(--accent-1)' : 'var(--text-secondary)',
              fontWeight: isActive('/teammates') ? 600 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: isActive('/teammates') ? 'var(--bg-secondary)' : 'transparent'
            }}>
            People
          </Link>

          {currentUser && (
            <Link 
              to="/requests" 
              className="tab-pill"
              style={{ 
                color: isActive('/requests') ? 'var(--accent-1)' : 'var(--text-secondary)',
                fontWeight: isActive('/requests') ? 600 : 500,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                padding: '0.35rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: isActive('/requests') ? 'var(--bg-secondary)' : 'transparent'
              }}>
              Inbox
              {pendingRequestsCount > 0 && (
                <span className="nav-request-count" style={{ backgroundColor: '#6366f1', color: '#fff', border: 'none', fontWeight: 600 }}>
                  {pendingRequestsCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Post Project Shortcut Button */}
          {currentUser && (
            <Link 
              to="/create-project"
              className="btn btn-secondary desktop-only tab-pill"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            >
              <PlusCircle size={16} /> New project
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="btn-icon" 
            aria-label="Toggle Theme"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Section / Sign In / Sign Up */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--glass-border)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span className="nav-user-name" style={{ fontSize: '0.88rem', fontWeight: 600 }}>{currentUser.name.split(' ')[0]}</span>
              </button>

              {userDropdownOpen && (
                <div 
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    padding: '0.8rem',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser.name}</div>
                  </div>

                  <Link 
                    to="/profile" 
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.6rem', 
                      padding: '0.5rem', 
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '0.88rem' 
                    }}
                    className="dropdown-item"
                  >
                    <User size={16} /> Profile
                  </Link>

                  <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                    <button 
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        color: '#f87171',
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions desktop-only" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link 
                to="/login"
                className="btn btn-secondary" 
                style={{ padding: '0.45rem 1rem', fontSize: '0.88rem', textDecoration: 'none' }}
              >
                Sign in
              </Link>
              <Link 
                to="/signup"
                className="btn btn-primary" 
                style={{ padding: '0.45rem 1.1rem', fontSize: '0.88rem', textDecoration: 'none' }}
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon mobile-only"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-panel mobile-only mobile-drawer" style={{ padding: '1.5rem', margin: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/projects" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            Explore Projects
          </Link>
          <Link to="/teammates" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            Find Teammates
          </Link>
          {currentUser && (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                Profile
              </Link>
              <Link to="/requests" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                Inbox ({pendingRequestsCount})
              </Link>
              <button onClick={() => { onOpenCreateProject(); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Post Capstone Project
              </button>
            </>
          )}
          {!currentUser && (
            <div className="mobile-auth-actions">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
