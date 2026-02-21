import React from 'react';
import '../styles/Services.css';

function Services() {
  const services = [
    {
      id: 1,
      title: '3D House Modeling',
      description: 'Complete 3D modeling of your dream house with detailed architecture',
      icon: '🏠'
    },
    {
      id: 2,
      title: 'Interior Design',
      description: 'Beautiful interior designs with furniture and decor visualization',
      icon: '🛋️'
    },
    {
      id: 3,
      title: 'Exterior Design',
      description: 'Stunning exterior designs with landscaping and outdoor features',
      icon: '🌳'
    },
    {
      id: 4,
      title: 'Floor Plans',
      description: 'Detailed floor plans with accurate measurements and layouts',
      icon: '📐'
    },
    {
      id: 5,
      title: 'Virtual Tours',
      description: 'Interactive 3D virtual tours of your designed space',
      icon: '🎥'
    },
    {
      id: 6,
      title: 'Consultation',
      description: 'Expert consultation for design ideas and modifications',
      icon: '💡'
    }
  ];

  return (
    <div className="services-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/services" className="nav-link-active">Services</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/signin" className="nav-link-signin">Sign In</a>
          <a href="/register" className="btn-nav-primary">Get Started Free</a>
        </div>
      </nav>

      <div className="services-header">
        <h1>Our Services</h1>
        <p>Professional 3D design solutions for your dream home</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button className="service-btn">Learn More</button>
          </div>
        ))}
      </div>

      <div className="services-cta">
        <h2>Ready to Start Your Project?</h2>
        <p>Contact us today for a free consultation</p>
        <button className="cta-button">Get Started</button>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">3D House Design</span>
          </div>
          <p className="footer-text">© 2026 3D House Design. All rights reserved.</p>
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

export default Services;
