import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <Link to="/" className="site-footer-brand">CollabForge</Link>
        <span>Find your people. Make something together.</span>
        <nav aria-label="Footer navigation">
          <Link to="/projects">Projects</Link>
          <Link to="/teammates">People</Link>
        </nav>
      </div>
    </footer>
  );
}
