import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Architect.css';
import { Inbox, DollarSign, CheckSquare, ClipboardList, HardHat, Inbox as InboxEmpty, FileText, Package, Edit, Clock, Phone, Mail, MapPin, FileText as FileNote, Lightbulb, X } from 'lucide-react';

const API = 'http://localhost:5000';

const STATUS_META = {
  Pending:  { color: '#00d9ff',  bg: 'rgba(0,217,255,0.1)',   label: 'Pending' },
  Viewed:   { color: '#a78bfa',  bg: 'rgba(167,139,250,0.1)', label: 'Viewed' },
  Quoted:   { color: '#fbbf24',  bg: 'rgba(251,191,36,0.1)',  label: 'Quoted' },
  Accepted: { color: '#00ff88',  bg: 'rgba(0,255,136,0.1)',   label: 'Accepted' },
  Rejected: { color: '#ff4444',  bg: 'rgba(255,68,68,0.1)',   label: 'Rejected' }
};

function ConstructorDashboard() {
  const { token, user } = useAuth();
  const location = useLocation();
  
  // Derive active tab from URL
  const activeTab = location.pathname.includes('/accepted')
    ? 'accepted'
    : location.pathname.includes('/profile')
    ? 'profile'
    : 'requests';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [quotingReq, setQuotingReq] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', currency: 'LKR', timeline: '', notes: '' });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => { fetchRequests(); }, [token]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/constructor-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data.requests || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitQuote = async () => {
    if (!quoteForm.amount.trim()) { alert('Please enter an amount.'); return; }
    setSubmittingQuote(true);
    try {
      const res = await fetch(`${API}/api/constructor-requests/${quotingReq._id}/quote`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteForm)
      });
      if (res.ok) {
        setQuotingReq(null);
        setQuoteForm({ amount: '', currency: 'LKR', timeline: '', notes: '' });
        fetchRequests();
      } else {
        const d = await res.json();
        alert('Error: ' + d.error);
      }
    } catch { alert('Failed.'); }
    finally { setSubmittingQuote(false); }
  };

  const pending  = requests.filter(r => r.status === 'Pending').length;
  const quoted   = requests.filter(r => r.status === 'Quoted').length;
  const accepted = requests.filter(r => r.status === 'Accepted').length;
  const total    = requests.length;

  return (
    <div className="architect-dashboard-container">
      {/* ── Header ── */}
      <div className="architect-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><HardHat size={28} /> Constructor Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '5px 0 0', fontSize: '1rem' }}>
            Welcome, <strong style={{ color: 'white' }}>{user?.fullName}</strong>
          </p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="architect-grid" style={{ marginBottom: '30px' }}>
        {[
          { icon: <Inbox size={22} />,        val: pending,  label: 'New Requests',     color: '#00d9ff' },
          { icon: <DollarSign size={22} />,   val: quoted,   label: 'Quotes Sent',      color: '#fbbf24' },
          { icon: <CheckSquare size={22} />,  val: accepted, label: 'Accepted',         color: '#00ff88' },
          { icon: <ClipboardList size={22} />,val: total,    label: 'Total Projects',   color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="architect-glass-panel stat-card">
            <div className="stat-icon" style={{ background: s.color + '18', color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-details">
              <h3 style={{ color: s.color }}>{loading ? '…' : s.val}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {activeTab === 'requests' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading requests...</p>
          ) : requests.filter(r => r.status !== 'Accepted').length === 0 ? (
            <div className="architect-glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
              <span style={{ display: 'block', marginBottom: '15px', opacity: 0.3 }}><InboxEmpty size={64} strokeWidth={1} /></span>
              <h3>No Pending Requests</h3>
              <p style={{ opacity: 0.5 }}>Client plan submissions will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {requests.filter(r => r.status !== 'Accepted').map(r => {
                const sm = STATUS_META[r.status] || STATUS_META.Pending;
                return (
                  <div key={r._id} className="architect-glass-panel"
                    style={{ borderLeft: `4px solid ${sm.color}`, padding: '25px' }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px' }}>{r.projectTitle}</h3>
                        <p style={{ margin: 0, opacity: 0.5, fontSize: '0.85rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {r.customer?.fullName}</span> &nbsp;|&nbsp;
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {r.customer?.email}</span> &nbsp;|&nbsp;
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(r.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <span style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: sm.bg, color: sm.color, border: `1px solid ${sm.color}44`, alignSelf: 'flex-start' }}>
                        {sm.label}
                      </span>
                    </div>

                    {r.description && <p style={{ margin: '0 0 15px', opacity: 0.7 }}>{r.description}</p>}

                    {/* Plan files */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {r.plan2DPath && (
                        <div>
                          <p style={{ margin: '0 0 6px', opacity: 0.4, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>2D PLAN</p>
                          {r.plan2DType === 'image' ? (
                            <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer">
                              <img src={`${API}${r.plan2DPath}`} alt="2D" style={{ height: '130px', borderRadius: '8px', border: '1px solid rgba(0,217,255,0.3)', cursor: 'zoom-in', objectFit: 'cover' }} />
                            </a>
                          ) : (
                            <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00d9ff', padding: '10px 15px', background: 'rgba(0,217,255,0.08)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                              <FileText size={16} /> View 2D PDF
                            </a>
                          )}
                        </div>
                      )}
                      {r.plan3DPath && (
                        <div>
                          <p style={{ margin: '0 0 6px', opacity: 0.4, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>3D MODEL</p>
                          <a href={`${API}${r.plan3DPath}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', padding: '10px 15px', background: 'rgba(167,139,250,0.08)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                            <Package size={16} /> {r.plan3DName || 'View 3D File'}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Existing quote badge */}
                    {r.quotation?.amount && (
                      <div style={{ padding: '12px 16px', background: 'rgba(251,191,36,0.08)', borderRadius: '8px', borderLeft: '3px solid #fbbf24', marginBottom: '15px', fontSize: '0.9rem' }}>
                        <strong style={{ color: '#fbbf24' }}>Quote Sent:</strong> {r.quotation.currency} {r.quotation.amount}
                        {r.quotation.timeline && <span style={{ opacity: 0.7 }}> &nbsp;•&nbsp; <Clock size={12} style={{ verticalAlign: 'middle' }} /> {r.quotation.timeline}</span>}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {(r.status === 'Pending' || r.status === 'Viewed') && (
                        <button onClick={() => { setQuotingReq(r); setQuoteForm({ amount: '', currency: 'LKR', timeline: '', notes: '' }); }}
                          style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DollarSign size={16} /> Send Quotation
                        </button>
                      )}
                      {r.status === 'Quoted' && (
                        <button onClick={() => { setQuotingReq(r); setQuoteForm({ amount: r.quotation.amount, currency: r.quotation.currency, timeline: r.quotation.timeline, notes: r.quotation.notes }); }}
                          style={{ padding: '10px 22px', background: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Edit size={15} /> Update Quote
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ACCEPTED PROJECTS TAB ── */}
      {activeTab === 'accepted' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {requests.filter(r => r.status === 'Accepted').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <span style={{ display: 'block', marginBottom: '15px', opacity: 0.3 }}><HardHat size={64} strokeWidth={1} /></span>
              <h3>No Accepted Projects Yet</h3>
              <p style={{ opacity: 0.5 }}>Projects clients accept will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {requests.filter(r => r.status === 'Accepted').map(r => (
                <div key={r._id} className="architect-glass-panel" style={{ borderLeft: '4px solid #00ff88', padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>{r.projectTitle}</h3>
                    <span style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>✅ Accepted</span>
                  </div>
                  <p style={{ margin: '0 0 10px', opacity: 0.5, fontSize: '0.85rem' }}>
                    Client: <strong style={{ color: 'white' }}>{r.customer?.fullName}</strong> &nbsp;|&nbsp; {r.customer?.email}
                  </p>
                  <div style={{ padding: '15px', background: 'rgba(0,255,136,0.05)', borderRadius: '10px', marginTop: '10px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#00ff88' }}>Agreed Quote</p>
                    <p style={{ margin: '5px 0 0', fontSize: '1.2rem' }}>{r.quotation.currency} {r.quotation.amount}</p>
                    {r.quotation.timeline && <p style={{ margin: '4px 0 0', opacity: 0.6 }}><Clock size={14} style={{ verticalAlign: 'middle' }} /> {r.quotation.timeline}</p>}
                    {r.quotation.notes && <p style={{ margin: '8px 0 0', opacity: 0.6, fontStyle: 'italic' }}>"{r.quotation.notes}"</p>}
                  </div>
                  <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} /> <strong>Next Step:</strong> Contact <strong>{r.customer?.fullName}</strong> to schedule the site visit and begin construction.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="architect-glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: 'white', flexShrink: 0 }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{user?.fullName}</h2>
                <p style={{ margin: '0 0 20px', opacity: 0.5, fontSize: '0.9rem' }}>
                Constructor Role
              </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Email', val: user?.email },
                { label: 'Phone', val: user?.phoneNumber || 'Not set' },
                { label: 'Location', val: user?.address || 'Not set' },
                { label: 'Bio', val: user?.bio || 'No bio added' }
              ].map(item => (
                <div key={item.label} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <span style={{ opacity: 0.5, fontSize: '0.82rem', display: 'block', marginBottom: '4px' }}>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(245,158,11,0.08)', borderRadius: '10px', fontSize: '0.9rem', opacity: 0.7, borderLeft: '3px solid #f59e0b', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Lightbulb size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> To update your profile details (name, phone, address, bio), go to the main Profile page.
              </div>
          </div>
        </div>
      )}

      {/* ── Quote Modal ── */}
      {quotingReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '16px', padding: '30px', width: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 5px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '10px' }}><DollarSign size={22} /> Submit Quotation</h2>
            <p style={{ margin: '0 0 20px', opacity: 0.5, fontSize: '0.9rem' }}>
              Project: <strong style={{ color: 'white' }}>{quotingReq.projectTitle}</strong><br />
              Client: <strong style={{ color: 'white' }}>{quotingReq.customer?.fullName}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Amount *</label>
                <input type="number" placeholder="e.g. 5500000" value={quoteForm.amount}
                  onChange={e => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Currency</label>
                <select value={quoteForm.currency} onChange={e => setQuoteForm({ ...quoteForm, currency: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0d1035', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }}>
                  {['LKR', 'USD', 'EUR', 'GBP', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Estimated Timeline</label>
              <input type="text" placeholder="e.g. 8 months" value={quoteForm.timeline}
                onChange={e => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', opacity: 0.8 }}>Notes / Cost Breakdown</label>
              <textarea rows={4} placeholder="Materials, labour, phase-wise breakdown..." value={quoteForm.notes}
                onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setQuotingReq(null)}
                style={{ padding: '10px 20px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmitQuote} disabled={submittingQuote}
                style={{ padding: '10px 26px', background: submittingQuote ? '#333' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: submittingQuote ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                {submittingQuote ? 'Sending...' : <><DollarSign size={16} /> Send Quote to Client</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConstructorDashboard;
