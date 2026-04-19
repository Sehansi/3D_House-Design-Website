import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Architect.css';
import { useAuth } from '../../context/AuthContext';
import { BarChart2, CheckSquare, Phone, Folder, Rocket, Map, Calendar, User, Tag, Clock, Square } from 'lucide-react';

const STATUS_COLORS = {
  'Planning': '#00d9ff',
  'Design Phase': '#a78bfa',
  'In Progress': '#fbbf24',
  'Review': '#fb923c',
  'Completed': '#00ff88',
  'On Hold': '#ff4444'
};

function ArchitectDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectForm, setProjectForm] = useState({
    customerId: '',
    meetingId: '',
    title: '',
    description: '',
    projectType: 'Residential',
    estimatedTimeline: '',
    estimatedBudget: '',
    notes: '',
    milestones: ['']
  });

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [meetingsRes, projectsRes] = await Promise.all([
        fetch('http://localhost:5000/api/meetings/my-meetings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/projects/my-projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const meetingsData = await meetingsRes.json();
      const projectsData = await projectsRes.json();
      console.log('RAW MEETINGS DATA:', meetingsData); // debug
      const allMeetings = meetingsData.meetings || [];
      const acceptedMeetings = allMeetings.filter(m => m.status === 'Accepted');
      console.log('All meetings count:', allMeetings.length, '| Accepted:', acceptedMeetings.length);
      if (meetingsRes.ok) setMeetings(acceptedMeetings);
      if (projectsRes.ok) setProjects(projectsData.projects || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMilestoneChange = (i, value) => {
    const updated = [...projectForm.milestones];
    updated[i] = value;
    setProjectForm({ ...projectForm, milestones: updated });
  };

  const addMilestone = () => setProjectForm({ ...projectForm, milestones: [...projectForm.milestones, ''] });
  const removeMilestone = (i) => {
    const updated = projectForm.milestones.filter((_, idx) => idx !== i);
    setProjectForm({ ...projectForm, milestones: updated });
  };

  const handleStartProject = async () => {
    if (!projectForm.customerId || !projectForm.title.trim()) {
      alert('Please select a client and enter a project title.');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('http://localhost:5000/api/projects/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...projectForm,
          milestones: projectForm.milestones.filter(m => m.trim())
        })
      });
      if (response.ok) {
        alert('Project started successfully! Your client will be notified.');
        setShowProjectModal(false);
        setProjectForm({
          customerId: '', meetingId: '', title: '', description: '',
          projectType: 'Residential', estimatedTimeline: '', estimatedBudget: '',
          notes: '', milestones: ['']
        });
        fetchDashboardData();
      } else {
        const data = await response.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  // When architect selects a meeting, auto-populate the client
  const handleMeetingSelect = (meetingId) => {
    const meeting = meetings.find(m => m._id === meetingId);
    setProjectForm({
      ...projectForm,
      meetingId,
      customerId: meeting ? meeting.customer?._id : ''
    });
  };

  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  return (
    <div className="architect-dashboard-container">
      <div className="architect-header">
        <h1>Welcome, Ar. {user?.fullName || 'Architect'}</h1>
      </div>

      {/* Stats Row */}
      <div className="architect-grid">
        <div className="architect-glass-panel stat-card">
          <div className="stat-icon"><BarChart2 size={24} /></div>
          <div className="stat-details">
            <h3>{loadingData ? '...' : activeProjects.length}</h3>
            <p>Active Projects</p>
          </div>
        </div>

        <div className="architect-glass-panel stat-card">
          <div className="stat-icon"><CheckSquare size={24} /></div>
          <div className="stat-details">
            <h3>{loadingData ? '...' : completedProjects.length}</h3>
            <p>Completed Projects</p>
          </div>
        </div>

        <div className="architect-glass-panel stat-card">
          <div className="stat-icon"><Phone size={24} /></div>
          <div className="stat-details">
            <h3>{loadingData ? '...' : meetings.length}</h3>
            <p>Accepted Meetings</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="architect-glass-panel" style={{ marginTop: '30px', padding: '25px' }}>
        <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowProjectModal(true)}
            style={{
              padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Rocket size={16} /> Start New Project
          </button>
          <button onClick={() => navigate('/architect/workstation')} style={{ padding: '12px 24px', background: 'rgba(0,217,255,0.15)', border: '1px solid #00d9ff', color: '#00d9ff', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={16} /> Upload 2D Plans
          </button>
          <button onClick={() => navigate('/architect/meetings')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} /> View Meetings
          </button>
        </div>
      </div>

      {/* Active Projects */}
      <div className="architect-glass-panel" style={{ marginTop: '25px', padding: '25px' }}>
        <h2 style={{ marginBottom: '20px' }}>Active Projects</h2>
        {loadingData ? (
          <p style={{ opacity: 0.5 }}>Loading...</p>
        ) : activeProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>
            <span style={{ display: 'block', marginBottom: '10px' }}><Folder size={48} strokeWidth={1} /></span>
            <p>No active projects. Click "Start New Project" to begin one with a client.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {activeProjects.map(project => (
              <div key={project._id} style={{
                padding: '20px', background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px', borderLeft: `4px solid ${STATUS_COLORS[project.status] || '#00d9ff'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{project.title}</h3>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                    background: STATUS_COLORS[project.status] + '22', color: STATUS_COLORS[project.status],
                    border: `1px solid ${STATUS_COLORS[project.status]}44`
                  }}>{project.status}</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', opacity: 0.6 }}>
                  <User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Client: {project.customer?.fullName}
                </p>
                <p style={{ margin: '0 0 5px', fontSize: '0.85rem', opacity: 0.6 }}>
                  <Tag size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {project.projectType}
                  {project.estimatedTimeline && <span> • <Clock size={12} style={{ verticalAlign: 'middle' }} /> {project.estimatedTimeline}</span>}
                </p>
                {project.milestones?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.8rem', opacity: 0.5 }}>Milestones:</p>
                    {project.milestones.slice(0, 3).map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.82rem' }}>
                        <span style={{ color: m.completed ? '#00ff88' : 'rgba(255,255,255,0.3)' }}>{m.completed ? <CheckSquare size={14} /> : <Square size={14} />}</span>
                        <span style={{ opacity: m.completed ? 0.4 : 0.9 }}>{m.title}</span>
                      </div>
                    ))}
                    {project.milestones.length > 3 && <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>+{project.milestones.length - 3} more...</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Project Modal */}
      {showProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '16px', padding: '30px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Rocket size={20} /> Start New Client Project
            </h2>
            <p style={{ margin: '0 0 20px 0', opacity: 0.5, fontSize: '0.9rem' }}>Create a project and link it to an accepted client meeting.</p>

            {/* Link to Meeting */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Link to Client Meeting *</label>
              <select
                value={projectForm.meetingId}
                onChange={e => handleMeetingSelect(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
              >
                <option value="">-- Select an Accepted Meeting --</option>
                {meetings.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.customer?.fullName} — {m.topic} ({m.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Project Title */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Project Title *</label>
              <input
                type="text"
                placeholder="e.g. Modern 3-Bedroom Villa Design"
                value={projectForm.title}
                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            {/* Type + Timeline Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Project Type</label>
                <select
                  value={projectForm.projectType}
                  onChange={e => setProjectForm({ ...projectForm, projectType: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }}
                >
                  {['Residential', 'Commercial', 'Interior', 'Renovation', 'Landscaping', 'Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Estimated Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 3 months"
                  value={projectForm.estimatedTimeline}
                  onChange={e => setProjectForm({ ...projectForm, estimatedTimeline: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Budget */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Estimated Budget (Optional)</label>
              <input
                type="text"
                placeholder="e.g. $5,000 - $10,000"
                value={projectForm.estimatedBudget}
                onChange={e => setProjectForm({ ...projectForm, estimatedBudget: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Project Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of the project scope..."
                value={projectForm.description}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Milestones */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Project Milestones</label>
              {projectForm.milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder={`Milestone ${i + 1}`}
                    value={m}
                    onChange={e => handleMilestoneChange(i, e.target.value)}
                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white' }}
                  />
                  {projectForm.milestones.length > 1 && (
                    <button onClick={() => removeMilestone(i)} style={{ padding: '8px 12px', background: 'rgba(255,68,68,0.2)', border: 'none', color: '#ff4444', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={addMilestone} style={{ padding: '6px 14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.5)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                + Add Milestone
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowProjectModal(false)} style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={handleStartProject}
                disabled={creating}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {creating ? 'Starting...' : <><Rocket size={15} /> Start Project</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchitectDashboard;
