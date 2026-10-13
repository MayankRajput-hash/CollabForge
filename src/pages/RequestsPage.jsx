import React from 'react';
import { Check, X } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function RequestsPage() {
  const { requests, updateRequestStatus } = useProjects();
  const { currentUser } = useAuth();

  // Filter incoming and outgoing requests
  const incomingRequests = requests.filter(r => r.toUserId === currentUser?.id);
  const outgoingRequests = requests.filter(r => r.fromUserId === currentUser?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          Requests
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          See invitations and applications you've sent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Incoming Requests Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <h2 className="text-lg sm:text-xl font-bold">Incoming Requests ({incomingRequests.length})</h2>
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
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No incoming requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* Outgoing Requests Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <h2 className="text-lg sm:text-xl font-bold">Sent ({outgoingRequests.length})</h2>
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
                <p>No messages sent yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
