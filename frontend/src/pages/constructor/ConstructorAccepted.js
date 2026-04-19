import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Architect.css';

const API = 'http://localhost:5000';

function ConstructorAccepted() {
  const { token } = useAuth();
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAccepted(); }, [token]);

  const fetchAccepted = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/constructor-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAccepted((data.requests || []).filter(r => r.status === 'Accepted'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="architect-dashboard-container">
      <div className="architect-header">
        <div>
          <h1>✅ Accepted Projects</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '5px 0 0' }}>
            Projects where clients accepted your quotation.
          </p>
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.5 }}>
          {accepted.length} project{accepted.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {loading ? (
          <div className="architect-glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ opacity: 0.5 }}>Loading...</p>
          </div>
        ) : accepted.length === 0 ? (
          <div className="architect-glass-panel" style={{ textAlign: 'center', padding: '70px 40px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>🏗️</span>
            <h3>No Accepted Projects Yet</h3>
            <p style={{ opacity: 0.5 }}>When a client accepts your quote, the project will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {accepted.map((r, i) => (
              <div key={r._id} className="architect-glass-panel"
                style={{ borderLeft: '4px solid #00ff88', padding: '28px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>#{i + 1}</span>
                      <h3 style={{ margin: 0 }}>{r.projectTitle}</h3>
                    </div>
                    <p style={{ margin: 0, opacity: 0.5, fontSize: '0.85rem' }}>
                      👤 <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{r.customer?.fullName}</strong>
                      &nbsp;•&nbsp; 📧 {r.customer?.email}
                      {r.customer?.phoneNumber && <>&nbsp;•&nbsp; 📞 {r.customer.phoneNumber}</>}
                    </p>
                  </div>
                  <span style={{ padding: '5px 16px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.25)', alignSelf: 'flex-start' }}>
                    ✅ Accepted
                  </span>
                </div>

                {r.description && (
                  <p style={{ margin: '0 0 18px', opacity: 0.7, lineHeight: 1.6 }}>{r.description}</p>
                )}

                {/* Agreed Quotation */}
                <div style={{ padding: '20px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: '12px', marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 10px', color: '#00ff88', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>AGREED QUOTATION</p>
                  <p style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 800 }}>
                    {r.quotation?.currency} {Number(r.quotation?.amount).toLocaleString()}
                  </p>
                  {r.quotation?.timeline && (
                    <p style={{ margin: '0 0 5px', opacity: 0.6 }}>⏱️ Estimated Timeline: {r.quotation.timeline}</p>
                  )}
                  {r.quotation?.notes && (
                    <p style={{ margin: '10px 0 0', opacity: 0.6, fontStyle: 'italic', fontSize: '0.9rem' }}>"{r.quotation.notes}"</p>
                  )}
                </div>

                {/* Submitted Plans */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {r.plan2DPath && (
                    r.plan2DType === 'image' ? (
                      <div>
                        <p style={{ margin: '0 0 8px', opacity: 0.4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px' }}>CLIENT 2D PLAN</p>
                        <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer">
                          <img src={`${API}${r.plan2DPath}`} alt="2D" style={{ height: '120px', borderRadius: '8px', border: '1px solid rgba(0,217,255,0.3)', cursor: 'zoom-in', objectFit: 'cover' }} />
                        </a>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: '0 0 8px', opacity: 0.4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px' }}>CLIENT 2D PLAN</p>
                        <a href={`${API}${r.plan2DPath}`} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00d9ff', padding: '10px 16px', background: 'rgba(0,217,255,0.08)', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(0,217,255,0.2)' }}>
                          📄 View 2D PDF Plan
                        </a>
                      </div>
                    )
                  )}
                  {r.plan3DPath && (
                    <div>
                      <p style={{ margin: '0 0 8px', opacity: 0.4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px' }}>CLIENT 3D MODEL</p>
                      <a href={`${API}${r.plan3DPath}`} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a78bfa', padding: '10px 16px', background: 'rgba(167,139,250,0.08)', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(167,139,250,0.2)' }}>
                        📦 View 3D File
                      </a>
                    </div>
                  )}
                </div>

                {/* Next steps */}
                <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid rgba(0,255,136,0.4)', fontSize: '0.9rem' }}>
                  <strong style={{ color: '#00ff88' }}>📞 Next Step:</strong>
                  <span style={{ opacity: 0.7 }}> Contact <strong style={{ color: 'white' }}>{r.customer?.fullName}</strong> at <strong style={{ color: 'white' }}>{r.customer?.email}</strong> to schedule a site visit and finalize the construction plan.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConstructorAccepted;
