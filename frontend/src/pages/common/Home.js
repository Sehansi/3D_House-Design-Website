import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Home.css';
import { Zap, Bot, MapPin, Sparkles, Globe, Handshake } from 'lucide-react';

function Home() {
  const { isAuthenticated } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/furniture/public/recent');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setRecentProjects(result.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch recent projects', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchRecentProjects();
  }, []);

  const fallbackProjects = [
    { _id: '1', name: 'Modern Villa', location: 'California', badge: 'badge-modern', parameters: { style: 'modern' }, thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '2', name: 'Luxury Estate', location: 'New York', badge: 'badge-luxury', parameters: { style: 'luxury' }, thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '3', name: 'Minimalist House', location: 'Tokyo', badge: 'badge-minimal', parameters: { style: 'minimalist' }, thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09be1587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];

  const displayProjects = recentProjects.length > 0 ? recentProjects : fallbackProjects;

  const getStyleBadge = (style) => {
    switch (style?.toString().toLowerCase()) {
      case 'modern': return 'badge-modern';
      case 'luxury': return 'badge-luxury';
      case 'minimalist': return 'badge-minimal';
      default: return 'badge-modern';
    }
  };

  const getThumbnail = (project, index) => {
    if (project.thumbnail && project.thumbnail.length > 0) return project.thumbnail;
    const fallbacks = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09be1587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return fallbacks[index % 3];
  };

  return (
    <div className="home-container" style={{ background: '#0a0e27', color: 'white', fontFamily: 'Inter' }}>
      
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '80px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '80vh', justifyContent: 'center', background: "url('/images/premium_hero_bg.png') center/cover no-repeat fixed" }}>
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontSize: '4.5rem', fontWeight: 800, marginBottom: '20px', background: 'linear-gradient(90deg, #ffffff, #00d9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Design Your Dream Home in 3D
          </h1>
          <p className="hero-text" style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '800px', margin: '0 auto 40px' }}>
            Transform your architectural ideas into stunning professional 3D layouts in seconds. 
            Join our platform to visualize, customize, and connect with top-tier architects.
          </p>
          
          <div className="cta-buttons">
            <Link to={isAuthenticated ? "/designer" : "/register"} className="btn-cta">
              Start Designing Now
            </Link>
            <Link to="/gallery" className="btn-cta-secondary">
              Explore Gallery
            </Link>
          </div>
        </div>

        <div className="hero-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '60px', maxWidth: '1200px', width: '100%' }}>
          <div className="hero-card card-1">
            <div className="card-badge">#1 Design Platform</div>
            <h3 style={{ marginTop: '10px' }}>Award Winning UI</h3>
          </div>
          <div className="hero-card card-2">
            <div className="card-icon"><Zap size={28} strokeWidth={2} color="#00d9ff" /></div>
            <div>
              <h4>Fast Rendering</h4>
              <p>Instant 3D previews.</p>
            </div>
          </div>
          <div className="hero-card card-3">
            <div className="card-icon"><Bot size={28} strokeWidth={2} color="#a78bfa" /></div>
            <div>
              <h4>AI Powered</h4>
              <p>Smart floorplan generation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="projects-header">
          <div className="section-label">Featured Works</div>
          <h2>Stunning Architectural Designs</h2>
          <p>Explore some of the best 3D structural layouts modeled by our professional community.</p>
        </div>

        <div className="projects-grid">
          {loadingProjects && recentProjects.length === 0 ? (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }}>Loading recent designs...</div>
          ) : (
            displayProjects.map((project, index) => {
              let styleLabel = project.parameters?.style || 'modern';
              if (project.room) {
                styleLabel = project.items?.length ? `${project.items.length} Items` : 'Interior';
              }
              let badgeText = styleLabel.toString().charAt(0).toUpperCase() + styleLabel.toString().slice(1);
              
              return (
                <div key={project._id} className="project-card">
                  <div className="project-image">
                    <img src={getThumbnail(project, index)} alt={project.name} />
                    <span className={`project-badge ${getStyleBadge(project.parameters?.style || 'modern')}`}>
                      {badgeText}
                    </span>
                  </div>
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    <div className="project-location">
                      <MapPin size={14} /> {project.user?.name || project.location || 'Community Editor'}
                    </div>
                    <Link to={isAuthenticated ? `/furniture-customizer?designId=${project._id}` : "/register"} className="project-btn" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'}}>→</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="projects-footer">
          <Link to="/gallery" className="btn-view-all">View All Projects</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why Choose Our Platform?</h2>
          <p>We provide the best tools for visualizing your dream architectural structures.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Sparkles size={32} strokeWidth={1.5} color="#00d9ff" /></div>
            <h3>AI Designer</h3>
            <p>Automatically generate stunning 3D layouts from a simple text description or blueprint image.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Globe size={32} strokeWidth={1.5} color="#a78bfa" /></div>
            <h3>Interactive 3D Viewer</h3>
            <p>Walk through your space virtually and orbit your camera in full real-time 3D.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Handshake size={32} strokeWidth={1.5} color="#00ff95" /></div>
            <h3>Hire Architects</h3>
            <p>Connect with professional architects on our platform to bring your project to reality.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ background: "url('/images/premium_feature_hologram.png') center/cover no-repeat fixed" }}>
        <div className="cta-content">
          <h2>Ready to Build Your Future?</h2>
          <p>Join thousands of users defining their architectural dreams online today.</p>
          {!isAuthenticated ? (
            <Link to="/register" className="btn-cta">Sign Up for Free</Link>
          ) : (
            <Link to="/ai-designer" className="btn-cta">Launch AI Designer</Link>
          )}
        </div>
      </section>

    </div>
  );
}

export default Home;
