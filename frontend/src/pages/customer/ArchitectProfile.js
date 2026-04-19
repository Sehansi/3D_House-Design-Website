import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ArchitectProfile.css';

const ArchitectProfile = () => {
    const { id } = useParams();
    const { token, user } = useAuth();
    const [architect, setArchitect] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMeetingForm, setShowMeetingForm] = useState(false);
    const [meetingRequest, setMeetingRequest] = useState({ date: '', time: '', purpose: '', notes: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        const fetchArchitectProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/architect/profile/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setArchitect(data.architect);
                    setReviews(data.reviews);
                }
            } catch (error) {
                console.error("Error fetching architect profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchitectProfile();
    }, [id, token]);

    const handleMeetingSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/meetings/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    architectId: id, 
                    topic: meetingRequest.purpose + (meetingRequest.notes ? ` - ${meetingRequest.notes}` : ''), 
                    date: meetingRequest.date, 
                    time: meetingRequest.time 
                })
            });
            if (response.ok) {
                alert("Meeting request sent successfully!");
                setShowMeetingForm(false);
            }
        } catch (error) {
            console.error("Error submitting meeting request:", error);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/architect/review/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewForm)
            });
            if (response.ok) {
                const data = await response.json();
                setReviews([...reviews, { ...data.review, customerId: { fullName: user.fullName } }]);
                alert("Review submitted!");
                setShowReviewForm(false);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    if (loading) return <div className="loading-spinner">Loading Architect Profile...</div>;
    if (!architect) return <div className="error-msg">Architect not found!</div>;

    return (
        <div className="architect-profile-view">
            <div className="profile-hero-section">
                <div className="profile-avatar-large">
                    {architect.fullName.charAt(0)}
                </div>
                <div className="profile-main-info">
                    <h1>{architect.fullName}</h1>
                    <p className="specialization">{architect.architectProfile?.specialization || 'Professional Architect'}</p>
                    <div className="profile-badges">
                        <span className="badge">⭐ 4.8 Rating</span>
                        <span className="badge">💼 {architect.architectProfile?.experience || 5} Years Experience</span>
                        <span className="badge">✔️ Verified Professional</span>
                    </div>
                    <button className="meeting-request-btn" onClick={() => setShowMeetingForm(true)}>Request a Meeting</button>
                </div>
            </div>

            <section className="profile-details">
                <div className="details-card">
                    <h3>About {architect.fullName}</h3>
                    <p>{architect.architectProfile?.description || "A dedicated professional with a passion for modern architectural design. Committed to excellence and customer satisfaction."}</p>
                </div>

                <div className="details-card">
                    <h3>Specializations</h3>
                    <ul className="specialization-list">
                        <li>Modern Residential Design</li>
                        <li>Sustainable Architecture</li>
                        <li>Interior Floor Planning</li>
                        <li>3D Modeling & Visualization</li>
                    </ul>
                </div>
            </section>

            <section className="reviews-section">
                <div className="section-header">
                    <h2>Customer Reviews</h2>
                    {user?.role === 'Customer' && <button className="add-review-btn" onClick={() => setShowReviewForm(true)}>Add a Review</button>}
                </div>
                <div className="reviews-grid">
                    {reviews.length > 0 ? reviews.map(rev => (
                        <div key={rev._id} className="review-card">
                            <div className="rev-header">
                                <span className="rev-user">{rev.customerId?.fullName}</span>
                                <span className="rev-rating">{'⭐'.repeat(rev.rating)}</span>
                            </div>
                            <p className="rev-comment">{rev.comment}</p>
                            <span className="rev-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                    )) : <p>No reviews yet. Be the first to review!</p>}
                </div>
            </section>

            {/* Meeting Form Modal */}
            {showMeetingForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Schedule a Meeting</h2>
                        <form onSubmit={handleMeetingSubmit}>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" required value={meetingRequest.date} onChange={(e) => setMeetingRequest({ ...meetingRequest, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input type="time" required value={meetingRequest.time} onChange={(e) => setMeetingRequest({ ...meetingRequest, time: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Purpose</label>
                                <input type="text" placeholder="e.g. Discuss new project" required value={meetingRequest.purpose} onChange={(e) => setMeetingRequest({ ...meetingRequest, purpose: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Notes (Optional)</label>
                                <textarea placeholder="Add any details..." value={meetingRequest.notes} onChange={(e) => setMeetingRequest({ ...meetingRequest, notes: e.target.value })}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowMeetingForm(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Form Modal */}
            {showReviewForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Write a Review</h2>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="form-group">
                                <label>Rating</label>
                                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Comment</label>
                                <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowReviewForm(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Post Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchitectProfile;
