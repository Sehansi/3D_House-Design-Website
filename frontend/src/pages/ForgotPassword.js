import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log('Forgot password:', email);
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-icon">
            <span className="icon-home">🔑</span>
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            {submitted 
              ? 'Check your email for reset instructions'
              : 'Enter your email to reset your password'
            }
          </p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Send Reset Link
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#10b981', marginBottom: '20px' }}>
                ✓ Reset link sent successfully!
              </p>
              <Link to="/signin" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          )}

          <p className="auth-switch">
            Remember your password? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
