import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Profile.css';

const API = 'http://localhost:5000';

const STATUS_META = {
  Pending:  { color: '#00d9ff', label: 'Pending Review' },
  Viewed:   { color: '#a78bfa', label: 'Viewed' },
  Quoted:   { color: '#fbbf24', label: 'Quoted' },
  Accepted: { color: '#00ff88', label: 'Accepted' },
  Rejected: { color: '#ff4444', label: 'Rejected' }
};

function Constructors() {
  const { token } = useAuth();
  const [constructors, setConstructors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // browse | my-requests
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedConstructor, setSelectedConstructor] = useState(null);
  const [form, setForm] = useState({ projectTitle: '', description: '' });
  const [file2D, setFile2D] = useState(null);
  const [file3D, setFile3D] = useState(null);
  const [preview2D, setPreview2D] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef2D = useRef();
  const fileRef3D = useRef();
  const [quoteAction, setQuoteAction] = useState(null);
  const [viewingConstructor, setViewingConstructor] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, rRes] = await Promise.all([
        fetch(`${API}/api/constructor-requests/constructors`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/constructor-requests/my-requests`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const cData = await cRes.json();
      const rData = await rRes.json();
      if (cRes.ok) setConstructors(cData.constructors || []);
      if (rRes.ok) setRequests(rData.requests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === '2D') {
      setFile2D(file);
      if (file.type.includes('image')) {
        const reader = new FileReader();
        reader.onload = ev => setPreview2D(ev.target.result);
        reader.readAsDataURL(file);
      } else { setPreview2D(null); }
    } else {
      setFile3D(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.projectTitle.trim()) { alert('Please enter a project title.'); return; }
    if (!file2D) { alert('Please upload a 2D plan.'); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('constructorId', selectedConstructor._id);
    fd.append('projectTitle', form.projectTitle);
    fd.append('description', form.description);
    fd.append('plan2D', file2D);
    if (file3D) fd.append('plan3D', file3D);

    try {
      const res = await fetch(`${API}/api/constructor-requests/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        alert('Plans submitted to constructor!');
        closeModal();
        setActiveTab('my-requests');
        fetchAll();
      } else {
        const d = await res.json();
        alert('Error: ' + d.error);
      }
    } catch { alert('Submission failed.'); }
    finally { setSubmitting(false); }
  };

  const handleQuoteAction = async (requestId, status) => {
    try {
      const res = await fetch(`${API}/api/constructor-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) { fetchAll(); setQuoteAction(null); }
    } catch { alert('Action failed.'); }
  };

  const openModal = (c) => { setSelectedConstructor(c); setShowModal(true); };
  const closeModal = () => {
    setShowModal(false); setSelectedConstructor(null);
    setForm({ projectTitle: '', description: '' });
    setFile2D(null); setFile3D(null); setPreview2D(null);
  };

  return (
    <div className="profile-container">
      <div className="profile-hero" style={{ minHeight: '120px' }}>
        <div className="profile-hero-content">
          <div className="profile-header-info">
            <h1>🏗️ Find a Constructor</h1>
            <p style={{ opacity: 0.7 }}>Browse contractors and submit your design plans to get a free quotation.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
        {/* Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '30px' }}>
          <span className={`tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
            🔍 Browse Constructors ({constructors.length})
          </span>
          <span className={`tab ${activeTab === 'my-requests' ? 'active' : ''}`} onClick={() => setActiveTab('my-requests')}>
            📋 My Requests ({requests.length})
          </span>
        </div>

        {/* BROWSE TAB */}
        {activeTab === 'browse' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {loading ? <p>Loading constructors...</p> : constructors.length === 0 ? (
              <div className="empty-state glass-card">
                <div className="empty-icon">🏗️</div>
                <h3>No Constructors Yet</h3>
                <p>Constructors will be listed here once they register.</p>
              </div>
            ) : constructors.map(c => (
              <div key={c._id} className="design-card" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
                    {c.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{c.fullName}</h3>
                    <p style={{ margin: '2px 0 0', opacity: 0.5, fontSize: '0.85rem' }}>{c.email}</p>
                  </div>
                </div>
                {c.phoneNumber && <p style={{ margin: '0 0 8px', opacity: 0.6, fontSize: '0.85rem' }}>📞 {c.phoneNumber}</p>}
                {c.address && <p style={{ margin: '0 0 8px', opacity: 0.6, fontSize: '0.85rem' }}>📍 {c.address}</p>}
                {c.bio && <p style={{ margin: '0 0 15px', opacity: 0.7, fontSize: '0.9rem', fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{c.bio}"</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setViewingConstructor(c)}
                    style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
                  >
                    👁️ Profile
                  </button>
                  <button
                    onClick={() => openModal(c)}
                    style={{ flex: 2, padding: '9px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.88rem' }}
                  >
                    📤 Request Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MY REQUESTS TAB */}
        {activeTab === 'my-requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {requests.length === 0 ? (
              <div className="empty-state glass-card">
                <div className="empty-icon">📋</div>
                <h3>No Requests Sent</h3>
                <p>Go to "Browse Constructors" and send your plans to get a quotation.</p>
              </div>
            ) : requests.map(r => {
              const sm = STATUS_META[r.status] || STATUS_META.Pending;
              return (
                <div key={r._id} className="design-card" style={{ padding: '25px', borderLeft: `4px solid ${sm.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>{r.projectTitle}</h3>
                    <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: sm.color + '22', color: sm.color, border: `1px solid ${sm.color}44` }}>{sm.label}</span>
                  </div>
                  <p style={{ margin: '0 0 5px', opacity: 0.6, fontSize: '0.85rem' }}>Constructor: <strong style={{ color: 'white' }}>{r.constructor?.fullName}</strong></p>
                  <p style={{ margin: '0 0 12px', opacity: 0.5, fontSize: '0.8rem' }}>Submitted: {new Date(r.createdAt).toLocaleDateString()}</p>
                  {r.description && <p style={{ margin: '0 0 12px', opacity: 0.7 }}>{r.description}</p>}

                  {/* Files */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    {r.plan2DPath && (
                      r.plan2DType === 'image' ? (
                        <img src={`${API}${r.plan2DPath}`} alt="2D Plan" style={{ height: '100px', borderRadius: '6px', border: '1px solid rgba(0,217,255,0.3)' }} />
                      ) : (
                        <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer" style={{ color: '#00d9ff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>📄 2D Plan PDF</a>
                      )
                    )}
                    {r.plan3DPath && (
                      <a href={`${API}${r.plan3DPath}`} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>📦 3D Plan File</a>
                    )}
                  </div>

                  {/* Quotation card */}
                  {r.status === 'Quoted' && r.quotation?.amount && (
                    <div style={{ padding: '18px', background: 'rgba(251,191,36,0.08)', borderRadius: '10px', borderLeft: '3px solid #fbbf24', marginBottom: '15px' }}>
                      <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#fbbf24' }}>💰 Quotation Received</p>
                      <p style={{ margin: '4px 0', fontSize: '1.1rem' }}><strong>{r.quotation.currency} {r.quotation.amount}</strong></p>
                      {r.quotation.timeline && <p style={{ margin: '4px 0', opacity: 0.7, fontSize: '0.9rem' }}>⏱️ Timeline: {r.quotation.timeline}</p>}
                      {r.quotation.notes && <p style={{ margin: '8px 0 0', fontStyle: 'italic', opacity: 0.7 }}>"{r.quotation.notes}"</p>}

                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button onClick={() => handleQuoteAction(r._id, 'Accepted')} style={{ padding: '8px 20px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Accept Quote</button>
                        <button onClick={() => handleQuoteAction(r._id, 'Rejected')} style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '6px', cursor: 'pointer' }}>❌ Decline</button>
                      </div>
                    </div>
                  )}

                  {r.status === 'Accepted' && (
                    <div style={{ padding: '12px', background: 'rgba(0,255,136,0.08)', borderRadius: '8px', borderLeft: '3px solid #00ff88' }}>
                      <p style={{ margin: 0, color: '#00ff88', fontWeight: 'bold' }}>✅ You accepted this quotation. The constructor will be in touch soon.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Plans Modal */}
      {showModal && selectedConstructor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '30px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 5px', color: '#f59e0b' }}>📤 Submit Plans for Quotation</h2>
            <p style={{ margin: '0 0 20px', opacity: 0.5, fontSize: '0.9rem' }}>To: <strong style={{ color: 'white' }}>{selectedConstructor.fullName}</strong></p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Project Title *</label>
              <input type="text" placeholder="e.g. 3-Bedroom House Construction" value={form.projectTitle}
                onChange={e => setForm({ ...form, projectTitle: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Description (Optional)</label>
              <textarea rows={3} placeholder="Brief notes about your project..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* 2D Plan */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>2D Floor Plan * (PNG, JPG, PDF)</label>
              <div onClick={() => fileRef2D.current.click()} style={{ border: '2px dashed rgba(245,158,11,0.4)', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: file2D ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                {file2D ? (
                  preview2D ? <img src={preview2D} alt="preview" style={{ maxHeight: '150px', borderRadius: '6px' }} /> : <span style={{ color: '#f59e0b' }}>📄 {file2D.name}</span>
                ) : (
                  <><span style={{ fontSize: '2rem', display: 'block' }}>🗺️</span><p style={{ margin: '8px 0 0', color: '#f59e0b' }}>Click to upload 2D Plan</p></>
                )}
              </div>
              <input ref={fileRef2D} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileChange(e, '2D')} />
            </div>

            {/* 3D Plan */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', opacity: 0.8 }}>3D Plan / Model (Optional — PNG, PDF, OBJ, GLB)</label>
              <div onClick={() => fileRef3D.current.click()} style={{ border: '2px dashed rgba(167,139,250,0.3)', borderRadius: '10px', padding: '15px', textAlign: 'center', cursor: 'pointer', background: file3D ? 'rgba(167,139,250,0.05)' : 'transparent' }}>
                {file3D ? <span style={{ color: '#a78bfa' }}>📦 {file3D.name}</span> : <><span style={{ fontSize: '1.5rem', display: 'block' }}>📦</span><p style={{ margin: '4px 0 0', color: '#a78bfa', fontSize: '0.9rem' }}>Click to upload 3D Model (optional)</p></>}
              </div>
              <input ref={fileRef3D} type="file" accept="image/*,.pdf,.obj,.glb,.gltf" style={{ display: 'none' }} onChange={e => handleFileChange(e, '3D')} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ padding: '10px 24px', background: submitting ? '#333' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {submitting ? 'Submitting...' : '📤 Send to Constructor'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Constructor Profile View Modal */}
      {viewingConstructor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '18px', padding: '32px', width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: '0 0 25px rgba(245,158,11,0.3)' }}>
                {viewingConstructor.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: '0 0 6px' }}>{viewingConstructor.fullName}</h2>
                <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                  🏗️ Constructor
                </span>
              </div>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              {[
                { icon: '📧', label: 'Email',    val: viewingConstructor.email },
                { icon: '📞', label: 'Phone',    val: viewingConstructor.phoneNumber || 'Not provided' },
                { icon: '📍', label: 'Location', val: viewingConstructor.address || 'Not provided' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '12px', padding: '12px 15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', alignItems: 'flex-start' }}>
                  <span style={{ opacity: 0.5, minWidth: '20px' }}>{item.icon}</span>
                  <div>
                    <span style={{ opacity: 0.4, fontSize: '0.72rem', display: 'block', marginBottom: '2px', letterSpacing: '1px' }}>{item.label.toUpperCase()}</span>
                    <span style={{ opacity: item.val.includes('Not') ? 0.4 : 0.9 }}>{item.val}</span>
                  </div>
                </div>
              ))}
              {viewingConstructor.bio && (
                <div style={{ padding: '14px 15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <span style={{ opacity: 0.4, fontSize: '0.72rem', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>📝 ABOUT</span>
                  <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.8 }}>{viewingConstructor.bio}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setViewingConstructor(null)}
                style={{ flex: 1, padding: '11px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => { openModal(viewingConstructor); setViewingConstructor(null); }}
                style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                📤 Request Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Constructors;
