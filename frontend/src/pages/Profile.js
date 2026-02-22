import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/signin');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) return <div>Loading...</div>;

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
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <h3>0</h3>
              <p>Projects</p>
            </div>
            <div className="stat">
              <h3>0</h3>
              <p>Designs</p>
            </div>
            <div className="stat">
              <h3>Member</h3>
              <p>Status</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="edit-btn">Edit Profile</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="profile-projects">
          <h2>My Projects</h2>
          <div className="empty-state">
            <p>No projects yet. Start creating your dream home design!</p>
            <button className="create-btn">Create New Project</button>
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
