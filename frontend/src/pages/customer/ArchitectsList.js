import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ArchitectsList.css';

const ArchitectsList = () => {
    const { token } = useAuth();
    const [architects, setArchitects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArchitects = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/architect/public/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setArchitects(data.architects);
                }
            } catch (error) {
                console.error("Error fetching architects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchitects();
    }, [token]);

    return (
        <div className="architects-list-container">
            <header className="list-header">
                <h1>Our Expert Architects</h1>
                <p>Connect with professional architects to bring your vision to life.</p>
            </header>

            {loading ? (
                <div className="loading-spinner-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="architect-grid">
                    {architects.map(arch => (
                        <div key={arch._id} className="architect-card-modern">
                            <div className="arch-avatar">
                                {arch.fullName.charAt(0)}
                            </div>
                            <div className="arch-info">
                                <h3>{arch.fullName}</h3>
                                <p className="specialization">{arch.architectProfile?.specialization || 'Professional Architect'}</p>
                                <div className="arch-stats">
                                    <span>⭐ 4.8 (24 Reviews)</span>
                                    <span>💼 {arch.architectProfile?.experience || '5'}+ Years</span>
                                </div>
                                <Link to={`/architect/${arch._id}`} className="view-profile-btn">View Profile</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchitectsList;
