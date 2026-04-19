import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Architect.css';
import '../../styles/Profile.css';

const API = 'http://localhost:5000';

function ConstructorProfile() {
  const { user, token, updateUserState } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        updateUserState(data.user);
        setEditing(false);
        alert('Profile updated!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch { alert('Update failed.'); }
    finally { setSaving(false); }
  };

  const initials = user?.fullName?.charAt(0).toUpperCase() || 'C';

  return (
    <div className="architect-dashboard-container">
      <div className="architect-header">
        <div>
          <h1>👤 My Profile</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '5px 0 0' }}>
            Manage your professional profile and contact info.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Avatar + Summary Card */}
        <div className="architect-glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '25px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0,
              boxShadow: '0 0 30px rgba(245,158,11,0.3)'
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px' }}>{user?.fullName}</h2>
              <span style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                🏗️ Constructor
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: '📧', label: 'Email', val: user?.email, editable: false },
              { icon: '📞', label: 'Phone', val: user?.phoneNumber || '—' },
              { icon: '📍', label: 'Address', val: user?.address || '—', fullWidth: true },
              { icon: '📝', label: 'Bio', val: user?.bio || '—', fullWidth: true }
            ].map(item => (
              <div key={item.label}
                style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', gridColumn: item.fullWidth ? '1 / -1' : 'auto' }}>
                <span style={{ opacity: 0.4, fontSize: '0.75rem', display: 'block', marginBottom: '5px', letterSpacing: '1px' }}>
                  {item.icon} {item.label.toUpperCase()}
                </span>
                <span style={{ opacity: item.val === '—' ? 0.4 : 0.9 }}>{item.val}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setEditing(true); setForm({ fullName: user?.fullName || '', phoneNumber: user?.phoneNumber || '', address: user?.address || '', bio: user?.bio || '' }); }}
            style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>
            ✏️ Edit Profile
          </button>
        </div>

        {/* Stats Card */}
        <div className="architect-glass-panel" style={{ padding: '25px' }}>
          <h3 style={{ margin: '0 0 15px', opacity: 0.7 }}>Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Account Type', val: 'Constructor' },
              { label: 'Member Since', val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }
            ].map(item => (
              <div key={item.label} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <span style={{ opacity: 0.4, fontSize: '0.75rem', display: 'block', marginBottom: '5px' }}>{item.label.toUpperCase()}</span>
                <span>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#0d1035', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '18px', padding: '32px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px', color: '#f59e0b' }}>✏️ Edit Profile</h2>
            <form onSubmit={handleSave}>
              {[
                { name: 'fullName',    label: 'Full Name',   placeholder: 'Your full name' },
                { name: 'phoneNumber', label: 'Phone',       placeholder: '07XXXXXXXX' },
                { name: 'address',     label: 'Address',     placeholder: 'Your city / address' },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', opacity: 0.8 }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', opacity: 0.8 }}>Bio (Optional)</label>
                <textarea rows={3} placeholder="Tell clients about your experience..." value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditing(false)}
                  style={{ padding: '11px 22px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '11px 28px', background: saving ? '#333' : 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConstructorProfile;
