import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, isAuthenticated, loading: authLoading, updateUserState } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState('profile'); // 'designs' or 'profile'
  
  // State for professional profile
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    specialization: '',
    experience: '',
    description: '',
    hourlyRate: '',
    availability: true
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // State for general user profile
  const [generalProfileForm, setGeneralProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    bio: ''
  });
  const [updatingGeneralProfile, setUpdatingGeneralProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setGeneralProfileForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['designs', 'profile'].includes(tab)) {
      setActiveProfileTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    console.log('Profile Init:', { authLoading, isAuthenticated, user });
    if (authLoading) return;
    
    if (!isAuthenticated) {
      console.log('Not authenticated, navigating to signin');
      navigate('/signin');
      return;
    }
    fetchUserDesigns();
    if (user?.role === 'Architect') {
      fetchArchitectProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, user?.role, authLoading]);

  const fetchArchitectProfile = async () => {
    try {
      console.log('Fetching architect profile...');
      const res = await fetch('http://localhost:5000/api/architect/my-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Architect profile data:', data);
      if (res.ok) {
        setProfileForm({
          fullName: data.fullName || '',
          specialization: data.profile?.specialization || '',
          experience: data.profile?.experience || '',
          description: data.profile?.description || '',
          hourlyRate: data.profile?.hourlyRate || '',
          availability: data.profile?.availability ?? true
        });
      }
    } catch (err) {
      console.error('Failed to fetch architect profile:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch('http://localhost:5000/api/architect/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        alert('Professional profile updated successfully!');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdateGeneralProfile = async (e) => {
    e.preventDefault();
    setUpdatingGeneralProfile(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(generalProfileForm)
      });
      const data = await res.json();
      if (res.ok) {
        updateUserState(data.user);
        alert('General profile updated successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('General Profile update error:', err);
    } finally {
      setUpdatingGeneralProfile(false);
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/designs/${designId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setDesigns(designs.filter(d => d._id !== designId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || (!user && isAuthenticated)) return <div className="loading-container">Loading session...</div>;
  if (!user && !isAuthenticated && !authLoading) return null;

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{user.fullName}</h1>
            <div className="profile-badge">
              <span className="badge-icon">👑</span>
              <span>Premium Architect</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>Dashboard info</h3>
            <p className="profile-email">{user.email}</p>
            
            <div className="profile-stats-grid">
              <div className="stat-item">
                <span className="stat-value">{designs.length}</span>
                <span className="stat-label">Layouts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3D</span>
                <span className="stat-label">Mode</span>
              </div>
            </div>

            <div className="action-stack">
              <button className="btn-primary" onClick={() => navigate('/designer')}>
                <span>📐</span> New Project
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>


        </div>

        <div className="profile-projects-main">
          <div className="projects-header">
            <h2 style={{ fontSize: '2rem' }}>Profile Workspace</h2>
            <div className="filter-tabs">
              <span 
                className={`tab ${activeProfileTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('profile')}
              >
                👤 My Profile
              </span>
              <span 
                className={`tab ${activeProfileTab === 'designs' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('designs')}
              >
                All Projects ({designs.length})
              </span>
            </div>
          </div>

          {activeProfileTab === 'designs' ? (
            loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
              </div>
            ) : error ? (
              <div className="error-banner">⚠️ {error}</div>
            ) : designs.length === 0 ? (
              <div className="empty-state glass-card">
                <div className="empty-icon">📂</div>
                <h3>Your gallery is empty</h3>
                <p>Create your first professional 3D house layout today.</p>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/designer')}>
                  Start Project
                </button>
              </div>
            ) : (
              <div className="designs-grid">
                {designs.map(design => (
                  <div key={design._id} className="design-card">
                    <div className="design-preview">
                      <span className="design-icon">🏫</span>
                      <div className="preview-overlay">
                         <button onClick={() => navigate('/viewer', { state: { design } })}>View 3D</button>
                      </div>
                    </div>
                    <div className="design-info">
                      <h3>{design.name}</h3>
                      <div className="design-meta">
                        <span>{design.parameters?.bedrooms || 0} Bed</span>
                        <span>{design.parameters?.bathrooms || 0} Bath</span>
                        <span>{design.parameters?.totalArea || 0} sqft</span>
                      </div>
                    </div>
                    <div className="design-footer">
                       <button className="delete-btn-minimal" onClick={() => handleDeleteDesign(design._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeProfileTab === 'profile' ? (
            <div className="profile-forms-container">
           
            <section className="glass-section profile-mgmt-section wide-panel">
                <div className="workspace-header">
                    <h2>General Profile Information</h2>
                    <p className="section-subtitle">Update your personal contact details.</p>
                </div>
                <form onSubmit={handleUpdateGeneralProfile} className="profile-form">
                    <div className="form-group">
                        <label>Your Full Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Kasun Perera"
                            value={generalProfileForm.fullName}
                            onChange={(e) => setGeneralProfileForm({...generalProfileForm, fullName: e.target.value})}
                        />
                    </div>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input 
                                type="tel" 
                                placeholder="07XXXXXXXX"
                                value={generalProfileForm.phoneNumber}
                                onChange={(e) => setGeneralProfileForm({...generalProfileForm, phoneNumber: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input 
                                type="text" 
                                placeholder="Your City or Address"
                                value={generalProfileForm.address}
                                onChange={(e) => setGeneralProfileForm({...generalProfileForm, address: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Short Bio</label>
                        <textarea 
                            placeholder="A few words about you..."
                            value={generalProfileForm.bio}
                            onChange={(e) => setGeneralProfileForm({...generalProfileForm, bio: e.target.value})}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-update-profile" disabled={updatingGeneralProfile}>
                        {updatingGeneralProfile ? 'Updating Details...' : 'Save General Details'}
                    </button>
                </form>
            </section>

            {user?.role === 'Architect' && (
            /* Professional Profile Form - EXACT UI FROM DASHBOARD */
            <section className="glass-section profile-mgmt-section wide-panel" style={{ marginTop: '30px' }}>
                <div className="workspace-header">
                    <h2>Professional Profile Management</h2>
                    <p className="section-subtitle">This information will be visible to all customers browsing architects.</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-group">
                        <label>Your Full Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Ar. Kasun Perera"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                        />
                    </div>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Professional Specialization</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Modern Residential Architect"
                                value={profileForm.specialization}
                                onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Years of Experience</label>
                            <input 
                                type="number" 
                                value={profileForm.experience}
                                onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Professional Biography / Description</label>
                        <textarea 
                            placeholder="Tell clients about your expertise..."
                            value={profileForm.description}
                            onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label>Hourly Rate ($)</label>
                            <input 
                                type="number" 
                                value={profileForm.hourlyRate}
                                onChange={(e) => setProfileForm({...profileForm, hourlyRate: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Current Availability</label>
                            <select 
                                value={profileForm.availability}
                                onChange={(e) => setProfileForm({...profileForm, availability: e.target.value === 'true'})}
                            >
                                <option value="true">Available for Hire</option>
                                <option value="false">Busy / Not Available</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn-update-profile" disabled={updatingProfile}>
                        {updatingProfile ? 'Syncing Profile...' : 'Save Public Profile Data'}
                    </button>
                </form>
            </section>
            )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Profile;
