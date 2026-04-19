import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Architect.css';

const API = 'http://localhost:5000';

const STATUS_META = {
  Pending:  { color: '#00d9ff',  bg: 'rgba(0,217,255,0.08)',   label: 'Pending' },
  Viewed:   { color: '#a78bfa',  bg: 'rgba(167,139,250,0.08)', label: 'Viewed' },
  Quoted:   { color: '#fbbf24',  bg: 'rgba(251,191,36,0.08)',  label: 'Quoted' },
  Accepted: { color: '#00ff88',  bg: 'rgba(0,255,136,0.08)',   label: 'Accepted' },
  Rejected: { color: '#ff4444',  bg: 'rgba(255,68,68,0.08)',   label: 'Rejected' }
};

function ConstructorRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quotingReq, setQuotingReq] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', currency: 'LKR', timeline: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchRequests(); }, [token]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/constructor-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests((data.requests || []).filter(r => r.status !== 'Accepted' && r.status !== 'Rejected'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitQuote = async () => {
    if (!quoteForm.amount.trim()) { alert('Please enter an amount.'); return; }
    setSubmitting(true);
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
    finally { setSubmitting(false); }
  };

  return (
    <div className="architect-dashboard-container">
      <div className="architect-header">
        <div>
          <h1>📋 Client Requests</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '5px 0 0' }}>
            Review client submitted plans and send quotations.
          </p>
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.5 }}>
          {requests.length} active request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {loading ? (
          <div className="architect-glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>⏳</span>
            <p style={{ opacity: 0.5 }}>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="architect-glass-panel" style={{ textAlign: 'center', padding: '70px 40px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>📭</span>
            <h3>No Pending Requests</h3>
            <p style={{ opacity: 0.5 }}>Once customers submit their plans to you, they'll appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {requests.map(r => {
              const sm = STATUS_META[r.status] || STATUS_META.Pending;
              return (
                <div key={r._id} className="architect-glass-panel"
                  style={{ borderLeft: `4px solid ${sm.color}`, padding: '28px' }}>

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px' }}>{r.projectTitle}</h3>
                      <p style={{ margin: 0, opacity: 0.5, fontSize: '0.85rem' }}>
                        👤 <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{r.customer?.fullName}</strong>
                        &nbsp;•&nbsp; 📧 {r.customer?.email}
                        &nbsp;•&nbsp; 📅 {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '5px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                      background: sm.bg, color: sm.color, border: `1px solid ${sm.color}44`, alignSelf: 'flex-start'
                    }}>● {sm.label}</span>
                  </div>

                  {r.description && (
                    <p style={{ margin: '0 0 18px', opacity: 0.7, lineHeight: 1.6, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      {r.description}
                    </p>
                  )}

                  {/* Plans */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {r.plan2DPath && (
                      <div>
                        <p style={{ margin: '0 0 8px', opacity: 0.4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px' }}>2D FLOOR PLAN</p>
                        {r.plan2DType === 'image' ? (
                          <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer">
                            <img src={`${API}${r.plan2DPath}`} alt="2D Plan"
                              style={{ height: '150px', borderRadius: '10px', border: '1px solid rgba(0,217,255,0.3)', cursor: 'zoom-in', objectFit: 'cover', display: 'block' }} />
                          </a>
                        ) : (
                          <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00d9ff', padding: '10px 16px', background: 'rgba(0,217,255,0.08)', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(0,217,255,0.2)' }}>
                            📄 View 2D PDF Plan
                          </a>
                        )}
                      </div>
                    )}
                    {r.plan3DPath && (
                      <div>
                        <p style={{ margin: '0 0 8px', opacity: 0.4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px' }}>3D MODEL / PLAN</p>
                        <a href={`${API}${r.plan3DPath}`} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a78bfa', padding: '10px 16px', background: 'rgba(167,139,250,0.08)', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(167,139,250,0.2)' }}>
                          📦 {r.plan3DName || 'View 3D File'}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Existing quote */}
                  {r.quotation?.amount && (
                    <div style={{ padding: '14px 18px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', marginBottom: '18px' }}>
                      <p style={{ margin: '0 0 3px', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>QUOTE SENT</p>
                      <p style={{ margin: 0 }}>{r.quotation.currency} {Number(r.quotation.amount).toLocaleString()}
                        {r.quotation.timeline && <span style={{ opacity: 0.6 }}> &nbsp;•&nbsp; ⏱️ {r.quotation.timeline}</span>}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(r.status === 'Pending' || r.status === 'Viewed') && (
                      <button
                        onClick={() => { setQuotingReq(r); setQuoteForm({ amount: '', currency: 'LKR', timeline: '', notes: '' }); }}
                        style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                        💰 Send Quotation
                      </button>
                    )}
                    {r.status === 'Quoted' && (
                      <button
                        onClick={() => { setQuotingReq(r); setQuoteForm({ amount: r.quotation.amount, currency: r.quotation.currency, timeline: r.quotation.timeline, notes: r.quotation.notes }); }}
                        style={{ padding: '10px 22px', background: 'transparent', border: '1px solid #fbbf24', color: '#fbbf24', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        ✏️ Update Quote
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {quotingReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '18px', padding: '32px', width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 5px', color: '#f59e0b' }}>💰 Submit Quotation</h2>
            <p style={{ margin: '0 0 22px', opacity: 0.5, fontSize: '0.9rem' }}>
              {quotingReq.projectTitle} &nbsp;—&nbsp; {quotingReq.customer?.fullName}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', opacity: 0.8 }}>Amount *</label>
                <input type="number" placeholder="5500000" value={quoteForm.amount}
                  onChange={e => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', opacity: 0.8 }}>Currency</label>
                <select value={quoteForm.currency} onChange={e => setQuoteForm({ ...quoteForm, currency: e.target.value })}
                  style={{ width: '100%', padding: '11px', background: '#0d1035', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white' }}>
                  {['LKR', 'USD', 'EUR', 'GBP', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', opacity: 0.8 }}>Estimated Timeline</label>
              <input type="text" placeholder="e.g. 8 months" value={quoteForm.timeline}
                onChange={e => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', opacity: 0.8 }}>Notes / Cost Breakdown</label>
              <textarea rows={4} placeholder="Materials, labour, phase-wise breakdown..." value={quoteForm.notes}
                onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setQuotingReq(null)}
                style={{ padding: '11px 22px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmitQuote} disabled={submitting}
                style={{ padding: '11px 28px', background: submitting ? '#333' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {submitting ? 'Sending...' : '💰 Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConstructorRequests;
