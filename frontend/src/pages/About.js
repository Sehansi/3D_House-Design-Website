import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <div className="about-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/services" className="nav-link">Services</a>
          <a href="/about" className="nav-link-active">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/signin" className="nav-link-signin">Sign In</a>
          <a href="/register" className="btn-nav-primary">Get Started Free</a>
        </div>
      </nav>

      <div className="about-header">
        <h1>About Us</h1>
        <p>Creating Dream Homes with 3D Technology</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Vision</h2>
          <p>
            We specialize in transforming your dream home ideas into stunning 3D visualizations.
            Our platform allows you to design, customize, and visualize your perfect home before construction begins.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Do</h2>
          <ul>
            <li>3D House Design & Modeling</li>
            <li>Interior & Exterior Visualization</li>
            <li>Custom Floor Plans</li>
            <li>Virtual Tours</li>
            <li>Design Consultation</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Why Choose Us</h2>
          <div className="features">
            <div className="feature">
              <h3>Professional Design</h3>
              <p>Expert designers with years of experience</p>
            </div>
            <div className="feature">
              <h3>Latest Technology</h3>
              <p>Cutting-edge 3D modeling tools</p>
            </div>
            <div className="feature">
              <h3>Customer Focused</h3>
              <p>Your satisfaction is our priority</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
