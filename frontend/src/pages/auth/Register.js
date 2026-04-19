import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import '../../styles/Auth.css';
import { UserCircle } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, googleAuth } = useAuth();
  
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        const result = await googleAuth(userInfo, formData.role);
        
        if (result.success) {
          if (result.user?.role === 'Admin') navigate('/admin');
          else if (result.user?.role === 'Constructor') navigate('/constructor');
          else if (result.user?.role === 'Architect') navigate('/architect');
          else navigate('/dashboard');
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to authenticate with Google.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register(
      formData.fullName,
      formData.email,
      formData.password,
      formData.role
    );
    
    if (result.success) {
      // Role-based redirection after registration
      if (result.user?.role === 'Admin') {
        navigate('/admin');
      } else if (result.user?.role === 'Constructor') {
        navigate('/constructor');
      } else if (result.user?.role === 'Architect') {
        navigate('/architect');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-background register-bg"></div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-icon">
            <span className="icon-user"><UserCircle size={36} strokeWidth={1.5} /></span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us to design your dream home</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Join As</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="role-selector"
              >
                <option value="Customer">Customer (Standard User)</option>
                <option value="Constructor">Constructor (Service Provider)</option>
                <option value="Architect">2D Architect (Professional Designer)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="social-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons" style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              type="button"
              onClick={() => loginWithGoogle()}
              className="btn-social" 
              style={{ width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
