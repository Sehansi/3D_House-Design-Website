import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <Link to="/signin" className="nav-link">Sign In</Link>
          <Link to="/register" className="btn-nav-primary">Get Started</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Design Your Dream Home in 3D
          </h1>
          <p className="hero-subtitle">
            Create stunning architectural designs with our intuitive 3D modeling tools
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero-primary">
              Start Designing
            </Link>
            <button className="btn-hero-secondary">
              View Gallery
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
