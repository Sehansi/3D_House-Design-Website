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
    </div>
  );
}

export default Profile;
