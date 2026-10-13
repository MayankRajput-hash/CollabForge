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
          <Link className="btn btn-primary landing-primary-action" to="/projects">
            Explore projects <ArrowRight size={16} />
          </Link>
          {currentUser ? (
            <button className="btn btn-secondary" onClick={onOpenCreateProject}>
              Start a project
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => onOpenAuth('signup')}>
              Create your profile
            </button>
          )}
        </div>
        <div className="landing-steps" aria-label="How it works">
          <span><b>01</b> Find a project</span>
          <span><b>02</b> Meet your team</span>
          <span><b>03</b> Get building</span>
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
      </section>
    </div>
  );
}
