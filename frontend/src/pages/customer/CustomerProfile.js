import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Profile.css';

function CustomerProfile() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, loading: authLoading, updateUserState } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [customerProjects, setCustomerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState('overview');
  
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
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchUserDesigns();
    fetchUserMeetings();
    fetchDeliveries();
    fetchCustomerProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, authLoading]);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/deliveries/my-deliveries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setDeliveries(data.deliveries || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    }
  };

  const fetchCustomerProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setCustomerProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUserMeetings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meetings/my-meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
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
        alert('Profile updated successfully!');
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

  if (authLoading || (!user && isAuthenticated)) return <div className="loading-container">Loading...</div>;
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
              <span className="badge-icon">🌟</span>
              <span>Valued Customer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>At a Glance</h3>
            <p className="profile-email">{user.email}</p>
            
            <div className="profile-stats-grid">
              <div className="stat-item">
                <span className="stat-value">{designs.length}</span>
                <span className="stat-label">Saved Layouts</span>
              </div>
            </div>

            <div className="action-stack">
              <button className="btn-primary" onClick={() => navigate('/designer')}>
                <span>📐</span> Design New House
              </button>
            </div>
          </div>
        </div>

        <div className="profile-projects-main" style={{ width: '100%' }}>
          <div className="projects-header">
            <h2 style={{ fontSize: '2rem' }}>Customer Dashboard</h2>
            <div className="filter-tabs">
              <span 
                className={`tab ${activeProfileTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('overview')}
              >
                📊 Overview
              </span>
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
                Saved Floorplans ({designs.length})
              </span>
              <span 
                className={`tab ${activeProfileTab === 'meetings' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('meetings')}
              >
                My Meetings ({meetings.length})
              </span>
              <span 
                className={`tab ${activeProfileTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('plans')}
              >
                🗺️ 2D Plans ({deliveries.length})
              </span>
              <span 
                className={`tab ${activeProfileTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('projects')}
              >
                🚀 My Projects ({customerProjects.length})
              </span>
            </div>
          </div>

          {activeProfileTab === 'overview' ? (
             <div className="dashboard-overview">
                 <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                     <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(0,217,255,0.1), rgba(0,0,0,0.4))', borderTop: '2px solid #00d9ff' }}>
                         <h4 style={{ margin: 0, opacity: 0.7 }}>Active Projects</h4>
                         <h2 style={{ margin: '10px 0 0', fontSize: '2.5rem', color: '#00d9ff' }}>{customerProjects.length}</h2>
                     </div>
                     <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(0,0,0,0.4))', borderTop: '2px solid #a78bfa' }}>
                         <h4 style={{ margin: 0, opacity: 0.7 }}>Saved Floorplans</h4>
                         <h2 style={{ margin: '10px 0 0', fontSize: '2.5rem', color: '#a78bfa' }}>{designs.length}</h2>
                     </div>
                     <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(0,0,0,0.4))', borderTop: '2px solid #fbbf24' }}>
                         <h4 style={{ margin: 0, opacity: 0.7 }}>Architect Meetings</h4>
                         <h2 style={{ margin: '10px 0 0', fontSize: '2.5rem', color: '#fbbf24' }}>{meetings.length}</h2>
                     </div>
                     <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,0,0,0.4))', borderTop: '2px solid #00ff88' }}>
                         <h4 style={{ margin: 0, opacity: 0.7 }}>Delivered 2D Plans</h4>
                         <h2 style={{ margin: '10px 0 0', fontSize: '2.5rem', color: '#00ff88' }}>{deliveries.length}</h2>
                     </div>
                 </div>

                 <div className="dashboard-recent-activity" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     <div className="glass-card" style={{ padding: '25px' }}>
                         <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', margin: '0 0 20px 0' }}>Latest Projects 🚀</h3>
                         {customerProjects.length > 0 ? (
                             customerProjects.slice(0, 3).map(p => (
                               <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px' }}>
                                   <div>
                                       <h4 style={{ margin: '0 0 5px 0' }}>{p.title}</h4>
                                       <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>{p.architect?.fullName}</span>
                                   </div>
                                   <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{p.status}</span>
                               </div>
                             ))
                         ) : (
                             <p style={{ opacity: 0.6 }}>No projects started yet.</p>
                         )}
                         <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setActiveProfileTab('projects')}>View All Projects</button>
                     </div>

                     <div className="glass-card" style={{ padding: '25px' }}>
                         <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', margin: '0 0 20px 0' }}>Upcoming Meetings 📅</h3>
                         {meetings.filter(m => m.status === 'Accepted').length > 0 ? (
                             meetings.filter(m => m.status === 'Accepted').slice(0, 3).map(m => (
                               <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(0,255,136,0.05)', borderRadius: '10px', marginBottom: '10px', borderLeft: '3px solid #00ff88' }}>
                                   <div>
                                       <h4 style={{ margin: '0 0 5px 0' }}>{m.topic}</h4>
                                       <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>With {m.architect?.fullName}</span>
                                   </div>
                                   <div style={{ textAlign: 'right' }}>
                                       <div style={{ color: '#00ff88', fontWeight: 'bold' }}>{m.time}</div>
                                       <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{m.date}</div>
                                   </div>
                               </div>
                             ))
                         ) : (
                             <p style={{ opacity: 0.6 }}>No upcoming accepted meetings.</p>
                         )}
                         <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={() => setActiveProfileTab('meetings')}>Manage Meetings</button>
                     </div>
                 </div>
             </div>
          ) : activeProfileTab === 'plans' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {deliveries.length === 0 ? (
                <div className="empty-state glass-card">
                  <div className="empty-icon">🗺️</div>
                  <h3>No Plans Delivered Yet</h3>
                  <p>Your architect will upload 2D plans here after your meeting.</p>
                </div>
              ) : deliveries.map(d => (
                <div key={d._id} className="design-card" style={{ padding: '20px', borderLeft: '4px solid #00d9ff' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{d.title}</h3>
                  <p style={{ margin: '0 0 5px', fontSize: '0.85rem', opacity: 0.6 }}>From: {d.architect?.fullName} • {new Date(d.createdAt).toLocaleDateString()}</p>
                  {d.description && <p style={{ margin: '0 0 12px', fontSize: '0.9rem', opacity: 0.8 }}>{d.description}</p>}
                  {d.fileType === 'image' ? (
                    <div>
                      <img src={`http://localhost:5000${d.filePath}`} alt={d.title} style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(0,217,255,0.3)', background: '#000' }} />
                      <a href={`http://localhost:5000${d.filePath}`} download={d.fileName} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', textDecoration: 'none', padding: '8px 18px', borderRadius: '6px' }}>
                        ⬇️ Download Plan
                      </a>
                    </div>
                  ) : (
                    <a href={`http://localhost:5000${d.filePath}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '8px 18px', borderRadius: '6px' }}>
                      📄 View PDF Plan
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : activeProfileTab === 'projects' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {customerProjects.length === 0 ? (
                <div className="empty-state glass-card">
                  <div className="empty-icon">🚀</div>
                  <h3>No Active Projects</h3>
                  <p>Your architect will start a project for you after your meeting is confirmed.</p>
                </div>
              ) : customerProjects.map(project => {
                const statusColors = { 'Planning': '#00d9ff', 'Design Phase': '#a78bfa', 'In Progress': '#fbbf24', 'Review': '#fb923c', 'Completed': '#00ff88', 'On Hold': '#ff4444' };
                const color = statusColors[project.status] || '#00d9ff';
                return (
                  <div key={project._id} className="design-card" style={{ padding: '20px', borderLeft: `4px solid ${color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0 }}>{project.title}</h3>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: color + '22', color, border: `1px solid ${color}44` }}>{project.status}</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.85rem', opacity: 0.6 }}>Architect: {project.architect?.fullName} • {project.projectType}</p>
                    {project.estimatedTimeline && <p style={{ margin: '0 0 5px', fontSize: '0.85rem', opacity: 0.6 }}>⏱️ Timeline: {project.estimatedTimeline}</p>}
                    {project.estimatedBudget && <p style={{ margin: '0 0 5px', fontSize: '0.85rem', opacity: 0.6 }}>💰 Budget: {project.estimatedBudget}</p>}
                    {project.description && <p style={{ margin: '10px 0 0', fontSize: '0.9rem', opacity: 0.8 }}>{project.description}</p>}
                    {project.milestones?.length > 0 && (
                      <div style={{ marginTop: '15px' }}>
                        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', opacity: 0.5, fontWeight: 'bold' }}>PROJECT MILESTONES</p>
                        {project.milestones.map((m, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem' }}>
                            <span>{m.completed ? '✅' : '⬜'}</span>
                            <span style={{ opacity: m.completed ? 0.4 : 0.9, textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {project.notes && (
                      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7, fontStyle: 'italic' }}>"{project.notes}"</p>
                        <small style={{ opacity: 0.4, display: 'block', marginTop: '4px' }}>— Note from Architect</small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeProfileTab === 'meetings' ? (
             <div className="designs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {meetings.length === 0 ? (
                  <div className="empty-state glass-card">
                    <div className="empty-icon">📅</div>
                    <h3>No Meeting Requests</h3>
                    <p>You haven't requested any meetings with architects yet.</p>
                  </div>
                ) : meetings.map(meeting => (
                  <div key={meeting._id} className="design-card" style={{ padding: '20px', borderLeft: `4px solid ${meeting.status === 'Accepted' ? '#00ff88' : meeting.status === 'Rejected' ? '#ff4444' : '#00d9ff'}` }}>
                    <div className="design-info" style={{ padding: 0 }}>
                      <h3>{meeting.topic}</h3>
                      <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        <p style={{ margin: '5px 0' }}><strong>Architect:</strong> {meeting.architect?.fullName}</p>
                        <p style={{ margin: '5px 0' }}><strong>Date & Time:</strong> {meeting.date} at {meeting.time}</p>
                        <p style={{ margin: '5px 0' }}>
                           <strong>Status:</strong> 
                           <span style={{ marginLeft: '10px', color: meeting.status === 'Accepted' ? '#00ff88' : meeting.status === 'Rejected' ? '#ff4444' : '#00d9ff' }}>
                             {meeting.status}
                           </span>
                        </p>
                        {meeting.status === 'Accepted' && meeting.meetingLink && (
                          <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,255,136,0.1)', borderRadius: '8px', borderLeft: '3px solid #00ff88' }}>
                            <p style={{ margin: 0, color: '#e0e0e0', marginBottom: '10px' }}><strong>Your Meeting is Ready</strong></p>
                            <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '10px 20px', borderRadius: '5px' }}>
                               <span>🎥</span> Join Meeting
                            </a>
                            <small style={{ display: 'block', marginTop: '10px', opacity: 0.7 }}>Please click the button above to join at the scheduled time.</small>
                          </div>
                        )}
                        {meeting.status === 'Rejected' && meeting.architectNote && (
                          <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,68,68,0.1)', borderRadius: '8px', borderLeft: '3px solid #ff4444' }}>
                            <p style={{ margin: 0, fontStyle: 'italic', color: '#ffaaaa' }}>" {meeting.architectNote} "</p>
                            <small style={{ display: 'block', marginTop: '5px', opacity: 0.7 }}>- Note from Architect</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          ) : activeProfileTab === 'designs' ? (
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
                <p>Create your first 3D house layout today.</p>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/designer')}>
                  Start Designing
                </button>
              </div>
            ) : (
              <div className="designs-grid">
                {designs.map(design => (
                  <div key={design._id} className="design-card">
                    <div className="design-preview">
                       <span className="design-icon">🏠</span>
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
                    <h2>Personal Information</h2>
                    <p className="section-subtitle">Manage your personal settings and contact details.</p>
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
                        <label>Short Bio (Optional)</label>
                        <textarea 
                            placeholder="A few words about yourself..."
                            value={generalProfileForm.bio}
                            onChange={(e) => setGeneralProfileForm({...generalProfileForm, bio: e.target.value})}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-update-profile" disabled={updatingGeneralProfile}>
                        {updatingGeneralProfile ? 'Updating Details...' : 'Save Profile Changes'}
                    </button>
                </form>
            </section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
