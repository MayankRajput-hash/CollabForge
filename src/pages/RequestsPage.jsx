import React from 'react';
import { Send, Inbox, Check, X, Clock, User, ArrowRight, Shield } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function RequestsPage() {
  const { requests, updateRequestStatus } = useProjects();
  const { currentUser } = useAuth();

  // Filter incoming and outgoing requests
  const incomingRequests = requests.filter(r => r.toUserId === currentUser?.id);
  const outgoingRequests = requests.filter(r => r.fromUserId === currentUser?.id);

  return (
    <div className="container" style={{ padding: '7rem 2rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-1)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
          <Send size={18} /> REAL-TIME COLLABORATION
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Collaboration Requests
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px' }}>
          Manage incoming requests from prospective teammates and track the status of your applications.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Incoming Requests Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <Inbox size={20} className="text-gradient" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Incoming Requests ({incomingRequests.length})</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incomingRequests.map(req => (
              <div key={req.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{req.fromUserName}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-1)', fontWeight: 600 }}>{req.fromUserNiche}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Project: <strong>{req.projectTitle}</strong></div>
                  </div>
                  <span className="badge" style={{ textTransform: 'capitalize' }}>{req.status}</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.2rem', background: 'var(--card-bg)', padding: '0.8rem', borderRadius: '8px' }}>
                  "{req.message}"
                </p>

                {req.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => updateRequestStatus(req.id, 'declined')}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      <X size={15} style={{ marginRight: '0.3rem' }} /> Decline
                    </button>
                    <button 
                      onClick={() => updateRequestStatus(req.id, 'accepted')}
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 1.1rem', fontSize: '0.85rem' }}
                    >
                      <Check size={15} style={{ marginRight: '0.3rem' }} /> Accept Teammate
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: req.status === 'accepted' ? '#34d399' : '#f87171' }}>
                    {req.status === 'accepted' ? '✓ Accepted Teammate' : 'Declined'}
                  </div>
                )}
              </div>
            ))}

            {incomingRequests.length === 0 && (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No incoming collaboration requests right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Outgoing Requests Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <Send size={20} className="text-gradient" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Sent Applications ({outgoingRequests.length})</h2>
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
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>You haven't sent any collaboration requests yet. Explore projects or search teammates to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
