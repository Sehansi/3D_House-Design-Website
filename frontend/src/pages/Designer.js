import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Designer.css';

function Designer() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [designName, setDesignName] = useState('');
  const [parameters, setParameters] = useState({
    bedrooms: 3,
    bathrooms: 2,
    kitchen: true,
    livingRoom: true,
    totalArea: 2000,
    floors: 1,
    style: 'modern'
  });
  
  const [finishes, setFinishes] = useState({
    wallColor: '#ffffff',
    floorType: 'tile',
    roofType: 'sloped'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFinishChange = (key, value) => {
    setFinishes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreview = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/designs/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parameters,
          finishes
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate preview');
      }
      
      // Navigate to viewer with model data
      navigate('/viewer', { state: { modelData: data.modelData, parameters, finishes } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!designName.trim()) {
      setError('Please enter a design name');
      return;
    }

    if (!isAuthenticated) {
      setError('Please sign in to save your design');
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/designs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: designName,
          parameters,
          finishes
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save design');
      }
      
      setSuccess('Design saved successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/designer" className="nav-link-active">Designer</a>
          <a href="/ai-designer" className="nav-link">AI Designer</a>
          <a href="/furniture-customizer" className="nav-link">Furniture</a>
          <a href="/viewer" className="nav-link">3D Viewer</a>
          {isAuthenticated ? (
            <>
              <a href="/profile" className="nav-link">
                👤 {user?.fullName || 'Profile'}
              </a>
            </>
          ) : (
            <>
              <a href="/signin" className="nav-link">Sign In</a>
              <a href="/register" className="btn-nav-primary">Get Started</a>
            </>
          )}
        </div>
      </nav>

      <div className="designer-content">
        <div className="designer-header">
          <h1>Parametric House Designer</h1>
          <p>Design your dream home by entering simple parameters</p>
          
          {!isAuthenticated && (
            <div className="info-banner">
              ℹ️ Sign in to save your designs. You can still preview without an account.
            </div>
          )}
          
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Parameters</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Finishes</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Preview</div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="success-banner">
            ✓ {success}
          </div>
        )}

        {step === 1 && (
          <div className="design-step">
            <h2>Step 1: Basic Parameters</h2>
            <p className="step-description">Define the basic structure of your house</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Design Name</label>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="My Dream House"
                />
              </div>

              <div className="form-group">
                <label>Number of Bedrooms</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={parameters.bedrooms}
                  onChange={(e) => handleParameterChange('bedrooms', parseInt(e.target.value))}
                />
                <span className="input-hint">{parameters.bedrooms} bedroom(s)</span>
              </div>

              <div className="form-group">
                <label>Number of Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={parameters.bathrooms}
                  onChange={(e) => handleParameterChange('bathrooms', parseInt(e.target.value))}
                />
                <span className="input-hint">{parameters.bathrooms} bathroom(s)</span>
              </div>

              <div className="form-group">
                <label>Total Area (sq ft)</label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={parameters.totalArea}
                  onChange={(e) => handleParameterChange('totalArea', parseInt(e.target.value))}
                />
                <span className="input-hint">{parameters.totalArea} sq ft</span>
              </div>

              <div className="form-group">
                <label>Number of Floors</label>
                <select
                  value={parameters.floors}
                  onChange={(e) => handleParameterChange('floors', parseInt(e.target.value))}
                >
                  <option value="1">1 Floor</option>
                  <option value="2">2 Floors</option>
                  <option value="3">3 Floors</option>
                </select>
              </div>

              <div className="form-group">
                <label>House Style</label>
                <select
                  value={parameters.style}
                  onChange={(e) => handleParameterChange('style', e.target.value)}
                >
                  <option value="modern">Modern</option>
                  <option value="traditional">Traditional</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={parameters.kitchen}
                    onChange={(e) => handleParameterChange('kitchen', e.target.checked)}
                  />
                  Include Kitchen
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={parameters.livingRoom}
                    onChange={(e) => handleParameterChange('livingRoom', e.target.checked)}
                  />
                  Include Living Room
                </label>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-next" onClick={() => setStep(2)}>
                Next: Finishes →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="design-step">
            <h2>Step 2: Interior Finishes</h2>
            <p className="step-description">Choose colors and materials for your house</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Wall Color</label>
                <div className="color-options">
                  {['#ffffff', '#f0f0f0', '#00d9ff', '#ff6b9d', '#ffd700', '#98fb98'].map(color => (
                    <button
                      key={color}
                      className={`color-option ${finishes.wallColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => handleFinishChange('wallColor', color)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Floor Type</label>
                <div className="option-cards">
                  {['tile', 'wood', 'marble', 'carpet'].map(type => (
                    <button
                      key={type}
                      className={`option-card ${finishes.floorType === type ? 'selected' : ''}`}
                      onClick={() => handleFinishChange('floorType', type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Roof Type</label>
                <div className="option-cards">
                  {['flat', 'sloped', 'gable'].map(type => (
                    <button
                      key={type}
                      className={`option-card ${finishes.roofType === type ? 'selected' : ''}`}
                      onClick={() => handleFinishChange('roofType', type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn-next" onClick={() => setStep(3)}>
                Next: Preview →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="design-step">
            <h2>Step 3: Review & Generate</h2>
            <p className="step-description">Review your design and generate 3D model</p>
            
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Parameters</h3>
                <ul>
                  <li>Bedrooms: {parameters.bedrooms}</li>
                  <li>Bathrooms: {parameters.bathrooms}</li>
                  <li>Total Area: {parameters.totalArea} sq ft</li>
                  <li>Floors: {parameters.floors}</li>
                  <li>Style: {parameters.style}</li>
                  <li>Kitchen: {parameters.kitchen ? 'Yes' : 'No'}</li>
                  <li>Living Room: {parameters.livingRoom ? 'Yes' : 'No'}</li>
                </ul>
              </div>

              <div className="summary-card">
                <h3>Finishes</h3>
                <ul>
                  <li>Wall Color: <span className="color-preview" style={{ background: finishes.wallColor }} /></li>
                  <li>Floor Type: {finishes.floorType}</li>
                  <li>Roof Type: {finishes.roofType}</li>
                </ul>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-back" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button 
                className="btn-preview" 
                onClick={handlePreview}
                disabled={loading}
              >
                {loading ? 'Generating...' : '🎨 Generate 3D Preview'}
              </button>
              <button 
                className="btn-save" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : '💾 Save Design'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Designer;
