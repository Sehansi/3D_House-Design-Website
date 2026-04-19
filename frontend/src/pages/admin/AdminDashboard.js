import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Architect.css';
import { User, Ruler, HardHat, Shield, Mail, Phone, MapPin, FileText, Palette, Clock, DollarSign, CheckSquare, XCircle, PauseCircle, Play, Trash2, CheckCircle, X } from 'lucide-react';

const API = 'http://localhost:5000';

const ROLE_CONFIG = {
  Customer:    { color: '#00d9ff', bg: 'linear-gradient(135deg, #00d9ff22, #00d9ff05)', icon: <User size={20} />,     label: 'Customers',     desc: 'Standard platform users' },
  Architect:   { color: '#a78bfa', bg: 'linear-gradient(135deg, #a78bfa22, #a78bfa05)', icon: <Ruler size={20} />,     label: 'Architects',    desc: 'Professional 2D Designers' },
  Constructor: { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b22, #f59e0b05)', icon: <HardHat size={20} />,  label: 'Constructors',  desc: 'Build Service Providers' },
  Admin:       { color: '#ff4444', bg: 'linear-gradient(135deg, #ff444422, #ff444405)', icon: <Shield size={20} />,   label: 'Admins',        desc: 'System Administrators' },
};

function AdminDashboard() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const PATH_TO_ROLE = { architects: 'Architect', constructors: 'Constructor', admins: 'Admin' };
  const pathSegment = location.pathname.split('/')[2];
  const activeRole  = PATH_TO_ROLE[pathSegment] || 'Customer';

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [viewUser, setViewUser]     = useState(null);

  useEffect(() => { fetchUsers(); }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setAllUsers(data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API}/api/admin/user/${userId}/role`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) { fetchUsers(); if (viewUser?._id === userId) setViewUser(prev => ({ ...prev, role: newRole })); }
      else { const d = await res.json(); alert('Error: ' + d.error); }
    } catch { alert('Update failed.'); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete "${name}"? This action is irreversible.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/user/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { fetchUsers(); if (viewUser?._id === userId) setViewUser(null); }
    } catch { alert('Delete failed.'); }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API}/api/admin/user/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { fetchUsers(); if (viewUser?._id === userId) setViewUser(prev => ({ ...prev, status: newStatus })); }
      else { const d = await res.json(); alert('Error: ' + d.error); }
    } catch { alert('Update failed.'); }
    finally { setUpdatingId(null); }
  };

  const handleApprovalToggle = async (userId, currentApproval) => {
    const newApproval = !currentApproval;
    const action = newApproval ? 'Approve' : 'Revoke approval for';
    if (!window.confirm(`${action} this user?`)) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`${API}/api/admin/user/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: newApproval })
      });
      if (res.ok) { fetchUsers(); if (viewUser?._id === userId) setViewUser(prev => ({ ...prev, isApproved: newApproval })); }
      else { const d = await res.json(); alert('Error: ' + d.error); }
    } catch { alert('Update failed.'); }
    finally { setUpdatingId(null); }
  };

  const setTab = (role) => {
    const map = { Customer: '/admin', Architect: '/admin/architects', Constructor: '/admin/constructors', Admin: '/admin/admins' };
    navigate(map[role]);
    setSearch('');
  };

  const roleUsers  = allUsers.filter(u => u.role === activeRole);
  const filtered   = roleUsers.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  
  const counts = {};
  Object.keys(ROLE_CONFIG).forEach(r => { counts[r] = allUsers.filter(u => u.role === r).length; });
  const cfg = ROLE_CONFIG[activeRole];

  return (
    <>
      <style>{`
        .admin-hero {
          position: relative;
          padding: 60px 40px;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(13, 16, 53, 0.9), rgba(5, 5, 20, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);
          margin-bottom: 40px;
        }
        .admin-hero::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle at 50% 50%, ${cfg.color}15 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          transition: background 0.8s ease;
        }
        .admin-hero-content {
          position: relative;
          z-index: 1;
        }
        .admin-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 10px;
          background: linear-gradient(to right, #fff, ${cfg.color});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }
        .admin-stat-card {
          padding: 24px;
          border-radius: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .admin-stat-card:hover {
          transform: translateY(-8px);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }
        .admin-stat-card.active {
          border-color: ${cfg.color}55;
          background: ${cfg.bg};
          box-shadow: 0 10px 40px ${cfg.color}22;
        }
        .admin-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 15px;
          background: rgba(255,255,255,0.05);
        }
        .user-card-modern {
          background: rgba(13, 16, 53, 0.6);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .user-card-modern:hover {
          transform: translateY(-5px);
          border-color: ${cfg.color}55;
          box-shadow: 0 15px 35px rgba(0,0,0,0.3), 0 0 20px ${cfg.color}15;
        }
        .user-card-modern::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, ${cfg.color}, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .user-card-modern:hover::before {
          opacity: 1;
        }
        .search-input-modern {
          width: 320px;
          padding: 14px 20px 14px 45px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ffffff88' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 16px center;
        }
        .search-input-modern:focus {
          border-color: ${cfg.color};
          background-color: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 4px ${cfg.color}22;
          outline: none;
        }
        .pill-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(12px);
          display: flex; justify-content: center; alignItems: center;
          z-index: 9999; padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        .modal-content-modern {
          background: linear-gradient(180deg, #0d1035, #0a0c27);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          width: 540px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-header-hero {
          padding: 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          background: ${cfg.bg};
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .modal-avatar {
          width: 90px; height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${cfg.color}, ${cfg.color}88);
          margin: 0 auto 15px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; font-weight: 900; color: white;
          box-shadow: 0 15px 30px ${cfg.color}44, inset 0 0 0 4px rgba(255,255,255,0.2);
        }
        .btn-modern {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 0.9rem;
        }
        .btn-modern:active { transform: scale(0.96); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* ── Hero Header ── */}
        <div className="admin-hero">
          <div className="admin-hero-content">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '15px', color: 'rgba(255,255,255,0.8)' }}>
              <Shield size={14} /> SYSTEM CONTROL
            </span>
            <h1 className="admin-title">Role Management</h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
              Oversee users, verify professional credentials, and manage platform access from a centralized command center.
            </p>
          </div>
        </div>

        {/* ── Stats / Role Navigation ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {Object.entries(ROLE_CONFIG).map(([role, c]) => (
            <div key={role} className={`admin-stat-card ${activeRole === role ? 'active' : ''}`} onClick={() => setTab(role)}>
              <div className="admin-stat-icon" style={{ color: c.color }}>{c.icon}</div>
              <h2 style={{ fontSize: '2.2rem', margin: '0 0 5px', fontWeight: 900 }}>{loading ? '…' : counts[role]}</h2>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>{c.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Action Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              {cfg.icon}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{cfg.label} Directory</h2>
          </div>
          <input
            type="text"
            className="search-input-modern"
            placeholder={`Search ${cfg.label.toLowerCase()} by name or email...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Users Grid ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ width: '50px', height: '50px', border: `3px solid ${cfg.color}33`, borderTopColor: cfg.color, borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '1px' }}>SYNCING SECURE DATA...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '4rem', filter: 'grayscale(1) opacity(0.2)' }}>{cfg.icon}</span>
            <h3 style={{ margin: '20px 0 10px', fontSize: '1.4rem' }}>No {cfg.label} matches</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Try adjusting your search query or registering new users.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map((u, i) => (
              <div key={u._id} className="user-card-modern" onClick={() => setViewUser(u)} style={{ animation: `slideUp 0.4s ${i * 0.05}s both` }}>
                
                {/* Header Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: 'white', boxShadow: `0 8px 20px ${cfg.color}33` }}>
                      {u.fullName?.charAt(0).toUpperCase()}
                    </div>
                    {u.status === 'Suspended' && (
                      <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#ff4444', width: '16px', height: '16px', borderRadius: '50%', border: '3px solid #0d1035' }} title="Suspended" />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 2px', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.fullName}</h3>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                  </div>
                </div>

                {/* Badges Container */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '28px' }}>
                  {(activeRole === 'Architect' || activeRole === 'Constructor') && (
                    <span className="pill-badge" style={{ background: u.isApproved ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', color: u.isApproved ? '#00ff88' : '#ff4444', border: `1px solid ${u.isApproved ? '#00ff8844' : '#ff444444'}` }}>
                      {u.isApproved ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  )}
                  {activeRole === 'Architect' && u.architectProfile?.specialization && (
                    <span className="pill-badge" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                      {u.architectProfile.specialization}
                    </span>
                  )}
                  {activeRole === 'Customer' && (
                    <span className="pill-badge" style={{ background: 'rgba(0,217,255,0.1)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
                      Standard Client
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                  <span style={{ fontSize: '0.85rem', color: cfg.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>Manage <span>→</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── User Detail Modal ── */}
      {viewUser && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewUser(null); }}>
          <div className="modal-content-modern" style={{ borderColor: `${ROLE_CONFIG[viewUser.role]?.color}55` }}>
            
            <div className="modal-header-hero">
              <button onClick={() => setViewUser(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              
              <div className="modal-avatar">{viewUser.fullName?.charAt(0).toUpperCase()}</div>
              <h2 style={{ margin: '0 0 5px', fontSize: '1.8rem' }}>{viewUser.fullName}</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', mt: '10px' }}>
                <span className="pill-badge" style={{ background: ROLE_CONFIG[viewUser.role]?.bg, color: ROLE_CONFIG[viewUser.role]?.color, border: `1px solid ${ROLE_CONFIG[viewUser.role]?.color}55` }}>
                  {ROLE_CONFIG[viewUser.role]?.icon} {viewUser.role}
                </span>
                {viewUser.status === 'Suspended' && <span className="pill-badge" style={{ background: '#ff444422', color: '#ff4444', border: '1px solid #ff444455' }}>🚫 Suspended</span>}
              </div>
            </div>

            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <ModernInfoRow icon={<Mail size={16} />}     label="Email Address" val={viewUser.email} />
                <ModernInfoRow icon={<Phone size={16} />}     label="Phone Number"  val={viewUser.phoneNumber || 'Not provided'} />
                <ModernInfoRow icon={<MapPin size={16} />}    label="Location"      val={viewUser.address || 'Not provided'} />
                {viewUser.bio && <ModernInfoRow icon={<FileText size={16} />} label="Biography" val={viewUser.bio} />}
              </div>

              {/* Architect Specific Info */}
              {viewUser.role === 'Architect' && viewUser.architectProfile && (
                <div style={{ padding: '24px', background: 'rgba(167,139,250,0.05)', borderRadius: '16px', border: '1px solid rgba(167,139,250,0.15)', marginBottom: '30px' }}>
                  <h4 style={{ margin: '0 0 20px', color: '#a78bfa', fontSize: '0.9rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}><Ruler size={14} /> ARCHITECT PROFILE</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {viewUser.architectProfile.specialization && <ModernInfoRow mini icon={<Palette size={14} />}       label="Specialization" val={viewUser.architectProfile.specialization} />}
                    {viewUser.architectProfile.experience && <ModernInfoRow mini icon={<Clock size={14} />}         label="Experience" val={`${viewUser.architectProfile.experience} Years`} />}
                    {viewUser.architectProfile.hourlyRate && <ModernInfoRow mini icon={<DollarSign size={14} />}    label="Hourly Rate" val={`$${viewUser.architectProfile.hourlyRate}/hr`} />}
                    <ModernInfoRow mini icon={<CheckCircle size={14} />} label="Availability" val={viewUser.architectProfile.availability ? 'Available' : 'Busy'} />
                  </div>
                  {viewUser.architectProfile.description && (
                    <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '15px' }}>
                      <p style={{ margin: '0 0 5px', fontSize: '0.75rem', color: '#a78bfa', fontWeight: 'bold' }}>ABOUT STUDIO/PRACTICE</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{viewUser.architectProfile.description}</p>
                    </div>
                  )}
                  {viewUser.architectProfile.projects?.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#a78bfa', fontWeight: 'bold' }}>PORTFOLIO PROJECTS ({viewUser.architectProfile.projects.length})</p>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {viewUser.architectProfile.projects.map((p, i) => (
                          <div key={i} style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                            <p style={{ margin: 0, fontWeight: 700, color: 'white' }}>{p.title}</p>
                            {p.description && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{p.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Actions */}
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', letterSpacing: '1px' }}>SECURITY & ACCESS CONTROLS</h4>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                  
                  {/* Approval Toggle */}
                  {(viewUser.role === 'Architect' || viewUser.role === 'Constructor') && (
                    <button onClick={() => handleApprovalToggle(viewUser._id, viewUser.isApproved)} disabled={updatingId === viewUser._id}
                      className="btn-modern" style={{ width: '100%', background: viewUser.isApproved ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,136,0.1)', color: viewUser.isApproved ? '#ff4444' : '#00ff88', border: `1px solid ${viewUser.isApproved ? '#ff444444' : '#00ff8844'}` }}>
                      {viewUser.isApproved ? <><XCircle size={16} /> Revoke Professional Verification</> : <><CheckSquare size={16} /> Verify & Approve Profile</>}
                    </button>
                  )}

                  {/* Status & Delete Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button onClick={() => handleStatusToggle(viewUser._id, viewUser.status)} disabled={updatingId === viewUser._id}
                      className="btn-modern" style={{ background: viewUser.status === 'Active' ? 'rgba(255,165,0,0.1)' : 'rgba(0,255,136,0.1)', color: viewUser.status === 'Active' ? '#ffa500' : '#00ff88', border: `1px solid ${viewUser.status === 'Active' ? '#ffa50044' : '#00ff8844'}` }}>
                      {viewUser.status === 'Active' ? <><PauseCircle size={16} /> Suspend Auth</> : <><Play size={16} /> Activate Auth</>}
                    </button>
                    
                    <button onClick={() => handleDelete(viewUser._id, viewUser.fullName)}
                      className="btn-modern" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                      <Trash2 size={16} /> Terminate Entity
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ModernInfoRow({ icon, label, val, mini }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: mini ? '12px' : '16px', padding: mini ? '10px 14px' : '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ width: mini ? '32px' : '38px', height: mini ? '32px' : '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mini ? '1rem' : '1.2rem', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.5px' }}>{label.toUpperCase()}</p>
        <p style={{ margin: 0, color: 'white', fontWeight: 500, fontSize: mini ? '0.85rem' : '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
