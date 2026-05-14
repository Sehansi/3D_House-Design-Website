import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HouseModel3D from '../components/HouseModel3D';
import '../styles/Viewer3D.css';

function Viewer3D() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [modelData, setModelData] = useState(null);
  const [parameters, setParameters] = useState(null);
  const [finishes, setFinishes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('exterior');
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    // Get model data from navigation state or load from backend
    if (location.state) {
      const { modelData: stateModelData, parameters: stateParams, finishes: stateFinishes, design } = location.state;
      
      if (design) {
        // Load from saved design
        setModelData(design.modelData);
        setParameters(design.parameters);
        setFinishes(design.finishes);
      } else {
        // Load from preview
        setModelData(stateModelData);
        setParameters(stateParams);
        setFinishes(stateFinishes);
      }
      setLoading(false);
    } else {
      // No data provided, show default model
      setModelData(generateDefaultModel());
      setParameters({
        bedrooms: 3,
        bathrooms: 2,
        kitchen: true,
        livingRoom: true,
        totalArea: 2000,
        floors: 1,
        style: 'modern'
      });
      setFinishes({
        wallColor: '#ffffff',
        floorType: 'tile',
        roofType: 'sloped'
      });
      setLoading(false);
    }
  }, [location]);

  const generateDefaultModel = () => {
    return {
      rooms: [
        {
          type: 'living',
          position: { x: 0, y: 0, z: 0 },
          dimensions: { width: 6, height: 3, depth: 5 }
        },
        {
          type: 'kitchen',
          position: { x: 6.5, y: 0, z: 0 },
          dimensions: { width: 4, height: 3, depth: 4 }
        },
        {
          type: 'bedroom',
          position: { x: 0, y: 0, z: -5.5 },
          dimensions: { width: 4, height: 3, depth: 4 }
        },
        {
          type: 'bedroom',
          position: { x: 4.5, y: 0, z: -5.5 },
          dimensions: { width: 4, height: 3, depth: 4 }
        },
        {
          type: 'bathroom',
          position: { x: 9, y: 0, z: -5.5 },
          dimensions: { width: 2.5, height: 3, depth: 2.5 }
        }
      ],
      style: 'modern',
      metadata: {
        totalRooms: 5,
        totalArea: 2000,
        floors: 1
      }
    };
  };

  const handleExport = () => {
    alert('Export functionality coming soon! You will be able to export as GLB, OBJ, or FBX format.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '3D House Design',
        text: 'Check out my 3D house design!',
        url: window.location.href
      });
    } else {
      alert('Share functionality not supported in this browser');
    }
  };

  const handleEdit = () => {
    navigate('/designer', { state: { parameters, finishes } });
  };

  if (loading) {
    return (
      <div className="viewer-loading">
        <div className="loading-spinner"></div>
        <p>Loading 3D Model...</p>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/designer" className="nav-link">Designer</a>
          <a href="/ai-designer" className="nav-link">AI Designer</a>
          <a href="/furniture-customizer" className="nav-link">Furniture</a>
          <a href="/viewer" className="nav-link-active">3D Viewer</a>
          {isAuthenticated ? (
            <a href="/profile" className="nav-link">Profile</a>
          ) : (
            <>
              <a href="/signin" className="nav-link">Sign In</a>
              <a href="/register" className="btn-nav-primary">Get Started</a>
            </>
          )}
        </div>
      </nav>

      <div className="viewer-content">
        <div className="viewer-header">
          <h1>3D Model Viewer</h1>
          <p>Interact with your 3D house design</p>
        </div>

        <div className="viewer-main">
          <div className="viewer-canvas">
            <HouseModel3D 
              modelData={modelData} 
              parameters={parameters} 
              finishes={finishes}
            />
            
            <div className="viewer-controls">
              <div className="control-group">
                <button 
                  className={`control-btn ${viewMode === 'exterior' ? 'active' : ''}`}
                  onClick={() => setViewMode('exterior')}
                >
                  🏠 Exterior
                </button>
                <button 
                  className={`control-btn ${viewMode === 'interior' ? 'active' : ''}`}
                  onClick={() => setViewMode('interior')}
                >
                  🚪 Interior
                </button>
              </div>
              
              <div className="control-group">
                <button 
                  className={`control-btn ${showGrid ? 'active' : ''}`}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  📐 Grid
                </button>
              </div>
            </div>

            <div className="viewer-instructions">
              <p>🖱️ Left Click + Drag to rotate</p>
              <p>🖱️ Right Click + Drag to pan</p>
              <p>🖱️ Scroll to zoom</p>
            </div>
          </div>

          <div className="viewer-sidebar">
            <div className="info-card">
              <h3>Design Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Bedrooms</span>
                  <span className="info-value">{parameters?.bedrooms || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bathrooms</span>
                  <span className="info-value">{parameters?.bathrooms || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Area</span>
                  <span className="info-value">{parameters?.totalArea || 0} sq ft</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Floors</span>
                  <span className="info-value">{parameters?.floors || 1}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Style</span>
                  <span className="info-value">{parameters?.style || 'Modern'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rooms</span>
                  <span className="info-value">{modelData?.rooms?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Finishes</h3>
              <div className="finishes-list">
                <div className="finish-item">
                  <span>Wall Color</span>
                  <div className="color-preview" style={{ background: finishes?.wallColor || '#ffffff' }}></div>
                </div>
                <div className="finish-item">
                  <span>Floor Type</span>
                  <span className="finish-value">{finishes?.floorType || 'Tile'}</span>
                </div>
                <div className="finish-item">
                  <span>Roof Type</span>
                  <span className="finish-value">{finishes?.roofType || 'Sloped'}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="action-btn primary" onClick={handleEdit}>
                ✏️ Edit Design
              </button>
              <button className="action-btn secondary" onClick={handleExport}>
                📥 Export Model
              </button>
              <button className="action-btn secondary" onClick={handleShare}>
                📤 Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">3D House Design</span>
          </div>
          <p className="footer-text">© 2026 3D House Design. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Viewer3D;
