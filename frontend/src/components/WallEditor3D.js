/**
 * WallEditor3D.js
 * ────────────────
 * Interactive 3D wall correction tool.
 *
 * Feature summary (aligned with Agile Sprint 4):
 *  ① Renders AI-extracted walls from useState array
 *  ② Supports clicking walls to select + TransformControls gizmo
 *  ③ Grid-snapping prevents Z-Fighting (Interim Report §7.5)
 *  ④ Toolbar: Translate / Rotate / Scale / Delete / Add Wall
 *  ⑤ "Save Layout" saves corrected positions to MongoDB via API
 *
 * Props:
 *  initialWalls  Wall[]     Starting wall array from AI extraction
 *  initialPolygons Poly[]   Polygon floor slabs (read-only, for context)
 *  wallColor     string     Default wall hex colour
 *  wallHeight    number     Default wall height in units
 *  style         string     Design style (passed to save-layout)
 *  budget        string     Budget class (passed to save-layout)
 *  onSaved       fn(data)   Called when layout is saved successfully
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Sky, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';
import EditableWall from './EditableWall';

const API = 'http://localhost:5000';

// ── Polygon floor slabs (read-only reference layer) ───────────────────────

const ROOM_COLORS = [
  '#d4a574aa', '#a8c5a0aa', '#9bb5ccaa', '#d4c5a0aa',
  '#c5a0c0aa', '#a0c5c5aa', '#c5b5a0aa', '#b5a0c5aa',
];

function PolygonFloor({ points, colorIndex }) {
  const geo = useMemo(() => {
    if (!points || points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, points[i].z);
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [points]);
  if (!geo) return null;
  return (
    <mesh geometry={geo} position={[0, 0.05, 0]} receiveShadow>
      <meshStandardMaterial
        color={ROOM_COLORS[colorIndex % ROOM_COLORS.length]}
        roughness={0.9}
        side={THREE.DoubleSide}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

// ── Default new wall template ─────────────────────────────────────────────
const newWallTemplate = () => ({
  centerX:   0,
  centerZ:   0,
  length:    8,
  rotation:  0,
  thickness: 1.5,
  height:    5,
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function WallEditor3D({
  designId,
  initialWalls    = [],
  initialPolygons = [],
  wallColor       = '#d4c9b0',
  wallHeight      = 5,
  style           = 'modern',
  budget          = 'medium',
  originalWalls   = [],   // snapshot of AI walls BEFORE user edits (for delta analysis)
  onSaved,
}) {
  const { token, isAuthenticated } = useAuth();

  // ── 1. React state that stores all wall positions ──────────────────────
  const [walls,         setWalls]        = useState(() =>
    initialWalls.map(w => ({ ...w, height: wallHeight }))
  );
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [mode,          setMode]          = useState('translate');
  const [isDragging,    setIsDragging]    = useState(false);  // true while TransformControls drag
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState('');
  const [correctionAnalysis, setCorrectionAnalysis] = useState(null);
  const [designName,    setDesignName]    = useState('My Corrected Layout');
  const [snapSize]                        = useState(0.5);

  // ── 2. Wall update callback (called from EditableWall after drag) ──────
  const handleWallUpdate = useCallback((index, updatedWall) => {
    setWalls(prev => {
      const next = [...prev];
      next[index] = updatedWall;
      return next;
    });
  }, []);

  // ── 3. Add a new default wall (placed at origin) ──────────────────────
  const handleAddWall = () => {
    setWalls(prev => [...prev, { ...newWallTemplate(), height: wallHeight }]);
    setSelectedIndex(walls.length); // auto-select the new wall
  };

  // ── 4. Delete selected wall ───────────────────────────────────────────
  const handleDeleteWall = () => {
    if (selectedIndex === null) return;
    setWalls(prev => prev.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  };

  // ── 5. Save layout to MongoDB via /api/ai-designer/save-layout ────────
  const handleSave = async () => {
    if (!isAuthenticated) {
      setSaveMsg('⚠️ Please log in to save your layout.');
      return;
    }
    if (walls.length === 0) {
      setSaveMsg('⚠️ No walls to save.');
      return;
    }

    setSaving(true);
    setSaveMsg('');
    try {
      const payload = {
        designId,
        name:          designName,
        walls,
        originalWalls: originalWalls.length > 0 ? originalWalls : initialWalls, // for delta analysis
        polygons:      initialPolygons,
        style,
        budget,
      };

      const res = await fetch(`${API}/api/ai-designer/save-layout`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveMsg(`✅ Saved! (${walls.length} walls in MongoDB)`);
        if (data.correctionAnalysis) setCorrectionAnalysis(data.correctionAnalysis);
        onSaved?.(data);
      } else {
        setSaveMsg(`❌ ${data.error || 'Save failed.'}`);
      }
    } catch (err) {
      setSaveMsg('❌ Network error — please try again.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Field change from inspector inputs ─────────────────────────────────
  const handleFieldChange = useCallback((field, rawVal) => {
    if (selectedIndex === null) return;
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;
    setWalls(prev => {
      const next = [...prev];
      next[selectedIndex] = { ...next[selectedIndex], [field]: num };
      return next;
    });
  }, [selectedIndex]);

  // ── Deselect when clicking empty space ────────────────────────────────
  const handleCanvasClick = (e) => {
    // Only deselect if click was not on a wall mesh
    if (e.object?.type !== 'Mesh') setSelectedIndex(null);
  };

  const selectedWall = selectedIndex !== null ? walls[selectedIndex] : null;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap',
      }}>
        <span style={{ color: '#b266ff', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>
          🛠️ WALL EDITOR
        </span>

        {/* Mode buttons */}
        {['translate', 'rotate', 'scale'].map(m => (
          <ToolBtn key={m} active={mode === m} onClick={() => setMode(m)} disabled={selectedIndex === null}>
            {m === 'translate' ? '↔ Move' : m === 'rotate' ? '↺ Rotate' : '⤢ Scale'}
          </ToolBtn>
        ))}

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

        {/* Add / Delete */}
        <ToolBtn onClick={handleAddWall} accent="#00ff88">+ Add Wall</ToolBtn>
        <ToolBtn
          onClick={handleDeleteWall}
          disabled={selectedIndex === null}
          accent="#ff4466"
        >
          🗑 Delete
        </ToolBtn>

        <div style={{ flex: 1 }} />

        {/* Wall count badge */}
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
          {walls.length} walls
          {selectedIndex !== null && ` • Wall #${selectedIndex + 1} selected`}
        </span>

        {/* Save name input */}
        <input
          value={designName}
          onChange={e => setDesignName(e.target.value)}
          placeholder="Layout name…"
          style={{
            padding: '7px 12px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
            color: 'white', fontSize: '0.82rem', outline: 'none', width: '160px',
          }}
        />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !isAuthenticated}
          style={{
            padding: '8px 18px', borderRadius: '10px',
            background: saving ? 'rgba(255,255,255,0.08)' : 'linear-gradient(90deg,#7000ff,#b266ff)',
            border: 'none', color: saving ? 'rgba(255,255,255,0.4)' : 'white',
            fontWeight: 800, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(112,0,255,0.4)',
          }}
        >
          {saving ? 'Saving…' : '💾 Save Layout'}
        </button>
      </div>

      {/* ── Save message flash ────────────────────────────────────────── */}
      {saveMsg && (
        <div style={{
          padding: '8px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600,
          background: saveMsg.startsWith('✅') ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
          color:      saveMsg.startsWith('✅') ? '#00ff88'             : '#ff6677',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {saveMsg}
        </div>
      )}

      {/* ── Correction Analysis overlay ──────────────────────────────────── */}
      {correctionAnalysis && (
        <div style={{
          position: 'absolute', top: '60px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, width: '520px', maxWidth: '95vw',
          background: 'rgba(10,12,26,0.96)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(178,102,255,0.35)', borderRadius: '16px',
          padding: '22px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <div>
              <h3 style={{ margin:0, fontSize:'1rem', fontWeight:800, color:'#b266ff' }}>🧠 Correction Analysis</h3>
              <p style={{ margin:'4px 0 0', fontSize:'0.72rem', color:'rgba(255,255,255,0.4)' }}>
                AI prediction vs your corrections — model will learn from this
              </p>
            </div>
            <button onClick={() => setCorrectionAnalysis(null)} style={{
              background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:'8px', color:'rgba(255,255,255,0.5)', padding:'4px 10px',
              cursor:'pointer', fontSize:'0.8rem',
            }}>✕ Close</button>
          </div>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
            {[
              { label:'Original Walls', val: correctionAnalysis.originalWallCount, color:'#888' },
              { label:'Corrected Walls', val: correctionAnalysis.correctedWallCount, color:'#00d9ff' },
              { label:'Walls Moved', val: correctionAnalysis.wallsMoved, color: correctionAnalysis.wallsMoved > 0 ? '#ffb366' : '#00ff88' },
              { label:'Walls Added', val: correctionAnalysis.wallsAdded, color: correctionAnalysis.wallsAdded > 0 ? '#00ff88' : '#888' },
              { label:'Walls Removed', val: correctionAnalysis.wallsRemoved, color: correctionAnalysis.wallsRemoved > 0 ? '#ff6677' : '#888' },
              { label:'Avg Displacement', val: `${correctionAnalysis.avgDistanceMoved}u`, color:'#b266ff' },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'10px 12px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', marginBottom:'4px' }}>{s.label}</div>
                <div style={{ fontSize:'1.1rem', fontWeight:800, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Learned offset summary */}
          <div style={{ background:'rgba(0,217,255,0.06)', border:'1px solid rgba(0,217,255,0.2)', borderRadius:'10px', padding:'12px 14px' }}>
            <p style={{ margin:'0 0 8px', fontSize:'0.72rem', fontWeight:700, color:'#00d9ff', letterSpacing:'0.5px' }}>
              📐 LEARNED CORRECTION OFFSETS (applied to future AI predictions)
            </p>
            <div style={{ display:'flex', gap:'18px', flexWrap:'wrap' }}>
              {[
                { k:'Avg ΔX',  v: correctionAnalysis.deltas?.length > 0 ? (correctionAnalysis.deltas.reduce((s,d)=>s+d.deltaX,0)/correctionAnalysis.deltas.length).toFixed(2) : 0 },
                { k:'Avg ΔZ',  v: correctionAnalysis.deltas?.length > 0 ? (correctionAnalysis.deltas.reduce((s,d)=>s+d.deltaZ,0)/correctionAnalysis.deltas.length).toFixed(2) : 0 },
                { k:'Avg ΔLen',v: correctionAnalysis.avgLengthDelta?.toFixed(2) },
                { k:'Avg ΔRot',v: `${((correctionAnalysis.avgRotationDelta||0)*180/Math.PI).toFixed(1)}°` },
              ].map(o => (
                <div key={o.k} style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                  <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)' }}>{o.k}</span>
                  <span style={{ fontSize:'0.82rem', fontWeight:700, color:'white', background:'rgba(255,255,255,0.07)', padding:'2px 7px', borderRadius:'5px' }}>{o.v}</span>
                </div>
              ))}
            </div>
            <p style={{ margin:'10px 0 0', fontSize:'0.68rem', color:'rgba(255,255,255,0.35)' }}>
              ✅ These offsets are stored in MongoDB. Future AI extractions will be nudged toward your corrections automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── Main layout: canvas + inspector ──────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── 3D Canvas ─────────────────────────────────────────────── */}
        <div style={{ flex: 1 }}>
          <Canvas
            shadows
            onClick={handleCanvasClick}
            style={{ background: 'linear-gradient(180deg,#0a0c1a,#0d1035)' }}
          >
            <PerspectiveCamera makeDefault position={[40, 35, 55]} fov={50} />
            <Sky sunPosition={[100, 40, 100]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[25, 35, 20]} intensity={1.2} castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-70} shadow-camera-right={70}
              shadow-camera-top={70}  shadow-camera-bottom={-70}
            />

            {/* Reference grid — helps visually confirm snapping */}
            <Grid
              args={[140, 140]}
              cellSize={snapSize * 2}       // visible grid = snap grid * 2
              cellThickness={0.5}
              cellColor="#334455"
              sectionSize={10}
              sectionThickness={1}
              sectionColor="#445566"
              fadeDistance={120}
              position={[0, 0.01, 0]}
            />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[160, 160]} />
              <meshStandardMaterial color="#1a2030" roughness={1} />
            </mesh>

            {/* Polygon floor slabs (read-only AI context layer) */}
            {initialPolygons.map((poly, i) => (
              <PolygonFloor key={`poly-${i}`} points={poly.points} colorIndex={i} />
            ))}

            {/* ── Editable walls (React state array) ─────────────────── */}
            {walls.map((wall, i) => (
              <EditableWall
                key={`wall-${i}`}
                wall={wall}
                index={i}
                isSelected={selectedIndex === i}
                mode={mode}
                snapSize={snapSize}
                wallColor={wallColor}
                onSelect={setSelectedIndex}
                onUpdate={handleWallUpdate}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            ))}

            {/* OrbitControls — disabled while TransformControls is being dragged */}
            <OrbitControls
              makeDefault
              target={[0, 2, 0]}
              enabled={!isDragging}
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={150}
              maxPolarAngle={Math.PI / 2.05}
            />
          </Canvas>
        </div>

        {/* ── Inspector Sidebar ──────────────────────────────────────── */}
        <div style={{
          width: '220px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '16px',
          overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>
            INSPECTOR
          </p>

          {selectedWall ? (
            <>
              {/* Read-only wall number */}
              <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.04)', paddingBottom:'7px' }}>
                <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)' }}>Wall #</span>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#00d9ff' }}>{selectedIndex + 1}</span>
              </div>

              {/* Editable numeric fields */}
              <InspField label="Center X"  value={selectedWall.centerX}  field="centerX"   step={0.5}  onChange={handleFieldChange} />
              <InspField label="Center Z"  value={selectedWall.centerZ}  field="centerZ"   step={0.5}  onChange={handleFieldChange} />
              <InspField label="Length"    value={selectedWall.length}    field="length"    step={0.5}  min={0.5} onChange={handleFieldChange} />
              <InspField
                label="Rotation °"
                value={+((selectedWall.rotation ?? 0) * 180 / Math.PI).toFixed(1)}
                field="rotation"
                step={15}
                onChange={(field, deg) => handleFieldChange('rotation', deg * Math.PI / 180)}
              />
              <InspField label="Thickness" value={selectedWall.thickness} field="thickness" step={0.1} min={0.1} onChange={handleFieldChange} />
              <InspField label="Height"    value={selectedWall.height}    field="height"    step={0.5} min={0.5} onChange={handleFieldChange} />

              <div style={{ marginTop:'6px', padding:'9px', background:'rgba(0,217,255,0.07)', borderRadius:'10px', border:'1px solid rgba(0,217,255,0.18)'}}>
                <p style={{ margin:0, fontSize:'0.7rem', color:'#00d9ff', lineHeight:1.5 }}>
                  ✦ Type values above <b>or</b> drag the gizmo handles in the 3D view.
                  Grid snapping (0.5u) is active.
                </p>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
              Click a wall in the 3D view to inspect and edit it.
            </p>
          )}

          {/* Wall list */}
          <div style={{ marginTop: '8px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>
              ALL WALLS
            </p>
            {walls.map((w, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                style={{
                  width: '100%', padding: '7px 10px', marginBottom: '4px',
                  borderRadius: '8px', textAlign: 'left',
                  background: selectedIndex === i ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedIndex === i ? 'rgba(0,217,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  color: selectedIndex === i ? '#00d9ff' : 'rgba(255,255,255,0.6)',
                  fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                Wall {i + 1} — {w.length?.toFixed(1)}u
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small sub-components ────────────────────────────────────────────────────
// ── Sub-components ────────────────────────────────────────────────────────
function ToolBtn({ children, active, onClick, disabled, accent = '#b266ff' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 14px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 700,
        border:     `1px solid ${active ? accent : 'rgba(255,255,255,0.12)'}`,
        background: active ? `${accent}22` : 'rgba(255,255,255,0.05)',
        color:      active ? accent : disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
        cursor:     disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

/**
 * InspField — editable numeric inspector row.
 * Pressing Enter or blurring the input commits the value.
 */
function InspField({ label, value, field, step = 0.1, min, onChange }) {
  const [draft, setDraft] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  // Keep draft in sync with external value when not focused
  const displayVal = focused ? draft : (typeof value === 'number' ? +value.toFixed(3) : value ?? '');

  const commit = () => {
    const num = parseFloat(draft);
    if (!isNaN(num)) {
      const clamped = min !== undefined ? Math.max(min, num) : num;
      onChange(field, clamped);
    }
    setFocused(false);
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.04)', paddingBottom:'7px', gap:'6px' }}>
      <label style={{ fontSize:'0.73rem', color:'rgba(255,255,255,0.45)', flexShrink:0 }}>{label}</label>
      <input
        type="number"
        step={step}
        min={min}
        value={focused ? draft : displayVal}
        onFocus={() => { setDraft(String(displayVal)); setFocused(true); }}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') { commit(); e.target.blur(); } if (e.key === 'Escape') { setFocused(false); } }}
        style={{
          width: '80px', padding: '4px 7px', borderRadius: '7px', textAlign: 'right',
          background: focused ? 'rgba(0,217,255,0.1)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${focused ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
          color: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none',
          transition: 'all 0.15s',
        }}
      />
    </div>
  );
}
