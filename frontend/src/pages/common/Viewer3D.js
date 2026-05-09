import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HouseModel3D from '../../components/HouseModel3D';
import WallEditor3D from '../../components/WallEditor3D';
import AIDesignRenderer from '../../components/AIDesignRenderer';
import '../../styles/Viewer3D.css';

const STYLE_COLORS = {
  modern:       '#d4dde8',
  minimalist:   '#f0ede8',
  luxury:       '#e8dcc8',
  industrial:   '#c0b8b0',
  scandinavian: '#e8e4dc',
  traditional:  '#d8c8b0',
  bohemian:     '#d4c4a8',
};

function Viewer3D() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAI = !!location.state?.aiExtracted;

  const [modelData,  setModelData]  = useState(null);
  const [parameters, setParameters] = useState(null);
  const [finishes,   setFinishes]   = useState(null);
  const [polygons,   setPolygons]   = useState(null);
  const [walls,      setWalls]      = useState(null);
  const [doors,      setDoors]      = useState(null);
  const [windows,    setWindows]    = useState(null);
  const [aiMeta,     setAiMeta]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [wallHeight, setWallHeight] = useState(3.5);
  const [wallColor,  setWallColor]  = useState('#1a202c');
  const [editMode,   setEditMode]   = useState(false);
  const [isTextTo3D, setIsTextTo3D] = useState(false);
  const [showRoof,   setShowRoof]   = useState(true);
  const [savedMsg,   setSavedMsg]   = useState('');

  useEffect(() => {
    if (location.state) {
      const { modelData: md, parameters: p, finishes: f, design, aiExtracted, isTextTo3D: t3d } = location.state;

      if (t3d) {
        setIsTextTo3D(true);
        setParameters(p);
        setShowRoof(false); // Default to NO ROOF for AI generation
        setAiMeta({
          style: p.style || 'modern',
          rooms: p.rooms?.length || 0,
          source: p.source === 'gemini-vision-image'
            ? '👁️ Gemini Vision (Floor Plan Image)'
            : '🤖 Gemini AI (Text-to-3D)',
        });
        setLoading(false);
        return;
      }

      if (aiExtracted && p) {
        const poly      = p.polygons || [];
        const wallArr   = p.walls    || [];
        const doorArr   = p.doors    || [];
        const windowArr = p.windows  || [];
        setPolygons(poly.length     > 0 ? poly      : null);
        setWalls(wallArr.length     > 0 ? wallArr   : null);
        setDoors(doorArr.length     > 0 ? doorArr   : null);
        setWindows(windowArr.length > 0 ? windowArr : null);
        setParameters(p);
        setShowRoof(false); // Default to NO ROOF for AI generation
        setAiMeta({
          wallsDetected:   wallArr.length,
          doorsDetected:   doorArr.length,
          windowsDetected: windowArr.length,
          detectionCount:  poly.length,
          style:     p.style     || 'modern',
          totalArea: p.totalArea,
          rooms:     p.rooms     || [],
        });
        const detectedStyle = (p.style || 'modern').toLowerCase();
        setWallColor(STYLE_COLORS[detectedStyle] || STYLE_COLORS.modern);
        setModelData(null);
        setFinishes(null);

      } else if (design) {
        setModelData(design.modelData);
        setParameters(design.parameters);
        setFinishes(design.finishes);
      } else {
        setModelData(md);
        setParameters(p);
        setFinishes(f);
        if (f?.roofType === 'none') setShowRoof(false);
      }
    } else {
      setModelData(generateDefaultModel());
      setParameters({ bedrooms: 3, bathrooms: 2, kitchen: true, livingRoom: true, totalArea: 2000, floors: 1, style: 'modern' });
      setFinishes({ wallColor: '#ffffff', floorType: 'tile', roofType: 'sloped' });
    }
    setLoading(false);
  }, [location]);

  const generateDefaultModel = () => ({
    rooms: [
      { type: 'living',   position: { x: 0,   y: 0, z: 0    }, dimensions: { width: 6,   height: 3, depth: 5   } },
      { type: 'kitchen',  position: { x: 6.5, y: 0, z: 0    }, dimensions: { width: 4,   height: 3, depth: 4   } },
      { type: 'bedroom',  position: { x: 0,   y: 0, z: -5.5 }, dimensions: { width: 4,   height: 3, depth: 4   } },
      { type: 'bedroom',  position: { x: 4.5, y: 0, z: -5.5 }, dimensions: { width: 4,   height: 3, depth: 4   } },
      { type: 'bathroom', position: { x: 9,   y: 0, z: -5.5 }, dimensions: { width: 2.5, height: 3, depth: 2.5 } },
    ],
    style: 'modern',
    metadata: { totalRooms: 5, totalArea: 2000, floors: 1 },
  });


  if (loading) {
    return (
      <div className="viewer-loading">
        <div className="loading-spinner" />
        <p>Loading 3D Model...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0c1a 0%, #0d1035 100%)', color: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ── */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
            ← Back
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
              {isAI ? '🤖 AI Floor Plan → 3D' : '🏠 3D House Viewer'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
              {isAI
                ? `${walls?.length || 0} wall segments • ${polygons?.length || 0} room polygons`
                : `${modelData?.rooms?.length || 0} rooms • Parametric`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap:'10px', alignItems:'center' }}>
          {isAI && (
            <span style={{ padding: '4px 12px', background: 'rgba(112,0,255,0.2)', border: '1px solid #7000ff55', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#b266ff' }}>
              ✨ AI EXTRACTED
            </span>
          )}
          {/* Edit mode toggle — only for AI-extracted scenes */}
          {isAI && (
            <button
              id="btn-edit-walls"
              onClick={() => { setEditMode(p => !p); setSavedMsg(''); }}
              style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${editMode ? '#00ff8866' : 'rgba(255,255,255,0.12)'}`, background: editMode ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.06)', color: editMode ? '#00ff88' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
            >
              {editMode ? '👁 View Mode' : '✏️ Correct Walls'}
            </button>
          )}
          {!editMode && (
            <button
              onClick={() => setAutoRotate(p => !p)}
              style={{ padding: '8px 16px', borderRadius: '10px', border: `1px solid ${autoRotate ? '#00d9ff66' : 'rgba(255,255,255,0.12)'}`, background: autoRotate ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.06)', color: autoRotate ? '#00d9ff' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              {autoRotate ? '⏸ Stop' : '▶ Rotate'}
            </button>
          )}
        </div>
      </div>

      {/* ── Save notification flash ── */}
      {savedMsg && (
        <div style={{ padding: '8px 20px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', background: 'rgba(0,255,136,0.1)', color: '#00ff88', borderBottom: '1px solid rgba(0,255,136,0.2)' }}>
          {savedMsg}
        </div>
      )}

      {/* ── Main Layout ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── 3D Canvas / Editor ── */}
        <div style={{ flex: 1, position: 'relative', minHeight: '500px' }}>

          {/* EDIT MODE — interactive WallEditor3D */}
          {isAI && editMode ? (
            <WallEditor3D
              designId={location.state?.design?._id || location.state?.design?.id}
              initialWalls={walls    || []}
              initialPolygons={polygons || []}
              originalWalls={parameters?.originalWalls || walls || []}
              wallColor={wallColor}
              wallHeight={wallHeight}
              style={parameters?.style  || 'modern'}
              budget={parameters?.budget || 'medium'}
              onSaved={(data) => {
                setSavedMsg(`✅ Layout saved! (${data.data?.parameters?.walls?.length || 0} walls)`);
                setEditMode(false);
                if (data.data?.parameters) {
                  setParameters(data.data.parameters);
                  if (data.data.parameters.walls) setWalls(data.data.parameters.walls);
                }
              }}
            />
          ) : (
            /* VIEW MODE — read-only HouseModel3D */
            <>
              {(isTextTo3D || isAI) ? (
                <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
                  <HouseModel3D.CanvasWrapper autoRotate={autoRotate}>
                    <AIDesignRenderer data={parameters} autoRotate={autoRotate} showRoof={showRoof} />
                  </HouseModel3D.CanvasWrapper>
                </div>
              ) : (
                <HouseModel3D
                  rooms={parameters?.rooms || []}
                  doors={doors || []}
                  windows={windows || []}
                  wallColor={wallColor}
                  autoRotate={autoRotate}
                />
              )}
              {/* Controls hint */}
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', padding: '12px 16px', background: 'rgba(0,0,0,0.55)', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                🖱 Drag → Rotate &nbsp;|&nbsp; Scroll → Zoom &nbsp;|&nbsp; Right drag → Pan
                {isAI && <><br/>✏️ Click <b style={{color:'#00ff88'}}>Correct Walls</b> above to fix AI misplacements</>}
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ width: '280px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* AI meta */}
          {isAI && aiMeta && (
            <div style={{ padding: '18px', background: 'rgba(112,0,255,0.1)', border: '1px solid rgba(112,0,255,0.25)', borderRadius: '14px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', color: '#b266ff' }}>🤖 AI ANALYSIS</h3>
              <SideRow label="Wall Segments"   val={aiMeta.wallsDetected} />
              <SideRow label="Doors Detected"   val={aiMeta.doorsDetected   || 0} />
              <SideRow label="Windows Detected" val={aiMeta.windowsDetected || 0} />
              <SideRow label="Room Polygons"    val={aiMeta.detectionCount} />
              {aiMeta.totalArea && <SideRow label="Est. Area"    val={aiMeta.totalArea} />}
              {aiMeta.rooms?.length > 0 && <SideRow label="Rooms" val={aiMeta.rooms.join(', ')} />}
            </div>
          )}

          {/* Wall height (AI) */}
          {isAI && (
            <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255,255,255,0.65)' }}>WALL SETTINGS</h3>
              <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', display: 'block' }}>Height: {wallHeight}m</label>
              <input type="range" min="1.5" max="15" step="0.25" value={wallHeight} onChange={e => setWallHeight(+e.target.value)} style={{ width: '100%', accentColor: '#b266ff' }} />
              <p style={{ margin: '14px 0 8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>Wall Color</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(STYLE_COLORS).map(([s, c]) => (
                  <button key={s} onClick={() => setWallColor(c)} title={s}
                    style={{ width: '26px', height: '26px', borderRadius: '7px', background: c, border: `2px solid ${wallColor === c ? '#b266ff' : 'transparent'}`, cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          )}

          {/* Text-to-3D meta */}
          {isTextTo3D && aiMeta && (
            <div style={{ padding: '18px', background: 'rgba(112,0,255,0.1)', border: '1px solid #7000ff44', borderRadius: '14px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', color: '#b266ff' }}>✨ AI GENERATED LAYOUT</h3>
              <SideRow label="Rooms Generated" val={aiMeta.rooms} />
              <SideRow label="Style" val={aiMeta.style} />
              <SideRow label="Source" val={aiMeta.source} />
            </div>
          )}

          {/* Standard info */}
          {!isAI && !isTextTo3D && (
            <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255,255,255,0.65)' }}>DESIGN INFO</h3>
              <SideRow label="Bedrooms"   val={parameters?.bedrooms  || 0} />
              <SideRow label="Bathrooms"  val={parameters?.bathrooms || 0} />
              <SideRow label="Total Area" val={`${parameters?.totalArea || 0} sq ft`} />
              <SideRow label="Floors"     val={parameters?.floors || 1} />
              <SideRow label="Style"      val={parameters?.style  || 'Modern'} />
            </div>
          )}

          {/* Roof Control Toggle */}
          <div style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255,255,255,0.65)' }}>VISUALS</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>Show Roof / Ceiling</span>
              <button 
                onClick={() => setShowRoof(!showRoof)}
                style={{ 
                  width: '44px', height: '22px', borderRadius: '11px', 
                  background: showRoof ? '#7000ff' : 'rgba(255,255,255,0.1)', 
                  border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s' 
                }}
              >
                <div style={{ 
                  position: 'absolute', top: '2px', left: showRoof ? '24px' : '2px', 
                  width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: '0.3s' 
                }} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            {isAI ? (
              <button onClick={() => navigate('/ai-designer')}
                style={{ width: '100%', padding: '12px', background: 'rgba(112,0,255,0.15)', border: '1px solid rgba(112,0,255,0.35)', color: '#b266ff', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
                ← Upload Another Plan
              </button>
            ) : (
              <button onClick={() => navigate('/designer', { state: { parameters, finishes } })}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,217,255,0.12)', border: '1px solid rgba(0,217,255,0.3)', color: '#00d9ff', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
                ✏️ Edit Design
              </button>
            )}
            <button onClick={() => alert('Export as GLB/OBJ — Coming soon!')}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
              📥 Export Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideRow({ label, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.42)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', maxWidth: '150px', textAlign: 'right', wordBreak: 'break-word' }}>{val}</span>
    </div>
  );
}

export default Viewer3D;
