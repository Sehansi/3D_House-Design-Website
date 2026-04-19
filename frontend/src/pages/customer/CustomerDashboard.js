import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/CustomerDashboard.css';
import { Sparkles, Eye, Sofa, Users, ArrowRight } from 'lucide-react';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [recentDesigns, setRecentDesigns] = useState([]);
    
    // Quick Launch Tools Configuration
    const tools = [
        { id: 'ai', title: 'AI Designer', desc: 'Auto-extract 3D from blueprints', icon: <Sparkles size={28} strokeWidth={1.5} />, path: '/ai-designer', color: '#7000ff' },
        { id: 'architects', title: 'Find Architects', desc: 'Connect with pro designers', icon: <Users size={28} strokeWidth={1.5} />, path: '/architects', color: '#ff0055' },
        { id: 'viewer', title: '3D Viewer', desc: 'Interactive property walkthrough', icon: <Eye size={28} strokeWidth={1.5} />, path: '/viewer', color: '#00ff95' },
        { id: 'furniture', title: 'Furniture Customizer', desc: 'Style your interior spaces', icon: <Sofa size={28} strokeWidth={1.5} />, path: '/furniture-customizer', color: '#ff9500' }
    ];

    return (
        <div className="cust-dash-container">
            <header className="dash-header">
                <div className="welcome-text">
                    <h1>Welcome Back, {user?.fullName || 'Architect'}</h1>
                    <p>Continue building your dream architectural project</p>
                </div>
                <div className="profile-shortcut">
                    <Link to="/profile" className="btn-profile">View Full Profile</Link>
                </div>
            </header>

            {/* Quick Launch Tool Matrix */}
            <section className="tool-matrix">
                <h2>Design Launchpad</h2>
                <div className="matrix-grid">
                    {tools.map(tool => (
                        <Link key={tool.id} to={tool.path} className="tool-card-modern">
                            <div className="card-icon-bg" style={{ backgroundColor: `${tool.color}15` }}>
                                <span className="tool-icon" style={{ color: tool.color }}>{tool.icon}</span>
                            </div>
                            <div className="card-info">
                                <h3>{tool.title}</h3>
                                <p>{tool.desc}</p>
                            </div>
                            <div className="card-arrow"><ArrowRight size={18} /></div>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="dashboard-grid-secondary">
                {/* Secondary Utility Panels */}
                <article className="stat-panel glass-card">
                    <h3>Project Ecosystem</h3>
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="val">2</span>
                            <span className="lab">Active 3D Plans</span>
                        </div>
                        <div className="stat-item">
                            <span className="val">1</span>
                            <span className="lab">Architect Tickets</span>
                        </div>
                    </div>
                    <Link to="/gallery" className="btn-secondary-dash">Browse All Projects</Link>
                </article>

                <article className="news-panel glass-card">
                    <h3>Pro Blueprint Service</h3>
                    <p>Need a professional 2D plan? Connect with our verified architects to get a precision floor plan PDF.</p>
                    <Link to="/contact" className="btn-primary-small">Request 2D Blueprint</Link>
                </article>
            </div>
        </div>
    );
};

export default CustomerDashboard;
