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
    </div>
  );
}

export default Services;
