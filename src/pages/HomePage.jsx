import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Lightbulb, Plus, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

const collaborators = [
  { initials: 'JD', className: 'landing-avatar--coral' },
  { initials: 'MK', className: 'landing-avatar--blue' },
  { initials: 'AL', className: 'landing-avatar--yellow' },
];

export default function HomePage({ onOpenAuth, onOpenCreateProject }) {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-heading">
        <div className="landing-kicker">
          <span className="landing-kicker-dot" />
          A little more building, together
        </div>
        <h1 id="landing-heading">
          Big ideas are better
          <br />
          <span>built together.</span>
        </h1>
        <p>
          Find your people, bring your skills, and turn that “what if?” into something real.
        </p>
        <div className="landing-actions">
          <Link className="btn btn-primary landing-primary-action" to="/projects">
            Find your next project <ArrowRight size={16} />
          </Link>
          <Link className="btn btn-secondary landing-secondary-action" to="/teammates">
            Meet your people <Users size={16} />
          </Link>
        </div>

        <div className="landing-collab-stage" aria-label="A preview of people building together">
          <div className="landing-orbit landing-orbit--outer" />
          <div className="landing-orbit landing-orbit--inner" />
          <span className="landing-orbit-dot landing-orbit-dot--one" />
          <span className="landing-orbit-dot landing-orbit-dot--two" />
          <span className="landing-orbit-dot landing-orbit-dot--three" />

          <div className="landing-stage-note landing-stage-note--left">
            <span className="landing-note-icon"><Lightbulb size={17} /></span>
            <span className="landing-note-label">It starts with an idea</span>
            <strong>What if we built it?</strong>
          </div>

          <div className="landing-stage-note landing-stage-note--right">
            <div className="landing-avatar-stack" aria-hidden="true">
              {collaborators.map(person => (
                <span key={person.initials} className={`landing-avatar ${person.className}`}>
                  {person.initials}
                </span>
              ))}
              <span className="landing-avatar landing-avatar--add"><Plus size={13} /></span>
            </div>
            <strong>Different minds. One team.</strong>
            <span className="landing-note-label">Your next collaborators are out there.</span>
          </div>

          <div className="landing-idea-card" aria-hidden="true">
            <div className="landing-idea-spark"><Sparkles size={20} /></div>
            <span className="landing-idea-eyebrow">A shared space to begin</span>
            <strong>Make room<br />for great ideas.</strong>
            <div className="landing-idea-tags">
              <span>Imagine</span><span>Make</span><span>Share</span>
            </div>
          </div>

          <div className="landing-stage-caption">
            <Compass size={14} />
            <span>There’s a place for what you can do.</span>
          </div>
        </div>

        <div className="landing-steps" aria-label="How CollabForge works">
          <Link to="/projects" className="landing-step">
            <span className="landing-step-number">01</span>
            <span><strong>Find a spark</strong><small>Explore projects worth building.</small></span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/teammates" className="landing-step">
            <span className="landing-step-number">02</span>
            <span><strong>Find your people</strong><small>Meet makers with different skills.</small></span>
            <ArrowRight size={15} />
          </Link>
          <button className="landing-step" onClick={currentUser ? onOpenCreateProject : () => onOpenAuth('signup')}>
            <span className="landing-step-number">03</span>
            <span><strong>Make it happen</strong><small>Bring an idea of your own to life.</small></span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="landing-projects" aria-labelledby="projects-heading">
        <div className="landing-section-heading">
          <div>
            <span className="landing-eyebrow">The next great thing starts somewhere</span>
            <h2 id="projects-heading">Ideas looking for a team.</h2>
          </div>
          <Link className="landing-text-link" to="/projects">
            Explore all projects <ArrowRight size={15} />
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="landing-project-list">
            {featuredProjects.map((project, index) => (
              <Link className="landing-project-row" key={project.id} to="/projects">
                <span className="landing-project-number">0{index + 1}</span>
                <div className="landing-project-main">
                  <span className="landing-project-category">{project.category}</span>
                  <h3>{project.title}</h3>
                  <span className="landing-project-owner">Started by {project.ownerName}</span>
                </div>
                <div className="landing-project-skills">
                  {(project.requiredSkills || []).slice(0, 3).map(skill => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <span className="landing-project-spots">
                  {project.openSpots} {project.openSpots === 1 ? 'spot' : 'spots'} open
                </span>
                <ArrowRight className="landing-project-arrow" size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="landing-empty-projects">
            <div>
              <span className="landing-empty-mark"><Lightbulb size={18} /></span>
              <div>
                <strong>Every great project starts with a first step.</strong>
                <p>Put your idea out there and find the people to build it with.</p>
              </div>
            </div>
            <button className="landing-text-link" onClick={onOpenCreateProject}>
              Start a project <ArrowRight size={15} />
            </button>
          </div>
        )}

      </section>
    </div>
  );
}
