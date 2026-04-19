import React from 'react';
import '../../styles/Services.css';
import { Home, Sofa, Trees, Ruler, Video, Lightbulb } from 'lucide-react';

function Services() {
  const services = [
    {
      id: 1,
      title: '3D House Modeling',
      description: 'Complete 3D modeling of your dream house with detailed architecture',
      icon: <Home size={36} strokeWidth={1.5} />
    },
    {
      id: 2,
      title: 'Interior Design',
      description: 'Beautiful interior designs with furniture and decor visualization',
      icon: <Sofa size={36} strokeWidth={1.5} />
    },
    {
      id: 3,
      title: 'Exterior Design',
      description: 'Stunning exterior designs with landscaping and outdoor features',
      icon: <Trees size={36} strokeWidth={1.5} />
    },
    {
      id: 4,
      title: 'Floor Plans',
      description: 'Detailed floor plans with accurate measurements and layouts',
      icon: <Ruler size={36} strokeWidth={1.5} />
    },
    {
      id: 5,
      title: 'Virtual Tours',
      description: 'Interactive 3D virtual tours of your designed space',
      icon: <Video size={36} strokeWidth={1.5} />
    },
    {
      id: 6,
      title: 'Consultation',
      description: 'Expert consultation for design ideas and modifications',
      icon: <Lightbulb size={36} strokeWidth={1.5} />
    }
  ];

  return (
    <div className="services-container">
      

      <div className="services-hero" style={{ background: "url('/images/services_hero_bg.png') center/cover no-repeat fixed" }}>
        <div className="services-header-content">
          <h1>Experience Premium Architecture</h1>
          <p>Cutting-edge 3D design solutions that transform your architectural visions into striking realities.</p>
        </div>
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
