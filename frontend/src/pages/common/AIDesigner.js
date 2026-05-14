import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Architect.css'; // Reusing architect styles for sleek glassmorphism
import { Upload, PenLine, AlertTriangle, Puzzle, Eye, Sparkles, Home, Palette, Brain, Zap, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000';

function AIDesigner() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [style, setStyle] = useState('modern');
  const [budget, setBudget] = useState('medium');
  const [useRoboflow, setUseRoboflow] = useState(false); // true = Roboflow Universe model
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'
  const [prompt, setPrompt] = useState('');
  
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    if (selected.size > 15 * 1024 * 1024) {
      setError('File too large. Maximum size is 15MB.');
      return;
    }
    setError('');
    setFile(selected);
    
    if (selected.type.includes('pdf')) {
      setPreview('PDF_DOCUMENT');
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a 2D plan first.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('style', style);
    formData.append('budget', budget);
    formData.append('useRoboflow', useRoboflow ? 'true' : 'false');

    try {
      const headers = {};
      if (isAuthenticated) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/ai-designer/upload-plan`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to process the plan.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextTo3D = async () => {
    if (!prompt || prompt.trim().length < 5) {
      setError('Please enter a more detailed prompt.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/api/ai-designer/text-to-3d`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.data);
      } else {
        setError(data.error || 'AI generation failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openIn3D = () => {
    if (!result) return;
    
    // YOLO/Hybrid pipeline results ALWAYS use HouseModel3D (wall segment renderer).
    // isTextTo3D is ONLY true for pure text-to-3D results (no walls, only rooms).
    const isYoloResult = !!(result.walls || result.polygons) ||
                         result.source === 'hybrid-yolo-gemini' ||
                         result.source === 'fallback';

    const isTextTo3D = !isYoloResult && result.rooms && Array.isArray(result.rooms);
    
    navigate('/viewer', {
      state: {
        parameters: isYoloResult ? result : (isTextTo3D ? result : result.parameters),
        aiExtracted: true,
        isTextTo3D: isTextTo3D
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f111a 0%, #0d1035 100%)', padding: '60px 20px', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ padding: '6px 16px', background: 'rgba(112,0,255,0.15)', border: '1px solid #7000ff44', color: '#b266ff', borderRadius: '30px', fontWeight: 800, letterSpacing: '1px', fontSize: '0.8rem' }}>AI VISION ENGINE v2.0</span>
          <h1 style={{ fontSize: '3rem', margin: '20px 0 10px', fontWeight: 900, background: 'linear-gradient(90deg, #fff, #b266ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            2D to 3D Extraction
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
            Transform your architectural vision into a 3D reality using professional AI models.
          </p>
        </div>

        {/* Tab Switcher */}
        {!result && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '14px', width: 'fit-content', margin: '0 auto 40px' }}>
            <button 
              onClick={() => setActiveTab('upload')}
              style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: activeTab === 'upload' ? '#7000ff' : 'transparent', color: 'white', fontWeight: 700, cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Upload size={16} /> Upload 2D Plan
            </button>
            <button 
              onClick={() => setActiveTab('text')}
              style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: activeTab === 'text' ? '#7000ff' : 'transparent', color: 'white', fontWeight: 700, cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PenLine size={16} /> Text to 3D
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{ padding: '15px 20px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* Main Interface Content */}
        {!result ? (
          <div className="architect-glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid rgba(112,0,255,0.2)' }}>
            
            {activeTab === 'upload' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '30px' }}>
                {/* Upload UI Logic (Condensed for space) */}
                <div 
                  onClick={() => !loading && fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{ 
                    border: `3px dashed ${file ? '#b266ff' : 'rgba(255,255,255,0.2)'}`, 
                    borderRadius: '20px', 
                    backgroundColor: file ? 'rgba(112,0,255,0.05)' : 'rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '40px 20px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                    minHeight: '300px'
                  }}
                >
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                  
                  {loading ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '60px', height: '60px', border: '4px solid rgba(112,0,255,0.2)', borderTopColor: '#b266ff', borderRadius: '50%', animation: 'spin 1.2s linear infinite', margin: '0 auto 20px' }} />
                      <h3 style={{ color: '#b266ff', margin: 0 }}>Processing the Plan...</h3>
                    </div>
                  ) : !file ? (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}><Puzzle size={64} strokeWidth={1} color="rgba(178,102,255,0.4)" /></span>
                      <h3 style={{ margin: '0 0 5px' }}>Drag & Drop Blueprint</h3>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>Supports PNG, JPG, or PDF</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: '#b266ff' }}>{file.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Click to change</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 15px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#b266ff' }}>01.</span> Style Preference
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['modern', 'minimalist', 'luxury', 'industrial'].map(s => (
                        <button 
                          key={s} onClick={() => setStyle(s)} disabled={loading}
                          style={{ 
                            padding: '12px 10px', borderRadius: '10px', border: `1px solid ${style === s ? '#b266ff' : 'rgba(255,255,255,0.1)'}`, 
                            background: style === s ? 'rgba(112,0,255,0.2)' : 'rgba(0,0,0,0.3)', color: style === s ? 'white' : 'rgba(255,255,255,0.6)',
                            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Model Selection */}
                  <div>
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#b266ff' }}>02.</span> AI Engine
                    </h3>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #7000ff66',
                        background: 'rgba(112,0,255,0.07)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ width: '38px', height: '20px', borderRadius: '10px', flexShrink: 0, background: '#7000ff', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '2px', left: '20px', width: '16px', height: '16px', borderRadius: '50%', background: 'white' }} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#b266ff', display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={14} /> YOLO v8 Model (best_v2.pt)</p>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Local AI — High-Accuracy extraction</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      onClick={handleUpload} 
                      disabled={loading || !file}
                      style={{ 
                        width: '100%', padding: '16px', borderRadius: '12px', background: (!file || loading) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #7000ff, #b266ff)', 
                        border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer',
                        boxShadow: (!file || loading) ? 'none' : '0 10px 20px rgba(112,0,255,0.4)', transition: 'all 0.3s'
                      }}
                    >
                      {loading ? 'ANALYZING...' : <><Zap size={16} /> EXTRACT 3D MODEL</>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Text to 3D View
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Describe your dream house</h2>

                {loading ? (
                  <div style={{
                    height: '180px', borderRadius: '16px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(112,0,255,0.3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '16px', marginBottom: '30px'
                  }}>
                    <div style={{ width: '52px', height: '52px', border: '4px solid rgba(112,0,255,0.2)', borderTopColor: '#b266ff', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
                    <p style={{ margin: 0, color: '#b266ff', fontWeight: 700, fontSize: '1rem' }}>AI is designing your house...</p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>AI is crafting a 3D room layout from your prompt</p>
                  </div>
                ) : (
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Modern 2-bedroom house with a large open-plan living area, a wooden terrace, and minimalist interior..."
                    style={{
                      width: '100%', height: '180px', padding: '20px', borderRadius: '16px',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(112,0,255,0.3)',
                      color: 'white', fontSize: '1.1rem', resize: 'none', outline: 'none', marginBottom: '30px',
                      boxSizing: 'border-box'
                    }}
                  />
                )}

                <button
                  onClick={handleTextTo3D}
                  disabled={loading || prompt.length < 5}
                  style={{
                    padding: '18px 40px', borderRadius: '14px',
                    background: (loading || prompt.length < 5) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #7000ff, #b266ff)',
                    border: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 900,
                    cursor: (loading || prompt.length < 5) ? 'not-allowed' : 'pointer',
                    boxShadow: (loading || prompt.length < 5) ? 'none' : '0 10px 25px rgba(112,0,255,0.4)',
                    transition: '0.3s', opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'AI IS THINKING...' : <><Zap size={18} /> GENERATE 3D LAYOUT</>}
                </button>
              </div>
            )}
            
          </div>
        ) : (
          /* Success Results View */
          <div className="architect-glass-panel" style={{ padding: '0', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.3)', overflow: 'hidden', animation: 'slideUp 0.6s ease' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.15), transparent)', padding: '40px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}><CheckCircle size={40} color="#00ff88" /></div>
              <h2 style={{ margin: '0 0 10px', fontSize: '2rem', color: '#00ff88' }}>
                {activeTab === 'text' ? 'Layout Generated!' : 'Extraction Complete!'}
              </h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                {activeTab === 'text'
                  ? 'AI crafted a full 3D house layout from your description.'
                  : 'Our AI successfully detected boundaries and rebuilt the 3D model.'}
              </p>
            </div>
            
            <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '30px' }}>
              <div>
                <h3 style={{ margin: '0 0 20px', color: '#00ff88' }}>
                  {activeTab === 'text' ? 'AI Generation Report' : 'Model Analysis Report'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {result.rooms ? (
                    <>
                      <ReportBox icon={<Home size={22} />} label="Rooms Generated" val={result.rooms.length} />
                      <ReportBox icon={<Palette size={22} />} label="Style Profile" val={result.style || 'Modern'} />
                      <ReportBox icon={<Brain size={22} />} label="AI Engine" val="YOLO Model" />
                      <ReportBox icon={<Sparkles size={22} />} label="Source" val={result.source || (activeTab === 'text' ? 'Text Prompt' : 'Floor Plan')} />
                    </>
                  ) : result.parameters?.rooms ? (
                    <>
                      <ReportBox icon={<Home size={22} />} label="Rooms Labeled" val={result.parameters.rooms.length} />
                      <ReportBox icon={<Palette size={22} />} label="Style Profile" val={result.style || 'Modern'} />
                      <ReportBox icon={<Brain size={22} />} label="Walls Detected" val={result.parameters?.walls?.length || 0} />
                      <ReportBox icon={<Sparkles size={22} />} label="AI Engine" val="YOLO Model" />
                    </>
                  ) : (
                    <>
                      <ReportBox icon={<Brain size={22} />} label="Walls Detected" val={result.floorPlanData?.detectedWalls || result.parameters?.walls?.length || 0} />
                      <ReportBox icon={<Sparkles size={22} />} label="Est. Area" val={result.floorPlanData?.estimatedArea ? `${result.floorPlanData.estimatedArea} sq ft` : 'N/A'} />
                      <ReportBox icon={<Palette size={22} />} label="Style Profile" val={result.style} />
                      <ReportBox icon={<Zap size={22} />} label="Quality Class" val={result.budget} />
                    </>
                  )}
                </div>
                
                <h4 style={{ margin: '30px 0 15px', color: 'rgba(255,255,255,0.5)' }}>AI Suggestions & Notes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.suggestions?.map((sg, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '3px solid #00ff88' }}>
                      <span style={{ color: '#00ff88' }}>●</span> {sg}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button 
                  onClick={openIn3D} 
                  style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #00ff88, #00cc6a)', border: 'none', borderRadius: '16px', color: '#000', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,255,136,0.3)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Eye size={22} /> VIEW 3D MODEL
                </button>

                <button
                  onClick={() => setResult(null)}
                  style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  {activeTab === 'text' ? '✏️ Generate Another' : '📂 Upload Another Plan'}
                </button>
              </div>
            </div>
            <style>{`
              @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportBox({ icon, label, val }) {
  return (
    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: 'white', textTransform: 'capitalize' }}>{val}</p>
      </div>
    </div>
  );
}

export default AIDesigner;
