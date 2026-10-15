import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

export default function HomePage({ onOpenAuth, onOpenCreateProject }) {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-kicker">
          <span className="landing-kicker-dot" />
          A place to find your people
        </div>
        <h1>
          Good work starts<br />
          <span>with the right team.</span>
        </h1>
        <p>
          Find a project you care about, meet people who care about it too, and make something together.
        </p>
        <div className="landing-actions">
          <Link className="btn btn-primary landing-primary-action tab-pill" to="/projects">
            Explore projects <ArrowRight size={16} />
          </Link>
          <Link className="btn btn-secondary tab-pill" to="/teammates">
            Find collaborators
          </Link>
          {currentUser ? (
            <button className="btn btn-secondary tab-pill" onClick={onOpenCreateProject}>
              Start a project
            </button>
          ) : (
            <button className="btn btn-secondary tab-pill" onClick={() => onOpenAuth('signup')}>
              Create your profile
            </button>
          )}
        </div>
        <div className="landing-steps" aria-label="How it works">
          <Link to="/projects" className="tab-pill" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <b>01</b> Find a project &rarr;
          </Link>
          <Link to="/teammates" className="tab-pill" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <b>02</b> Meet your team &rarr;
          </Link>
          <Link to={currentUser ? "/create-project" : "/signup"} className="tab-pill" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <b>03</b> Get building &rarr;
          </Link>
        </div>
      </section>

      <section className="landing-projects" aria-labelledby="projects-heading">
        <div className="landing-section-heading">
          <div>
            <span className="landing-eyebrow">A good place to start</span>
            <h2 id="projects-heading">Projects looking for people</h2>
          </div>
          <Link className="landing-text-link" to="/projects">
            See all projects <ArrowRight size={15} />
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
                  {project.requiredSkills.slice(0, 3).map(skill => (
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
            <p>No projects are listed yet.</p>
            <button className="landing-text-link" onClick={onOpenCreateProject}>
              Start the first one <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Quick Navigation Shortcuts for New Users */}
        <div className="mt-12 p-6 rounded-2xl glass-panel border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">New to CollabForge?</h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Jump directly into finding teammates or showcase your own skills on your profile.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <Link to="/teammates" className="btn btn-secondary text-xs tab-pill">
              Browse student profiles
            </Link>
            <Link to={currentUser ? "/profile" : "/signup"} className="btn btn-primary text-xs tab-pill">
              {currentUser ? "View my profile" : "Get started free"} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
