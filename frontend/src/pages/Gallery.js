import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';
import '../styles/Gallery.css';

function Gallery() {
  // Check if user is logged in from localStorage
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // User is logged in
      setUser({ token });
    }
  }, []);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [designs] = useState([
    { 
      id: 1, 
      title: 'Modern Kitchen Design', 
      category: 'Interior', 
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=1',
      description: 'Contemporary kitchen with dark cabinets and marble island',
      details: {
        style: 'Modern Contemporary',
        year: '2026',
        area: '450 sq ft',
        designer: 'Studio Design Co.',
        materials: ['Marble', 'Dark Wood', 'Stainless Steel'],
        colors: ['Charcoal Gray', 'White Marble', 'Chrome'],
        features: [
          'Custom dark wood cabinets',
          'Marble waterfall island',
          'Professional-grade appliances',
          'Under-cabinet LED lighting',
          'Smart home integration'
        ],
        specifications: {
          'Ceiling Height': '10 ft',
          'Flooring': 'Porcelain Tile',
          'Lighting': 'LED Recessed + Pendant',
          'Appliances': 'High-End Integrated'
        }
      }
    },
    { 
      id: 2, 
      title: 'Tropical Garden Villa', 
      category: 'Landscape', 
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=2',
      description: 'Luxurious tropical villa with lush landscaping',
      details: {
        style: 'Tropical Modern',
        year: '2026',
        area: '8,500 sq ft',
        designer: 'Tropical Architects',
        materials: ['Natural Stone', 'Tropical Wood', 'Glass'],
        colors: ['Earth Tones', 'Natural Green', 'Cream White'],
        features: [
          'Lush tropical garden',
          'Natural stone pathways',
          'Water features',
          'Outdoor seating areas',
          'Native plant landscaping'
        ],
        specifications: {
          'Lot Size': '15,000 sq ft',
          'Garden Type': 'Tropical Paradise',
          'Irrigation': 'Smart Drip System',
          'Lighting': 'Solar Landscape Lights'
        }
      }
    },
    { 
      id: 3, 
      title: 'Contemporary Villa', 
      category: 'Exterior', 
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=3',
      description: 'Modern two-story villa with pool and palm trees',
      details: {
        style: 'Contemporary Luxury',
        year: '2026',
        area: '5,200 sq ft',
        designer: 'Modern Villa Designs',
        materials: ['Concrete', 'Glass', 'Steel'],
        colors: ['White', 'Gray', 'Natural Wood'],
        features: [
          'Infinity edge pool',
          'Floor-to-ceiling windows',
          'Open-plan living spaces',
          'Covered outdoor terraces',
          'Tropical landscaping'
        ],
        specifications: {
          'Bedrooms': '4',
          'Bathrooms': '4.5',
          'Pool Size': '40 x 15 ft',
          'Parking': '2 Car Garage'
        }
      }
    },
    { 
      id: 4, 
      title: 'Sustainable Modern Home', 
      category: 'Exterior', 
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=4',
      description: 'Eco-friendly home with solar panels and infinity pool',
      details: {
        style: 'Sustainable Modern',
        year: '2026',
        area: '4,800 sq ft',
        designer: 'Green Architecture Studio',
        materials: ['Recycled Materials', 'Bamboo', 'Low-E Glass'],
        colors: ['Natural Wood', 'White', 'Earth Tones'],
        features: [
          'Solar panel roof system',
          'Rainwater harvesting',
          'Energy-efficient design',
          'Natural ventilation',
          'Infinity pool with eco-filtration'
        ],
        specifications: {
          'Energy Rating': 'Net Zero',
          'Solar Capacity': '15 kW',
          'Water Efficiency': '40% Reduction',
          'Green Certification': 'LEED Platinum'
        }
      }
    },
    { 
      id: 5, 
      title: 'Luxury Living Space', 
      category: 'Interior', 
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=5',
      description: 'Open-plan living with copper pendant lights and modern finishes',
      details: {
        style: 'Luxury Contemporary',
        year: '2026',
        area: '850 sq ft',
        designer: 'Interior Luxe',
        materials: ['Marble', 'Copper', 'Premium Wood'],
        colors: ['Warm Gray', 'Copper', 'Cream'],
        features: [
          'Double-height ceiling',
          'Designer copper lighting',
          'Open-plan layout',
          'Premium finishes',
          'Integrated entertainment system'
        ],
        specifications: {
          'Ceiling Height': '18 ft',
          'Flooring': 'Italian Marble',
          'Lighting': 'Custom Copper Pendants',
          'Windows': 'Floor-to-Ceiling Glass'
        }
      }
    },
    { 
      id: 6, 
      title: 'Minimalist Bedroom', 
      category: 'Interior', 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=6',
      description: 'Clean, minimalist bedroom with natural lighting',
      details: {
        style: 'Minimalist Zen',
        year: '2026',
        area: '320 sq ft',
        designer: 'Minimal Living Co.',
        materials: ['Natural Wood', 'Linen', 'Concrete'],
        colors: ['White', 'Natural Wood', 'Soft Gray'],
        features: [
          'Built-in storage',
          'Natural light optimization',
          'Minimalist furniture',
          'Hidden technology',
          'Zen-inspired design'
        ],
        specifications: {
          'Bed Size': 'King',
          'Storage': 'Built-in Wardrobes',
          'Lighting': 'Natural + Ambient LED',
          'Climate': 'Smart HVAC'
        }
      }
    },
    { 
      id: 7, 
      title: 'Modern Bathroom', 
      category: 'Interior', 
      image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=7',
      description: 'Spa-like bathroom with marble finishes',
      details: {
        style: 'Luxury Spa',
        year: '2026',
        area: '180 sq ft',
        designer: 'Spa Design Studio',
        materials: ['Carrara Marble', 'Chrome', 'Glass'],
        colors: ['White Marble', 'Chrome', 'Soft Gray'],
        features: [
          'Walk-in rain shower',
          'Freestanding soaking tub',
          'Heated floors',
          'Smart mirrors',
          'Ambient lighting'
        ],
        specifications: {
          'Shower': 'Walk-in Rain System',
          'Tub': 'Freestanding Soaker',
          'Flooring': 'Heated Marble',
          'Fixtures': 'Premium Chrome'
        }
      }
    },
    { 
      id: 8, 
      title: 'Glass House Design', 
      category: 'Exterior', 
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
      fallback: 'https://picsum.photos/800/600?random=8',
      description: 'Ultra-modern glass house with seamless indoor-outdoor living',
      details: {
        style: 'Ultra-Modern Glass',
        year: '2026',
        area: '6,200 sq ft',
        designer: 'Glass Architecture Group',
        materials: ['Structural Glass', 'Steel', 'Concrete'],
        colors: ['Transparent', 'White', 'Natural Wood'],
        features: [
          'Floor-to-ceiling glass walls',
          'Seamless indoor-outdoor flow',
          'Infinity pool integration',
          'Smart glass technology',
          'Minimalist steel structure'
        ],
        specifications: {
          'Glass Type': 'Low-E Triple Glazed',
          'Structure': 'Steel Frame',
          'Bedrooms': '3',
          'Smart Features': 'Automated Everything'
        }
      }
    }
  ]);

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getFavorites();
      if (response.success) {
        setFavorites(response.favorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleToggleFavorite = async (designId) => {
    if (!user) {
      alert('Please sign in to save favorites');
      window.location.href = '/signin';
      return;
    }

    try {
      const response = await favoritesAPI.toggleFavorite(designId);
      if (response.success) {
        setFavorites(response.favorites || []);
      } else {
        alert(response.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.message.includes('401') || error.message.includes('token')) {
        alert('Please sign in again');
        window.location.href = '/signin';
      } else {
        alert('Failed to update favorites: ' + error.message);
      }
    }
  };

  const isFavorite = (designId) => {
    return favorites.includes(designId);
  };

  const filteredDesigns = filter === 'All'
    ? designs
    : filter === 'Favorites'
    ? designs.filter(design => isFavorite(design.id))
    : designs.filter(design => design.category === filter);

  const openModal = (design) => {
    setSelectedDesign(design);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedDesign(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="gallery-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link-active">Projects</a>
          <a href="/designer" className="nav-link">Designer</a>
          <a href="/ai-designer" className="nav-link">AI Designer</a>
          <a href="/furniture-customizer" className="nav-link">Furniture</a>
          <a href="/viewer" className="nav-link">3D Viewer</a>
          <a href="/services" className="nav-link">Services</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/signin" className="nav-link-signin">Sign In</a>
          <a href="/register" className="btn-nav-primary">Get Started Free</a>
        </div>
      </nav>

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
        {user && (
          <button 
            className={filter === 'Favorites' ? 'active' : ''} 
            onClick={() => setFilter('Favorites')}
          >
            ❤️ Favorites
          </button>
        )}
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
        <button 
          className={filter === 'Landscape' ? 'active' : ''} 
          onClick={() => setFilter('Landscape')}
        >
          Landscape
        </button>
      </div>

      <div className="gallery-grid">
        {filteredDesigns.map(design => (
          <div key={design.id} className="gallery-item">
            <div className="gallery-image-container">
              <img 
                src={design.image} 
                alt={design.title}
                onError={(e) => {
                  e.target.src = design.fallback;
                }}
              />
              <button 
                className={`favorite-btn ${isFavorite(design.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(design.id);
                }}
                title={isFavorite(design.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(design.id) ? '❤️' : '🤍'}
              </button>
              <div className="gallery-overlay">
                <button className="view-btn" onClick={() => openModal(design)}>View Details</button>
              </div>
            </div>
            <div className="gallery-item-info">
              <h3>{design.title}</h3>
              <p className="description">{design.description}</p>
              <span className="category">{design.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Design Details */}
      {selectedDesign && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            
            <div className="modal-body">
              <div className="modal-left">
                <div className="modal-image">
                  <img 
                    src={selectedDesign.image} 
                    alt={selectedDesign.title}
                    onError={(e) => {
                      e.target.src = selectedDesign.fallback;
                    }}
                  />
                </div>
                
                <div className="modal-quick-info">
                  <div className="quick-info-item">
                    <span className="info-icon">📐</span>
                    <div>
                      <span className="info-label">Area</span>
                      <span className="info-value">{selectedDesign.details.area}</span>
                    </div>
                  </div>
                  <div className="quick-info-item">
                    <span className="info-icon">🎨</span>
                    <div>
                      <span className="info-label">Style</span>
                      <span className="info-value">{selectedDesign.details.style}</span>
                    </div>
                  </div>
                  <div className="quick-info-item">
                    <span className="info-icon">📅</span>
                    <div>
                      <span className="info-label">Year</span>
                      <span className="info-value">{selectedDesign.details.year}</span>
                    </div>
                  </div>
                  <div className="quick-info-item">
                    <span className="info-icon">✏️</span>
                    <div>
                      <span className="info-label">Designer</span>
                      <span className="info-value">{selectedDesign.details.designer}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-right">
                <span className="modal-category">{selectedDesign.category}</span>
                <h2>{selectedDesign.title}</h2>
                <p className="modal-description">{selectedDesign.description}</p>
                
                {/* Materials */}
                <div className="detail-section">
                  <h3>Materials</h3>
                  <div className="tags-container">
                    {selectedDesign.details.materials.map((material, index) => (
                      <span key={index} className="tag">{material}</span>
                    ))}
                  </div>
                </div>

                {/* Color Palette */}
                <div className="detail-section">
                  <h3>Color Palette</h3>
                  <div className="tags-container">
                    {selectedDesign.details.colors.map((color, index) => (
                      <span key={index} className="tag color-tag">{color}</span>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div className="detail-section">
                  <h3>Key Features</h3>
                  <ul className="features-list">
                    {selectedDesign.details.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specifications */}
                <div className="detail-section">
                  <h3>Specifications</h3>
                  <div className="specifications-grid">
                    {Object.entries(selectedDesign.details.specifications).map(([key, value], index) => (
                      <div key={index} className="spec-item">
                        <span className="spec-label">{key}</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-primary">
                    <span>🚀</span> Start Similar Design
                  </button>
                  <button 
                    className={`btn-secondary ${isFavorite(selectedDesign.id) ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(selectedDesign.id)}
                  >
                    <span>{isFavorite(selectedDesign.id) ? '❤️' : '🤍'}</span> 
                    {isFavorite(selectedDesign.id) ? 'Saved' : 'Save to Favorites'}
                  </button>
                  <button className="btn-secondary">
                    <span>📤</span> Share Design
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Gallery;