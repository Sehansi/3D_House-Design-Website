import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AIDesigner.css';

function AIDesigner() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate AI analysis (in production, this would call an AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockAnalysis = {
        detectedFeatures: {
          floors: Math.floor(Math.random() * 2) + 1,
          windows: Math.floor(Math.random() * 10) + 5,
          doors: Math.floor(Math.random() * 3) + 1,
          style: ['modern', 'traditional', 'minimalist'][Math.floor(Math.random() * 3)],
          estimatedArea: Math.floor(Math.random() * 3000) + 1500,
          roofType: ['flat', 'sloped', 'gable'][Math.floor(Math.random() * 3)]
        },
        suggestedParameters: {
          bedrooms: Math.floor(Math.random() * 3) + 2,
          bathrooms: Math.floor(Math.random() * 2) + 1,
          kitchen: true,
          livingRoom: true,
          totalArea: Math.floor(Math.random() * 3000) + 1500,
          floors: Math.floor(Math.random() * 2) + 1,
          style: ['modern', 'traditional', 'minimalist'][Math.floor(Math.random() * 3)]
        },
        confidence: (Math.random() * 20 + 80).toFixed(1)
      };

      setAnalysisResult(mockAnalysis);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateModel = () => {
    if (!analysisResult) return;
    
    // Navigate to viewer with AI-generated parameters
    navigate('/viewer', {
      state: {
        parameters: analysisResult.suggestedParameters,
        finishes: {
          wallColor: '#ffffff',
          floorType: 'tile',
          roofType: analysisResult.detectedFeatures.roofType
        },
        aiGenerated: true
      }
    });
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
          <a href="/viewer" className="nav-link">3D Viewer</a>
        </div>
      </nav>

      <div className="ai-designer-content">
        <div className="ai-header">
          <h1>🤖 AI-Powered House Designer</h1>
          <p>Upload a house image and let AI generate a 3D model for you</p>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="ai-workflow">
          <div className="upload-section">
            <h2>Step 1: Upload House Image</h2>
            <div className="upload-area">
              {!imagePreview ? (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <span className="upload-icon">📸</span>
                    <p>Click to upload or drag and drop</p>
                    <span className="upload-hint">PNG, JPG up to 5MB</span>
                  </div>
                </label>
              ) : (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    className="change-image-btn"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                  >
                    Change Image
                  </button>
                </div>
              )}
            </div>

            {imagePreview && !analysisResult && (
              <button 
                className="analyze-btn"
                onClick={analyzeImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing with AI...
                  </>
                ) : (
                  <>🔍 Analyze Image</>
                )}
              </button>
            )}
          </div>

          {analysisResult && (
            <div className="analysis-section">
              <h2>Step 2: AI Analysis Results</h2>
              <div className="confidence-badge">
                Confidence: {analysisResult.confidence}%
              </div>

              <div className="analysis-grid">
                <div className="analysis-card">
                  <h3>Detected Features</h3>
                  <ul>
                    <li>🏢 Floors: {analysisResult.detectedFeatures.floors}</li>
                    <li>🪟 Windows: {analysisResult.detectedFeatures.windows}</li>
                    <li>🚪 Doors: {analysisResult.detectedFeatures.doors}</li>
                    <li>🎨 Style: {analysisResult.detectedFeatures.style}</li>
                    <li>📐 Est. Area: {analysisResult.detectedFeatures.estimatedArea} sq ft</li>
                    <li>🏠 Roof: {analysisResult.detectedFeatures.roofType}</li>
                  </ul>
                </div>

                <div className="analysis-card">
                  <h3>Suggested Parameters</h3>
                  <ul>
                    <li>🛏️ Bedrooms: {analysisResult.suggestedParameters.bedrooms}</li>
                    <li>🚿 Bathrooms: {analysisResult.suggestedParameters.bathrooms}</li>
                    <li>🍳 Kitchen: {analysisResult.suggestedParameters.kitchen ? 'Yes' : 'No'}</li>
                    <li>🛋️ Living Room: {analysisResult.suggestedParameters.livingRoom ? 'Yes' : 'No'}</li>
                    <li>📏 Total Area: {analysisResult.suggestedParameters.totalArea} sq ft</li>
                    <li>🏗️ Floors: {analysisResult.suggestedParameters.floors}</li>
                  </ul>
                </div>
              </div>

              <div className="action-buttons">
                <button className="generate-btn" onClick={generateModel}>
                  🎨 Generate 3D Model
                </button>
                <button className="retry-btn" onClick={analyzeImage}>
                  🔄 Re-analyze
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ai-info">
          <h3>How it works</h3>
          <div className="info-steps">
            <div className="info-step">
              <span className="step-number">1</span>
              <div>
                <h4>Upload Image</h4>
                <p>Upload a photo or sketch of your dream house</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">2</span>
              <div>
                <h4>AI Analysis</h4>
                <p>Our AI analyzes the image and detects architectural features</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">3</span>
              <div>
                <h4>3D Generation</h4>
                <p>Automatically generates a 3D model based on detected features</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-number">4</span>
              <div>
                <h4>Customize</h4>
                <p>Fine-tune the generated model to match your vision</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIDesigner;
