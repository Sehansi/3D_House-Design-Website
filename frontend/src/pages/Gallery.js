import React, { useState } from 'react';
import '../styles/Gallery.css';

function Gallery() {
  const [designs] = useState([
    { id: 1, title: 'Modern Villa', category: 'Exterior', image: 'https://via.placeholder.com/400x300' },
    { id: 2, title: 'Luxury Interior', category: 'Interior', image: 'https://via.placeholder.com/400x300' },
    { id: 3, title: 'Contemporary Home', category: 'Exterior', image: 'https://via.placeholder.com/400x300' },
    { id: 4, title: 'Minimalist Design', category: 'Interior', image: 'https://via.placeholder.com/400x300' },
    { id: 5, title: 'Garden Villa', category: 'Exterior', image: 'https://via.placeholder.com/400x300' },
    { id: 6, title: 'Modern Kitchen', category: 'Interior', image: 'https://via.placeholder.com/400x300' }
  ]);

  const [filter, setFilter] = useState('All');

  const filteredDesigns = filter === 'All' 
    ? designs 
    : designs.filter(design => design.category === filter);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>Design Gallery</h1>
        <p>Explore our stunning 3D house designs</p>
      </div>

      <div className="gallery-filters">
        <button 
          className={filter === 'All' ? 'active' : ''} 
          onClick={() => setFilter('All')}
        >
          All
        </button>
        <button 
          className={filter === 'Exterior' ? 'active' : ''} 
          onClick={() => setFilter('Exterior')}
        >
          Exterior
        </button>
        <button 
          className={filter === 'Interior' ? 'active' : ''} 
          onClick={() => setFilter('Interior')}
        >
          Interior
        </button>
      </div>

      <div className="gallery-grid">
        {filteredDesigns.map(design => (
          <div key={design.id} className="gallery-item">
            <img src={design.image} alt={design.title} />
            <div className="gallery-item-info">
              <h3>{design.title}</h3>
              <span className="category">{design.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
