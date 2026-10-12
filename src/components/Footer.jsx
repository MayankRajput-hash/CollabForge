import { Network, Shield, Cpu, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '4rem 0 2rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1rem' }}>
              <Network className="text-gradient" size={26} />
              <span>CollabForge</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
              Algorithmic student collaborator matching for academic capstone projects, research initiatives, and interdisciplinary engineering cohorts.
            </p>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <span className="badge">Dockerized</span>
              <span className="badge">JWT / OAuth 2.0</span>
              <span className="badge">Graph Architecture</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1rem' }}>Matching Methodologies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>Cosine Similarity Vector Engine</li>
              <li>Jaccard Index Skill Set Correlation</li>
              <li>Graph Database Relationship Traversal</li>
              <li>Peer Skill Verification Protocols</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1rem' }}>System Architecture</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>React.js SPA Reactive Frontend</li>
              <li>Node.js & Express REST Microservices</li>
              <li>Flexible Schema Persistence with MongoDB</li>
              <li>Containerized Docker Services</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1rem' }}>Target Outcomes</h4>
            <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--glass-border)' }}>
              <div className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>+40%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>Project Completion Rate</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Eliminating fragmentation, addressing skill gaps, and fostering interdisciplinary innovation.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            © 2026 CollabForge Academic Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Academic Integrity Guidelines</span>
            <span>API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
