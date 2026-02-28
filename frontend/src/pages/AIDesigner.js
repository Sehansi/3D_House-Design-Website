import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import '../styles/AIDesigner.css';

// Simple 3D House Model Component
function HouseModel3D({ style, roomType }) {
  const getColorByStyle = (style) => {
    const colors = {
      modern: '#4a4a4a',
      traditional: '#8b4513',
      minimalist: '#f5f5f5',
      luxury: '#1a1a1a',
      industrial: '#3e3e3e',
      scandinavian: '#d4a574',
      bohemian: '#e07a5f'
    };
    return colors[style] || '#4a4a4a';
  };

  const wallColor = getColorByStyle(style);

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -4]} receiveShadow castShadow>
        <boxGeometry args={[8, 4, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 4, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 4, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 4.5, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
        <boxGeometry args={[8.5, 0.2, 8.5]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>

      {/* Windows */}
      <mesh position={[-2, 2, -3.9]} castShadow>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#87ceeb" metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[2, 2, -3.9]} castShadow>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#87ceeb" metalness={0.5} roughness={0.1} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1, -3.9]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color="#654321" roughness={0.6} />
      </mesh>

      {/* Furniture based on room type */}
      {roomType === 'living room' && (
        <>
          <mesh position={[-2, 0.4, 0]} castShadow>
            <boxGeometry args={[2, 0.8, 1]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
          </mesh>
          <mesh position={[2, 0.3, 0]} castShadow>
            <boxGeometry args={[1, 0.6, 1]} />
            <meshStandardMaterial color="#8b4513" roughness={0.7} />
          </mesh>
        </>
      )}

      {roomType === 'bedroom' && (
        <>
          <mesh position={[0, 0.3, 1]} castShadow>
            <boxGeometry args={[2, 0.6, 2.5]} />
            <meshStandardMaterial color="#8b0000" roughness={0.8} />
          </mesh>
          <mesh position={[-2.5, 1, -2]} castShadow>
            <boxGeometry args={[1.5, 2, 0.5]} />
            <meshStandardMaterial color="#654321" roughness={0.7} />
          </mesh>
        </>
      )}

      {/* Lighting */}
      <pointLight position={[0, 3.5, 0]} intensity={1} color="#fff5e6" castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#ffffff" />
      <pointLight position={[3, 2, 3]} intensity={0.5} color="#ffffff" />
    </group>
  );
}

function AIDesigner() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [roomType, setRoomType] = useState('living room');
  const [budget, setBudget] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedDesign, setGeneratedDesign] = useState(null);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('text');
  const [processingPdf, setProcessingPdf] = useState(false);

  const styles = [
    { value: 'modern', label: 'Modern', icon: '🏢', desc: 'Clean lines & minimalism' },
    { value: 'traditional', label: 'Traditional', icon: '🏛️', desc: 'Classic & timeless' },
    { value: 'minimalist', label: 'Minimalist', icon: '⬜', desc: 'Less is more' },
    { value: 'luxury', label: 'Luxury', icon: '💎', desc: 'Premium & elegant' },
    { value: 'industrial', label: 'Industrial', icon: '🏭', desc: 'Raw & urban' },
    { value: 'scandinavian', label: 'Scandinavian', icon: '🌲', desc: 'Cozy & functional' },
    { value: 'bohemian', label: 'Bohemian', icon: '🌺', desc: 'Eclectic & artistic' }
  ];

  const rooms = [
    { value: 'living room', label: 'Living Room', icon: '🛋️' },
    { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
    { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
    { value: 'office', label: 'Office', icon: '💼' },
    { value: 'dining room', label: 'Dining Room', icon: '🍽️' }
  ];

  const budgets = [
    { value: 'low', label: 'Budget', icon: '💵', desc: 'Cost-effective' },
    { value: 'medium', label: 'Standard', icon: '💰', desc: 'Balanced quality' },
    { value: 'high', label: 'Premium', icon: '💎', desc: 'Luxury materials' }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setProcessingPdf(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('style', style);
      formData.append('budget', budget);

      const response = await fetch('http://localhost:5000/api/ai-designer/upload-plan', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedDesign(data.data);
        setSuccess('✨ 3D design generated from your floor plan!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to process PDF');
      }
    } catch (err) {
      setError('Failed to upload and process PDF. Please make sure the backend is running.');
    } finally {
      setProcessingPdf(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      setError('Please enter a detailed design prompt (at least 10 characters)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/ai-designer/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          style,
          roomType,
          budget
        })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedDesign(data.data);
        setSuccess('✨ Design generated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to generate design');
      }
    } catch (err) {
      setError('Failed to connect to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please sign in to save designs');
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }

    if (!generatedDesign) {
      setError('No design to save');
      return;
    }

    const designName = prompt.substring(0, 50) || 'Floor Plan Design';

    try {
      const response = await fetch('http://localhost:5000/api/ai-designer/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: designName,
          design: generatedDesign
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('💾 Design saved successfully!');
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setError(data.error || 'Failed to save design');
      }
    } catch (err) {
      setError('Failed to save design');
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) {
      setError('Please enter refinement instructions');
      return;
    }

    setLoading(true);
    setError('');
    setShowRefineModal(false);

    try {
      const response = await fetch('http://localhost:5000/api/ai-designer/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          designId: generatedDesign.id,
          refinementPrompt,
          originalDesign: generatedDesign
        })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedDesign(data.data);
        setSuccess('✨ Design refined successfully!');
        setRefinementPrompt('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to refine design');
      }
    } catch (err) {
      setError('Failed to refine design');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-designer-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/designer" className="nav-link">Designer</a>
          <a href="/ai-designer" className="nav-link-active">AI Designer</a>
          <a href="/furniture-customizer" className="nav-link">Furniture</a>
          <a href="/viewer" className="nav-link">3D Viewer</a>
          <a href="/services" className="nav-link">Services</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/signin" className="nav-link-signin">Sign In</a>
          <a href="/register" className="btn-nav-primary">Get Started Free</a>
        </div>
      </nav>

      {error && (
        <div className="notification error-notification">
          <span className="notification-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="notification-close">✕</button>
        </div>
      )}

      {success && (
        <div className="notification success-notification">
          <span className="notification-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="ai-designer-content">
        <div className="ai-header">
          <div className="ai-header-badge">
            <span className="badge-icon">✨</span>
            <span>AI-Powered</span>
          </div>
          <h1>Design Generator</h1>
          <p>Describe your dream space or upload a floor plan to generate 3D designs</p>
        </div>

        <div className="ai-input-section">
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${uploadMode === 'text' ? 'active' : ''}`}
              onClick={() => setUploadMode('text')}
            >
              <span className="mode-icon">💭</span>
              <span>Text Description</span>
            </button>
            <button 
              className={`mode-btn ${uploadMode === 'pdf' ? 'active' : ''}`}
              onClick={() => setUploadMode('pdf')}
            >
              <span className="mode-icon">📄</span>
              <span>Upload Floor Plan</span>
            </button>
          </div>

          {uploadMode === 'text' ? (
            <div className="prompt-card">
              <label className="prompt-label">
                <span className="label-icon">💭</span>
                Describe Your Vision
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: A cozy modern living room with large windows, natural light, comfortable seating, indoor plants, and warm neutral colors..."
                rows="5"
                disabled={loading}
                className="prompt-textarea"
              />
              <div className="prompt-counter">
                {prompt.length} / 500 characters
              </div>
            </div>
          ) : (
            <div className="upload-card">
              <label className="upload-label">
                <span className="label-icon">📄</span>
                Upload House Floor Plan (PDF)
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={processingPdf}
                  className="file-input"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="upload-zone">
                  {uploadedFile ? (
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <span className="file-name">{uploadedFile.name}</span>
                        <span className="file-size">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {processingPdf && (
                        <div className="processing-indicator">
                          <span className="processing-spinner"></span>
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📤</span>
                      <span className="upload-text">Click to upload or drag and drop</span>
                      <span className="upload-hint">PDF files up to 10MB</span>
                    </div>
                  )}
                </label>
              </div>
              <div className="upload-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Automatic room detection</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>3D model generation</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Dimension extraction</span>
                </div>
              </div>
            </div>
          )}

          <div className="selection-section">
            <h3 className="section-title">
              <span className="title-icon">🎨</span>
              Choose Style
            </h3>
            <div className="style-grid">
              {styles.map((s) => (
                <div
                  key={s.value}
                  className={`style-card ${style === s.value ? 'active' : ''}`}
                  onClick={() => setStyle(s.value)}
                >
                  <span className="style-icon">{s.icon}</span>
                  <span className="style-label">{s.label}</span>
                  <span className="style-desc">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {uploadMode === 'text' && (
            <div className="selection-section">
              <h3 className="section-title">
                <span className="title-icon">🏠</span>
                Select Room
              </h3>
              <div className="room-grid">
                {rooms.map((r) => (
                  <div
                    key={r.value}
                    className={`room-card ${roomType === r.value ? 'active' : ''}`}
                    onClick={() => setRoomType(r.value)}
                  >
                    <span className="room-icon">{r.icon}</span>
                    <span className="room-label">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="selection-section">
            <h3 className="section-title">
              <span className="title-icon">💰</span>
              Budget Range
            </h3>
            <div className="budget-grid">
              {budgets.map((b) => (
                <div
                  key={b.value}
                  className={`budget-card ${budget === b.value ? 'active' : ''}`}
                  onClick={() => setBudget(b.value)}
                >
                  <span className="budget-icon">{b.icon}</span>
                  <div className="budget-info">
                    <span className="budget-label">{b.label}</span>
                    <span className="budget-desc">{b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {uploadMode === 'text' && (
            <button 
              className="generate-btn" 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || prompt.trim().length < 10}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Generating Magic...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">✨</span>
                  <span>Generate Design</span>
                </>
              )}
            </button>
          )}
        </div>

        {generatedDesign && (
          <div className="generated-section">
            <div className="generated-header">
              <h2>Your AI-Generated Design</h2>
              <div className="generated-meta">
                <span className="meta-badge">{generatedDesign.style}</span>
                <span className="meta-badge">{generatedDesign.roomType}</span>
                <span className="meta-badge">{generatedDesign.budget} budget</span>
              </div>
            </div>

            <div className="design-showcase">
              {/* 3D Viewer */}
              <div className="viewer-3d-container">
                <div className="viewer-header">
                  <h3>
                    <span className="viewer-icon">🎮</span>
                    Interactive 3D Preview
                  </h3>
                  <div className="viewer-controls-hint">
                    <span>🖱️ Drag to rotate</span>
                    <span>🔍 Scroll to zoom</span>
                  </div>
                </div>
                <div className="canvas-wrapper">
                  <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[10, 8, 10]} />
                    <OrbitControls 
                      enableDamping 
                      dampingFactor={0.05}
                      minDistance={5}
                      maxDistance={30}
                    />
                    
                    <ambientLight intensity={0.4} />
                    <directionalLight
                      position={[10, 10, 5]}
                      intensity={1}
                      castShadow
                      shadow-mapSize-width={2048}
                      shadow-mapSize-height={2048}
                    />
                    
                    <Environment preset="sunset" />
                    
                    <HouseModel3D 
                      style={generatedDesign.style} 
                      roomType={generatedDesign.roomType}
                    />
                  </Canvas>
                </div>
              </div>

              {/* Design Image */}
              <div className="design-image-container">
                <img 
                  src={generatedDesign.imageUrl} 
                  alt="Generated Design"
                  className="design-image"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/800/600?random=${Date.now()}`;
                  }}
                />
                <div className="image-overlay">
                  <button className="overlay-btn" onClick={() => window.open(generatedDesign.imageUrl, '_blank')}>
                    <span>🔍</span> View Full Size
                  </button>
                </div>
              </div>

              <div className="design-details-grid">
                <div className="detail-card">
                  <h3 className="detail-title">
                    <span className="detail-icon">🎨</span>
                    Color Palette
                  </h3>
                  <div className="color-palette">
                    {generatedDesign.parameters.colors.map((color, index) => (
                      <div key={index} className="color-item">
                        <div className="color-swatch" style={{ background: color }}></div>
                        <span className="color-code">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <h3 className="detail-title">
                    <span className="detail-icon">🪵</span>
                    Materials
                  </h3>
                  <div className="materials-list">
                    {generatedDesign.parameters.materials.map((material, index) => (
                      <span key={index} className="material-tag">{material}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <h3 className="detail-title">
                    <span className="detail-icon">🛋️</span>
                    Furniture
                  </h3>
                  <div className="furniture-list">
                    {generatedDesign.parameters.furniture.map((item, index) => (
                      <div key={index} className="furniture-item">
                        <span className="furniture-bullet">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <h3 className="detail-title">
                    <span className="detail-icon">💡</span>
                    Lighting
                  </h3>
                  <p className="lighting-info">{generatedDesign.parameters.lighting}</p>
                </div>
              </div>

              <div className="suggestions-card">
                <h3 className="suggestions-title">
                  <span className="suggestions-icon">💡</span>
                  AI Recommendations
                </h3>
                <div className="suggestions-grid">
                  {generatedDesign.suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-item">
                      <span className="suggestion-number">{index + 1}</span>
                      <span className="suggestion-text">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="design-actions">
                <button className="action-btn primary-btn" onClick={handleSaveDesign} disabled={loading}>
                  <span className="btn-icon">💾</span>
                  <span>Save Design</span>
                </button>
                <button className="action-btn secondary-btn" onClick={() => setShowRefineModal(true)} disabled={loading}>
                  <span className="btn-icon">✨</span>
                  <span>Refine Design</span>
                </button>
                <button className="action-btn tertiary-btn" onClick={() => {
                  setGeneratedDesign(null);
                  setPrompt('');
                  setUploadedFile(null);
                }}>
                  <span className="btn-icon">🔄</span>
                  <span>Start Over</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showRefineModal && (
        <div className="modal-overlay" onClick={() => setShowRefineModal(false)}>
          <div className="refine-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Refine Your Design</h3>
              <button className="modal-close" onClick={() => setShowRefineModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label className="modal-label">How would you like to improve this design?</label>
              <textarea
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="Example: Make it brighter, add more plants, use warmer colors..."
                rows="4"
                className="modal-textarea"
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel-btn" onClick={() => setShowRefineModal(false)}>
                Cancel
              </button>
              <button className="modal-btn refine-btn" onClick={handleRefine} disabled={!refinementPrompt.trim()}>
                <span>✨</span> Refine Design
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">3D House Design</span>
          </div>
          <p className="footer-text">© 2026 3D House Design. All rights reserved.</p>
          <div className="footer-social">
            <a href="#" className="social-link">f</a>
            <a href="#" className="social-link">𝕏</a>
            <a href="#" className="social-link">in</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AIDesigner;
