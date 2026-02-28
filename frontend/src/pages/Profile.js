import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('designs');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    fetchUserDesigns();
  }, [isAuthenticated, navigate]);

  const fetchUserDesigns = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/designs/my-designs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setDesigns(data.designs || []);
      } else {
        setError(data.message || 'Failed to load designs');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!window.confirm('Are you sure you want to delete this design?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/designs/${designId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setDesigns(designs.filter(d => d._id !== designId));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete design');
      }
    } catch (err) {
      alert('Failed to delete design');
    }
  };

  const handleViewDesign = (design) => {
    navigate('/viewer', { state: { design } });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="profile-container">
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
          <a href="/viewer" className="nav-link">3D Viewer</a>
          <a href="/services" className="nav-link">Services</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/profile" className="nav-link-active">Profile</a>
        </div>
      </nav>

      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          
          <div className="profile-info">
            <h2>{user.fullName}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <h3>{designs.length}</h3>
              <p>Designs</p>
            </div>
            <div className="stat">
              <h3>Member</h3>
              <p>Status</p>
            </div>
            <div className="stat">
              <h3>Active</h3>
              <p>Account</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="edit-btn" onClick={() => setActiveTab('settings')}>Edit Profile</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="profile-projects">
          <div className="projects-header">
            <h2>My Designs</h2>
            <button className="create-btn" onClick={() => navigate('/designer')}>
              + Create New Design
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your designs...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button onClick={fetchUserDesigns}>Retry</button>
            </div>
          ) : designs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📐</div>
              <p>No designs yet. Start creating your dream home design!</p>
              <button className="create-btn" onClick={() => navigate('/designer')}>
                Create Your First Design
              </button>
            </div>
          ) : (
            <div className="designs-grid">
              {designs.map(design => (
                <div key={design._id} className="design-card">
                  <div className="design-preview">
                    <div className="design-placeholder">
                      <span className="design-icon">🏠</span>
                    </div>
                  </div>
                  <div className="design-info">
                    <h3>{design.name}</h3>
                    <div className="design-details">
                      <span>🛏️ {design.parameters.bedrooms} Beds</span>
                      <span>🚿 {design.parameters.bathrooms} Baths</span>
                      <span>📐 {design.parameters.totalArea} sq ft</span>
                    </div>
                    <p className="design-date">
                      Created: {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="design-actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDesign(design)}
                    >
                      👁️ View
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteDesign(design._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default Profile;
