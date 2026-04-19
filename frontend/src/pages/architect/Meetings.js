import React, { useState, useEffect } from 'react';
import '../../styles/Architect.css';
import { useAuth } from '../../context/AuthContext';

function Meetings() {
  const { token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingMeeting, setRejectingMeeting] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [acceptingMeeting, setAcceptingMeeting] = useState(null);
  const [acceptLink, setAcceptLink] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, [token]);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meetings/my-meetings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingStatus = async (id, status, note = '', link = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, architectNote: note, meetingLink: link })
      });
      
      if (response.ok) {
        fetchMeetings(); // Refresh the list
        if (status === 'Rejected') {
           setRejectingMeeting(null);
           setRejectNote('');
        }
        if (status === 'Accepted') {
           setAcceptingMeeting(null);
           setAcceptLink('');
        }
      } else {
        alert('Failed to update meeting status.');
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const handleRejectClick = (meeting) => {
    setRejectingMeeting(meeting);
  };

  const handleAcceptClick = (meeting) => {
    setAcceptingMeeting(meeting);
    setAcceptLink(meeting.meetingLink || '');
  };

  const confirmReject = () => {
    if (!rejectNote.trim()) {
      alert("Please provide a reason or note for rejecting.");
      return;
    }
    updateMeetingStatus(rejectingMeeting._id, 'Rejected', rejectNote);
  };

  const confirmAccept = () => {
    if (!acceptLink.trim()) {
      alert("Please provide a meeting link (Zoom, Teams, Google Meet).");
      return;
    }
    updateMeetingStatus(acceptingMeeting._id, 'Accepted', '', acceptLink);
  };

  return (
    <div className="architect-dashboard-container">
      <div className="architect-header">
        <h1>Client Meetings</h1>
      </div>

      <div className="architect-glass-panel" style={{ maxWidth: '1000px', margin: '0 auto', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>Schedule Overview</h2>
          <p style={{ opacity: 0.6, margin: 0 }}>Review and manage your requested client meetings.</p>
        </div>
      </div>

      <div className="meeting-list">
        {loading ? (
           <p style={{textAlign: 'center'}}>Loading your schedule...</p>
        ) : meetings.length === 0 ? (
           <p style={{textAlign: 'center'}}>No meetings scheduled right now.</p>
        ) : meetings.map(meeting => (
          <div key={meeting._id} className="meeting-card" style={{ borderLeftColor: meeting.status === 'Accepted' ? '#00ff88' : meeting.status === 'Rejected' ? '#ff4444' : '#00d9ff' }}>
            <div className="meeting-info">
              <h4>{meeting.topic} - {meeting.customer?.fullName}</h4>
              <p>{meeting.date} • {meeting.time} • Status: <strong style={{ color: meeting.status === 'Accepted' ? '#00ff88' : meeting.status === 'Rejected' ? '#ff4444' : '#00d9ff' }}>{meeting.status}</strong></p>
              {meeting.architectNote && meeting.status === 'Rejected' && (
                 <p style={{ fontStyle: 'italic', marginTop: '10px', color: '#ffaaaa' }}>" {meeting.architectNote} "</p>
              )}
            </div>
            <div className="meeting-actions">
              {meeting.status === 'Pending' && (
                <>
                  <button onClick={() => handleAcceptClick(meeting)} style={{ marginRight: '10px', background: '#00ff88', color: '#000' }}>Accept</button>
                  <button onClick={() => handleRejectClick(meeting)} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444' }}>Reject</button>
                </>
              )}
              {meeting.status === 'Accepted' && (
                 <div>
                    <button style={{ background: 'rgba(255,255,255,0.1)', cursor: 'default' }}>Meeting Approved</button>
                    {meeting.meetingLink ? (
                        <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                           <a href={meeting.meetingLink} target="_blank" rel="noreferrer" style={{color: '#00d9ff', fontSize: '0.9rem'}}>🔗 Joined Link</a>
                           <button onClick={() => handleAcceptClick(meeting)} style={{ background: 'transparent', border: '1px solid #00d9ff', color: '#00d9ff', fontSize: '0.8rem', padding: '4px 8px' }}>Edit</button>
                        </div>
                    ) : (
                        <div style={{marginTop: '10px'}}>
                           <button onClick={() => handleAcceptClick(meeting)} style={{ background: 'transparent', border: '1px dashed #00ff88', color: '#00ff88', fontSize: '0.8rem', padding: '4px 8px' }}>+ Add Meeting Link</button>
                        </div>
                    )}
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {rejectingMeeting && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{ background: '#111', padding: '30px', borderRadius: '15px', width: '400px' }}>
            <h2 style={{marginTop: 0}}>Reject Meeting</h2>
            <p>Write a note to <strong>{rejectingMeeting.customer?.fullName}</strong> explaining why.</p>
            <textarea 
               value={rejectNote} 
               onChange={(e) => setRejectNote(e.target.value)}
               placeholder="Sorry, I am fully booked that day..."
               style={{ width: '100%', height: '100px', margin: '20px 0', padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setRejectingMeeting(null); setRejectNote(''); }} style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmReject} style={{ padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {acceptingMeeting && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{ background: '#111', padding: '30px', borderRadius: '15px', width: '400px' }}>
            <h2 style={{marginTop: 0, color: '#00ff88'}}>{acceptingMeeting.meetingLink ? 'Update Meeting Link' : 'Accept Meeting'}</h2>
            <p>Provide a meeting link for <strong>{acceptingMeeting.customer?.fullName}</strong>.</p>
            <input 
               type="url"
               value={acceptLink} 
               onChange={(e) => setAcceptLink(e.target.value)}
               placeholder="e.g. https://zoom.us/j/..."
               style={{ width: '100%', margin: '20px 0', padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #555', borderRadius: '5px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setAcceptingMeeting(null); setAcceptLink(''); }} style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmAccept} style={{ padding: '8px 16px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                 {acceptingMeeting.status === 'Accepted' ? 'Update Link' : 'Schedule Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Meetings;
