import React, { useState, useEffect, useRef } from 'react';
import '../../styles/Architect.css';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000';

function Workstation() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, deliveriesRes] = await Promise.all([
        fetch(`${API}/api/projects/my-projects`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API}/api/deliveries/my-deliveries`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const projectsData = await projectsRes.json();
      const deliveriesData = await deliveriesRes.json();
      if (projectsRes.ok) setProjects(projectsData.projects || []);
      if (deliveriesRes.ok) setDeliveries(deliveriesData.deliveries || []);
    } catch (err) {
      console.error('Error fetching workstation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }
    setSelectedFile(file);
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview({ url: ev.target.result, type: file.type });
      reader.readAsDataURL(file);
    } else {
      setFilePreview({ url: null, type: 'application/pdf' });
    }
  };

  const handleUpload = async () => {
    if (!selectedProject) { alert('Please select a project.'); return; }
    if (!uploadForm.title.trim()) { alert('Please enter a plan title.'); return; }
    if (!selectedFile) { alert('Please select a file to upload.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('planFile', selectedFile);
      formData.append('projectId', selectedProject._id);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);

      const response = await fetch(`${API}/api/deliveries/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — let browser set multipart boundary
        body: formData
      });

      if (response.ok) {
        alert('2D Plan delivered to client successfully!');
        closeModal();
        fetchData();
      } else {
        const data = await response.json();
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const openUploadModal = (project) => {
    setSelectedProject(project);
    setShowUploadModal(true);
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setSelectedProject(null);
    setUploadForm({ title: '', description: '' });
    setSelectedFile(null);
    setFilePreview(null);
  };

  const activeProjects = projects.filter(p => p.status !== 'Completed');

  return (
    <div className="architect-dashboard-container">
      <div className="architect-header">
        <h1>Professional Workstation</h1>
      </div>

      <div className="workstation-container">
        {/* LEFT — Project List */}
        <div className="architect-glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#00d9ff' }}>
            📋 Client Projects ({activeProjects.length})
          </h3>

          {loading ? (
            <p style={{ opacity: 0.6 }}>Loading projects...</p>
          ) : activeProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📁</span>
              <p>No active projects. Start a project from the Dashboard first.</p>
            </div>
          ) : (
            activeProjects.map(project => (
              <div key={project._id} className="blueprint-item" style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <strong>{project.title}</strong>
                <p style={{ margin: '4px 0', fontSize: '0.85rem', opacity: 0.6 }}>
                  👤 {project.customer?.fullName} &nbsp;•&nbsp; 🏷️ {project.projectType}
                </p>
                <p style={{ margin: '4px 0 10px', fontSize: '0.82rem', opacity: 0.5 }}>
                  Status: {project.status}
                </p>
                <button
                  onClick={() => openUploadModal(project)}
                  style={{
                    padding: '7px 16px', background: 'rgba(0,217,255,0.15)',
                    border: '1px solid #00d9ff', color: '#00d9ff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  📤 Upload 2D Plan
                </button>
              </div>
            ))
          )}
        </div>

        {/* RIGHT — Delivered Plans */}
        <div className="architect-glass-panel">
          <h3 style={{ margin: '0 0 20px 0' }}>📦 Delivered Plans ({deliveries.length})</h3>

          {deliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🏗️</span>
              <p>Uploaded plans will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {deliveries.map(d => (
                <div key={d._id} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', borderLeft: '3px solid #00d9ff' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{d.title}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', opacity: 0.6 }}>
                    Project: {d.project?.title} &nbsp;•&nbsp; To: {d.customer?.fullName} &nbsp;•&nbsp; {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                  {d.fileType === 'image' ? (
                    <img
                      src={`${API}${d.filePath}`}
                      alt={d.title}
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <a href={`${API}${d.filePath}`} target="_blank" rel="noreferrer" style={{ color: '#00d9ff', fontSize: '0.9rem' }}>
                      📄 View PDF: {d.fileName}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(0,217,255,0.3)', borderRadius: '16px', padding: '30px', width: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#00d9ff' }}>📤 Upload 2D Design Plan</h2>
            <p style={{ margin: '0 0 20px 0', opacity: 0.6, fontSize: '0.9rem' }}>
              Project: <strong style={{ color: 'white' }}>{selectedProject.title}</strong> &nbsp;—&nbsp;
              Client: <strong style={{ color: 'white' }}>{selectedProject.customer?.fullName}</strong>
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Plan Title *</label>
              <input
                type="text"
                placeholder="e.g. Ground Floor Layout v1"
                value={uploadForm.title}
                onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Description (Optional)</label>
              <textarea
                placeholder="Brief notes about this plan..."
                value={uploadForm.description}
                onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* File Drop Zone */}
            <div
              onClick={() => fileInputRef.current.click()}
              style={{
                border: '2px dashed rgba(0,217,255,0.4)', borderRadius: '10px', padding: '30px',
                textAlign: 'center', cursor: 'pointer', marginBottom: '20px',
                background: selectedFile ? 'rgba(0,217,255,0.05)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              {selectedFile ? (
                filePreview?.type?.includes('pdf') ? (
                  <div>
                    <span style={{ fontSize: '3rem', display: 'block' }}>📄</span>
                    <p style={{ color: '#00d9ff', margin: '10px 0 0' }}>{selectedFile.name}</p>
                    <p style={{ opacity: 0.5, fontSize: '0.8rem', margin: '4px 0 0' }}>Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <img src={filePreview?.url} alt="preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }} />
                    <p style={{ opacity: 0.5, fontSize: '0.8rem', margin: '8px 0 0' }}>Click to change file</p>
                  </div>
                )
              ) : (
                <>
                  <span style={{ fontSize: '2.5rem', display: 'block' }}>🖼️</span>
                  <p style={{ margin: '10px 0 0', color: '#00d9ff' }}>Click to upload 2D Blueprint</p>
                  <p style={{ opacity: 0.5, fontSize: '0.8rem', margin: '5px 0 0' }}>PNG, JPG, or PDF — Max 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ padding: '10px 24px', background: uploading ? '#333' : 'linear-gradient(135deg, #00d9ff, #00c4e6)', color: '#000', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {uploading ? 'Uploading...' : '📤 Deliver to Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workstation;
