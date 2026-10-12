import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import CreateProjectModal from './components/CreateProjectModal';

// Pages
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import TeammatesPage from './pages/TeammatesPage';
import ProfilePage from './pages/ProfilePage';
import RequestsPage from './pages/RequestsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';

import './index.css';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Restoring your session...</div>;
  }

  return currentUser ? children : <Navigate to="/login" replace />;
}

function MainApp() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('collabforge_theme');
    return saved ? saved === 'dark' : true; // Default to dark mode for rich aesthetics
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('collabforge_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('collabforge_theme', 'light');
    }
  }, [isDarkMode]);

  const handleOpenAuth = (mode = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="app-container min-h-screen flex flex-col bg-zinc-50 dark:bg-[#090a10] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        onOpenAuth={handleOpenAuth}
        onOpenCreateProject={() => setCreateProjectModalOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          {/* Step 1: Responsive Landing Page */}
          <Route 
            path="/" 
            element={
              <HomePage 
                onOpenAuth={handleOpenAuth} 
                onOpenCreateProject={() => setCreateProjectModalOpen(true)} 
              />
            } 
          />

          {/* Step 2 & 3: Login and Signup with Supabase Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* Step 4: Student Profile Page */}
          <Route 
            path="/profile" 
            element={<ProtectedRoute>
              <ProfilePage 
                onOpenAuth={handleOpenAuth} 
                onOpenCreateProject={() => setCreateProjectModalOpen(true)} 
              />
            </ProtectedRoute>} 
          />

          {/* Step 5: Project Posting Page */}
          <Route path="/create-project" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />

          {/* Step 6: Project Discovery Page */}
          <Route 
            path="/projects" 
            element={
              <ProjectsPage 
                onOpenAuth={handleOpenAuth} 
                onOpenCreateProject={() => setCreateProjectModalOpen(true)} 
              />
            } 
          />

          {/* Step 7: Teammate Matching */}
          <Route 
            path="/teammates" 
            element={<TeammatesPage onOpenAuth={handleOpenAuth} />} 
          />

          <Route 
            path="/requests" 
            element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals & Notifications */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

      <CreateProjectModal 
        isOpen={createProjectModalOpen} 
        onClose={() => setCreateProjectModalOpen(false)} 
      />

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <MainApp />
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
