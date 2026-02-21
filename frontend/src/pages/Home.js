import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const projects = [
    {
      id: 1,
      title: 'Zen Garden House',
      description: 'A Japanese-style minimalist home',
      location: 'Nuwara Eliya, Sri Lanka',
      category: 'Minimal',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    },
    {
      id: 2,
      title: 'Green Living Home',
      description: 'An eco-friendly sustainable home',
      location: 'Negombo, Sri Lanka',
      category: 'Modern',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    },
    {
      id: 3,
      title: 'Future Smart Home',
      description: 'A smart home with future technology',
      location: 'Moharangama, Sri Lanka',
      category: 'Luxury',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Transform your ideas into 3D models automatically using AI technology.'
    },
    {
      icon: '👁️',
      title: 'Real-time Preview',
      description: 'Preview your designs in 3D in real time. See changes instantly.'
    },
    {
      icon: '📤',
      title: 'Export Options',
      description: 'Export your designs in various formats: PDF, 3D files, images and more.'
    }
  ];

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/gallery" className="nav-link">Projects</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/signin" className="nav-link-signin">Sign In</Link>
          <Link to="/register" className="btn-nav-primary">Get Started Free</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Design Your Dream Home<br />
              <span className="hero-title-accent">With 3D Technology</span>
            </h1>
            <p className="hero-subtitle">
              Create your dream home in 3D with cutting-edge AI technology.
              Transform your ideas into stunning 3D models with real-time preview
              and professional rendering.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-hero-primary">
                🚀 Get Started Now
              </Link>
              <button className="btn-hero-secondary">
                ▶️ Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <h3>10K+</h3>
                <p>Users</p>
              </div>
              <div className="stat-item">
                <h3>500+</h3>
                <p>Templates</p>
              </div>
              <div className="stat-item">
                <h3>50+</h3>
                <p>Countries</p>
              </div>
            </div>
          </div>
          <div className="hero-cards">
            <div className="hero-card card-1">
              <span className="card-badge">250+ Projects</span>
            </div>
            <div className="hero-card card-2">
              <span className="card-icon">🤖</span>
              <h4>AI Support</h4>
              <p>24/7 Available</p>
            </div>
            <div className="hero-card card-3">
              <span className="card-icon">👁️</span>
              <h4>Real-time Preview</h4>
            </div>
          </div>
        </div>
      </section>

      <section className="projects-section">
        <div className="projects-header">
          <span className="section-label">OUR WORK</span>
          <h2>Projects Gallery</h2>
          <p>Explore our exceptional 3D house design projects. Each project is uniquely and modernly designed.</p>
        </div>
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <span className={`project-badge badge-${project.category.toLowerCase()}`}>
                  {project.category}
                </span>
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-location">
                  📍 {project.location}
                </div>
                <button className="project-btn">→</button>
              </div>
            </div>
          ))}
        </div>
        <div className="projects-footer">
          <Link to="/gallery" className="btn-view-all">View All Projects →</Link>
        </div>
      </section>

      <section className="features-section">
        <div className="features-header">
          <span className="section-label">FEATURES</span>
          <h2>Everything You Need</h2>
          <p>All the tools you need for modern 3D house design in one place</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Start Your Dream Home Today</h2>
          <p>Create a free account and start designing your 3D home. No credit card required.</p>
          <Link to="/register" className="btn-cta">🔒 Get Started Free</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">3D House Design</span>
          </div>
          <p className="footer-text">© 2026 3D House Design. All rights reserved. | Powered by Kreaddy</p>
          <div className="footer-social">
            <a href="#" className="social-link">f</a>
            <a href="#" className="social-link">𝕏</a>
            <a href="#" className="social-link">in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
