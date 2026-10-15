import React, { useState } from 'react';
import { Check, X, Inbox, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function RequestsPage() {
  const { requests, updateRequestStatus } = useProjects();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // 'all', 'incoming', 'outgoing'

  // Filter incoming and outgoing requests
  const incomingRequests = requests.filter(r => r.toUserId === currentUser?.id);
  const outgoingRequests = requests.filter(r => r.fromUserId === currentUser?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Header and Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Inbox className="w-4 h-4" /> Message Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Requests & Invitations
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Manage collaboration invites you have received and applications you have sent.
          </p>
        </div>

        {/* Quick Shortcut Buttons for New Users */}
        <div className="flex items-center gap-2">
          <Link to="/projects" className="btn btn-secondary text-xs sm:text-sm py-2 px-3.5 gap-1.5">
            Browse projects <ArrowRight size={14} />
          </Link>
          <Link to="/teammates" className="btn btn-secondary text-xs sm:text-sm py-2 px-3.5 gap-1.5">
            Find people <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Interactive Tabs with animated pill and badges */}
      <div className="flex items-center gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-3" role="tablist" aria-label="Request categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'incoming'}
          onClick={() => setActiveTab('incoming')}
          className={`tab-pill flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'incoming'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Inbox size={16} />
          <span>Incoming</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'incoming' 
              ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {incomingRequests.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'outgoing'}
          onClick={() => setActiveTab('outgoing')}
          className={`tab-pill flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'outgoing'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Send size={16} />
          <span>Sent</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'outgoing'
              ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900 font-bold'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {outgoingRequests.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          className={`tab-pill flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'tab-pill-active bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <span>All ({requests.filter(r => r.toUserId === currentUser?.id || r.fromUserId === currentUser?.id).length})</span>
        </button>
      </div>

      {/* Content Columns with animated transitions on tab switch */}
      <div key={activeTab} className="tab-content-enter">
        <div className={`grid gap-6 md:gap-8 ${activeTab === 'all' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-3xl'}`}>
          {/* Incoming Requests Column */}
          {(activeTab === 'incoming' || activeTab === 'all') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Inbox size={18} className="text-indigo-500" />
                  Incoming Requests ({incomingRequests.length})
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingRequests.map(req => (
                  <div key={req.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{req.fromUserName}</h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{req.projectTitle}</div>
                      </div>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>{req.status}</span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.2rem', background: 'var(--card-bg)', padding: '0.8rem', borderRadius: '8px' }}>
                      "{req.message}"
                    </p>

                    {req.status === 'pending' ? (
                      <div className="request-actions" style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => updateRequestStatus(req.id, 'declined')}
                          className="btn btn-secondary tab-pill" 
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                        >
                          <X size={15} style={{ marginRight: '0.3rem' }} /> Decline
                        </button>
                        <button 
                          onClick={() => updateRequestStatus(req.id, 'accepted')}
                          className="btn btn-primary tab-pill" 
                          style={{ padding: '0.4rem 1.1rem', fontSize: '0.85rem' }}
                        >
                          <Check size={15} style={{ marginRight: '0.3rem' }} /> Accept
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {req.status === 'accepted' ? 'Accepted' : 'Declined'}
                      </div>
                    )}
                  </div>
                ))}

                {incomingRequests.length === 0 && (
                  <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Inbox size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">No incoming requests yet</p>
                    <p className="text-xs max-w-sm mx-auto mb-4">When other students discover your projects or profile, their collaboration requests will appear here.</p>
                    <Link to="/projects" className="btn btn-secondary text-xs inline-flex gap-1.5">
                      Explore active projects
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Outgoing Requests Column */}
          {(activeTab === 'outgoing' || activeTab === 'all') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Send size={18} className="text-indigo-500" />
                  Sent ({outgoingRequests.length})
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outgoingRequests.map(req => (
                  <div key={req.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{req.projectTitle}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sent {req.timestamp}</div>
                      </div>
                      <span 
                        className="badge" 
                        style={{ 
                          textTransform: 'capitalize',
                          background: req.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : req.status === 'declined' ? 'rgba(239, 68, 68, 0.2)' : 'var(--card-bg)',
                          color: req.status === 'accepted' ? '#34d399' : req.status === 'declined' ? '#f87171' : 'var(--text-primary)'
                        }}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--card-bg)', padding: '0.8rem', borderRadius: '8px' }}>
                      "{req.message}"
                    </p>
                  </div>
                ))}

                {outgoingRequests.length === 0 && (
                  <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Send size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">No sent applications yet</p>
                    <p className="text-xs max-w-sm mx-auto mb-4">You haven't requested to join any projects yet. Find exciting capstones and reach out!</p>
                    <Link to="/projects" className="btn btn-primary text-xs inline-flex gap-1.5">
                      Find a project to join
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
