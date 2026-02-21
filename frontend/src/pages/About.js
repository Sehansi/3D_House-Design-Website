import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <div className="about-container">
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
