import React, { useState, useRef, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, RoundedBox, Grid, Float } from '@react-three/drei';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, Home, Move, Eye, Monitor, 
  Layers, Square, Box, Palette, Folder, Scaling, 
  RotateCcw, Copy, Info, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/FurnitureCustomizer.css';

// ─────────────────────────────────────────────────────────────
// 1. ADVANCED 3D FURNITURE MODELS
// ─────────────────────────────────────────────────────────────

const FurnitureModel = ({ width, depth, color, position, rotation, type, room }) => {
    const pos = [position.x - room.width / 2, 0, position.z - room.length / 2];
    const rot = -rotation * (Math.PI / 180);

    const renderModel = () => {
        switch (type) {
            case 'table':
                const tw = width, td = depth; return (
                    <group>
                        <RoundedBox args={[tw, 0.05, td]} radius={0.02} position={[0, 0.725, 0]} castShadow receiveShadow>
                            <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
                        </RoundedBox>
                        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
                            <mesh key={i} position={[lx * (tw / 2 - 0.05), 0.35, lz * (td / 2 - 0.05)]} castShadow>
                                <boxGeometry args={[0.04, 0.7, 0.04]} />
                                <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                            </mesh>
                        ))}
                    </group>
                );
            case 'sofa':
                return (
                    <group>
                        <RoundedBox args={[width, 0.4, depth]} radius={0.05} position={[0, 0.2, 0]} castShadow receiveShadow>
                            <meshStandardMaterial color={color} roughness={0.8} />
                        </RoundedBox>
                        <RoundedBox args={[width, 0.6, 0.2]} radius={0.1} position={[0, 0.5, -depth / 2 + 0.1]} castShadow>
                            <meshStandardMaterial color={color} roughness={0.8} />
                        </RoundedBox>
                        <RoundedBox args={[0.2, 0.5, depth]} radius={0.05} position={[-width / 2 + 0.1, 0.3, 0]} castShadow>
                            <meshStandardMaterial color={color} roughness={0.8} />
                        </RoundedBox>
                        <RoundedBox args={[0.2, 0.5, depth]} radius={0.05} position={[width / 2 - 0.1, 0.3, 0]} castShadow>
                            <meshStandardMaterial color={color} roughness={0.8} />
                        </RoundedBox>
                    </group>
                );
            case 'bed':
                return (
                    <group>
                        <RoundedBox args={[width, 0.3, depth]} radius={0.02} position={[0, 0.15, 0]} castShadow receiveShadow>
                            <meshStandardMaterial color="#222" roughness={0.9} />
                        </RoundedBox>
                        <RoundedBox args={[width - 0.1, 0.2, depth - 0.1]} radius={0.08} position={[0, 0.3, 0]} castShadow>
                            <meshStandardMaterial color={color} roughness={1} />
                        </RoundedBox>
                        <RoundedBox args={[width, 0.9, 0.1]} radius={0.05} position={[0, 0.45, -depth / 2 + 0.05]} castShadow>
                            <meshStandardMaterial color="#111" />
                        </RoundedBox>
                    </group>
                );
            case 'tv_unit':
                return (
                    <group>
                        <RoundedBox args={[width, 0.3, depth]} radius={0.02} position={[0, 0.25, 0]} castShadow receiveShadow><meshStandardMaterial color={color} /></RoundedBox>
                        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
                            <mesh key={i} position={[lx * (width / 2 - 0.1), 0.05, lz * (depth / 2 - 0.1)]} castShadow>
                                <cylinderGeometry args={[0.02, 0.01, 0.1]} />
                                <meshStandardMaterial color="#111" />
                            </mesh>
                        ))}
                        <RoundedBox args={[1.5, 0.8, 0.05]} radius={0.01} position={[0, 0.8, -depth / 2 + 0.1]} castShadow><meshStandardMaterial color="#0a0a0a" roughness={0.1} /></RoundedBox>
                        <mesh position={[0, 0.8, -depth / 2 + 0.12]}><planeGeometry args={[1.4, 0.7]} /><meshBasicMaterial color="#020817" /></mesh>
                    </group>
                );
            case 'wardrobe':
                return (
                    <group>
                        <RoundedBox args={[width, 2.0, depth]} radius={0.02} position={[0, 1.0, 0]} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.4} /></RoundedBox>
                        <mesh position={[0, 1.0, depth / 2 + 0.01]}><boxGeometry args={[0.01, 1.9, 0.01]} /><meshStandardMaterial color="#00000033" /></mesh>
                        <mesh position={[-0.05, 1.0, depth / 2 + 0.02]}><sphereGeometry args={[0.02]} /><meshStandardMaterial color="#888" metalness={1} /></mesh>
                        <mesh position={[0.05, 1.0, depth / 2 + 0.02]}><sphereGeometry args={[0.02]} /><meshStandardMaterial color="#888" metalness={1} /></mesh>
                    </group>
                );
            case 'desktop':
                return (
                  <group>
                    <RoundedBox args={[width, 0.05, depth]} radius={0.01} position={[0, 0.75, 0]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
                    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
                        <mesh key={i} position={[lx * (width / 2 - 0.04), 0.375, lz * (depth / 2 - 0.04)]} castShadow>
                            <boxGeometry args={[0.03, 0.75, 0.03]} />
                            <meshStandardMaterial color="#1a1a1a" />
                        </mesh>
                    ))}
                    <RoundedBox args={[0.5, 0.3, 0.04]} radius={0.01} position={[0, 1.0, -depth/2 + 0.1]} castShadow><meshStandardMaterial color="#111" /></RoundedBox>
                    <mesh position={[0, 0.85, -depth/2 + 0.1]}><cylinderGeometry args={[0.02, 0.02, 0.2]} /><meshStandardMaterial color="#333" /></mesh>
                  </group>
                )
            case 'chair':
                return (
                    <group>
                        <RoundedBox args={[width, 0.05, depth]} radius={0.02} position={[0, 0.45, 0]} castShadow receiveShadow><meshStandardMaterial color={color} /></RoundedBox>
                        <RoundedBox args={[width, 0.5, 0.05]} radius={0.02} position={[0, 0.7, -depth / 2 + 0.025]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
                        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([lx, lz], i) => (
                            <mesh key={i} position={[lx * (width / 2 - 0.03), 0.225, lz * (depth / 2 - 0.03)]} castShadow><cylinderGeometry args={[0.02, 0.015, 0.45]} /><meshStandardMaterial color="#000" /></mesh>
                        ))}
                    </group>
                );
            case 'lamp':
                return (
                    <group>
                        <mesh position={[0, 0.9, 0]} castShadow><cylinderGeometry args={[0.015, 0.015, 1.8]} /><meshStandardMaterial color="#222" /></mesh>
                        <mesh position={[0, 0.02, 0]} receiveShadow><cylinderGeometry args={[0.2, 0.2, 0.04]} /><meshStandardMaterial color="#111" /></mesh>
                        <mesh position={[0, 1.7, 0]} castShadow><coneGeometry args={[0.25, 0.4, 32]} /><meshStandardMaterial color="#ffcc33" emissive="#ffcc33" emissiveIntensity={1.5} /></mesh>
                        <pointLight position={[0, 1.7, 0]} intensity={1.5} color="#ffaa00" distance={8} />
                    </group>
                );
            case 'plant':
                return (
                  <group>
                    <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.15, 0.1, 0.4, 16]} /><meshStandardMaterial color="#5d4037" /></mesh>
                    <mesh position={[0, 0.6, 0]} castShadow><sphereGeometry args={[0.3, 16, 16]} /><meshStandardMaterial color={color} roughness={1} /></mesh>
                    <mesh position={[-0.1, 0.5, 0.1]} castShadow><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={color} /></mesh>
                  </group>
                );
            case 'rug':
                return (
                    <mesh position={[0, 0.01, 0]} receiveShadow><boxGeometry args={[width, 0.02, depth]} /><meshStandardMaterial color={color} roughness={0.9} transparent opacity={0.8} /></mesh>
                );
            default:
                return (
                    <RoundedBox args={[width, 0.5, depth]} radius={0.05} position={[0, 0.25, 0]} castShadow>
                        <meshStandardMaterial color={color} />
                    </RoundedBox>
                );
        }
    };

    return (
        <group position={pos} rotation={[0, rot, 0]}>
            {renderModel()}
        </group>
    );
};

// ─────────────────────────────────────────────────────────────
// 2. CONSTANTS & DATA
// ─────────────────────────────────────────────────────────────

const FURNITURE_CATALOG = [
    { type: 'sofa', name: 'Premium Sofa', icon: '🛋️', width: 2.2, depth: 1.0, color: '#4a5568' },
    { type: 'table', name: 'Oak Dining Table', icon: '🍽️', width: 1.8, depth: 0.9, color: '#634b3a' },
    { type: 'bed', name: 'King Size Bed', icon: '🛏️', width: 2.0, depth: 2.1, color: '#edf2f7' },
    { type: 'wardrobe', name: 'Sleek Wardrobe', icon: '🚪', width: 1.6, depth: 0.6, color: '#718096' },
    { type: 'tv_unit', name: 'Cinema TV Unit', icon: '📺', width: 1.8, depth: 0.4, color: '#1a202c' },
    { type: 'desktop', name: 'Developer PC Setup', icon: '🖥️', width: 1.4, depth: 0.7, color: '#2d3748' },
    { type: 'chair', name: 'Eames Chair', icon: '💺', width: 0.6, depth: 0.6, color: '#e53e3e' },
    { type: 'lamp', name: 'Modern Floor Lamp', icon: '💡', width: 0.4, depth: 0.4, color: '#ffcc33' },
    { type: 'plant', name: 'Indoor Ficus', icon: '🪴', width: 0.5, depth: 0.5, color: '#48bb78' },
    { type: 'rug', name: 'Texture Area Rug', icon: '🔲', width: 3.0, depth: 4.0, color: '#8b5e3c' },
];

// ─────────────────────────────────────────────────────────────
// 3. MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function FurnitureCustomizer() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const svgRef = useRef(null);

    const [view, setView] = useState('dashboard');
    const [viewMode, setViewMode] = useState('2d');
    const [room, setRoom] = useState({ width: 8, length: 8, wallColor: '#2d2d2d' });
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [designName, setDesignName] = useState('My New Room');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoveredId, setHoveredId] = useState(null);
    const [notif, setNotif] = useState(null);
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [activeDesignId, setActiveDesignId] = useState(null);

    const showNotif = (msg, type='success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const fetchDesigns = async () => {
        try {
            const res = await api.get('/furniture/my-designs');
            if (res.success) setSavedDesigns(res.data);
        } catch (err) {
            console.error('Failed to sync vault:', err);
        }
    };

    const location = useLocation();

    useEffect(() => {
        fetchDesigns();
        
        // Load AI Data if redirected from AI Designer
        if (location.state?.fromAI && location.state?.aiData) {
            const aiData = location.state.aiData;
            if (aiData.rooms && Array.isArray(aiData.rooms)) {
                const newItems = [];
                // Calculate total bounds to set room size
                let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
                
                aiData.rooms.forEach((r, idx) => {
                    const [rw, , rd] = r.size;
                    const [rx, , rz] = r.position;
                    // World bounds
                    minX = Math.min(minX, rx - rw/2);
                    maxX = Math.max(maxX, rx + rw/2);
                    minZ = Math.min(minZ, rz - rd/2);
                    maxZ = Math.max(maxZ, rz + rd/2);

                    // Add items for this room type
                    const type = r.type.toLowerCase();
                    const roomItems = [];
                    
                    if (type.includes('living')) {
                        roomItems.push({ type: 'sofa', x: rx + rw * 0.22, z: rz - rd * 0.32, w: 1.6 * (Math.min(rw, rd)*0.25), d: 0.7 * (Math.min(rw, rd)*0.25), color: '#4a5568' });
                        roomItems.push({ type: 'tv_unit', x: rx, z: rz + rd * 0.4, w: 1.5, d: 0.4, color: '#1a202c' });
                    } else if (type.includes('bedroom')) {
                        roomItems.push({ type: 'bed', x: rx + rw * 0.18, z: rz - rd * 0.1, w: 2.0, d: 2.1, color: '#4a5568' });
                    } else if (type.includes('dining')) {
                        roomItems.push({ type: 'table', x: rx + rw * 0.12, z: rz, w: 1.8, d: 1.0, color: '#634b3a' });
                    }
                    
                    roomItems.forEach((ri, i) => {
                        newItems.push({
                            id: `ai-${idx}-${i}`,
                            type: ri.type,
                            name: `AI ${ri.type}`,
                            x: ri.x,
                            z: ri.z,
                            rotation: 0,
                            color: ri.color,
                            width: ri.w || 1,
                            depth: ri.d || 1
                        });
                    });
                });

                const totalW = Math.max(10, maxX - minX + 4);
                const totalL = Math.max(10, maxZ - minZ + 4);
                
                setRoom({ width: totalW, length: totalL, wallColor: '#2d2d2d' });
                // Shift items to be relative to the new origin (positive coordinates)
                const shiftedItems = newItems.map(item => ({
                    ...item,
                    x: item.x - minX + 2,
                    z: item.z - minZ + 2
                }));
                setItems(shiftedItems);
                setDesignName(`AI Generated: ${aiData.style || 'Modern'}`);
                showNotif("AI Design Loaded for Editing!");
            }
        }
    }, [location.state]);

    const getMousePosition = (e) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const CTM = svgRef.current.getScreenCTM();
        if (!CTM) return { x: 0, y: 0 };
        const x = (e.clientX - CTM.e) / CTM.a;
        const y = (e.clientY - CTM.f) / CTM.d;
        return { x, y };
    };

    const addItem = (catItem) => {
        const newItem = {
            id: Date.now().toString(),
            type: catItem.type,
            name: catItem.name,
            x: room.width / 2,
            z: room.length / 2,
            rotation: 0,
            color: catItem.color,
            width: catItem.width,
            depth: catItem.depth,
        };
        setItems(prev => [...prev, newItem]);
        setSelectedId(newItem.id);
        showNotif(`${catItem.name} initialized`);
    };

    const handlePointerDown = (e, item) => {
        e.stopPropagation();
        setSelectedId(item.id);
        setIsDragging(true);
        const point = getMousePosition(e);
        setDragOffset({ x: point.x - item.x, y: point.y - item.z });
    };

    const handlePointerMove = (e) => {
        if (!isDragging || !selectedId) return;
        const point = getMousePosition(e);
        const newX = Math.round((point.x - dragOffset.x) * 20) / 20;
        const newZ = Math.round((point.y - dragOffset.y) * 20) / 20;
        const constrainedX = Math.max(0, Math.min(room.width, newX));
        const constrainedZ = Math.max(0, Math.min(room.length, newZ));

        setItems(prev => prev.map(item => 
          item.id === selectedId ? { ...item, x: constrainedX, z: constrainedZ } : item
        ));
    };

    const rotateItem = (id) => {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, rotation: (item.rotation + 45) % 360 } : item
        ));
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
        setSelectedId(null);
        showNotif('Component destroyed', 'error');
    };

    const duplicateItem = (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        const newItem = { ...item, id: Date.now().toString(), x: item.x + 0.2, z: item.z + 0.2 };
        setItems(prev => [...prev, newItem]);
        setSelectedId(newItem.id);
        showNotif('Asset cloned');
    };

    const handleSaveDesign = async () => {
        const customName = prompt("Enter a name for this design:", designName);
        if (!customName) return;

        try {
            let res;
            if (activeDesignId) {
                res = await api.put(`/furniture/update/${activeDesignId}`, { name: customName, room, items });
            } else {
                res = await api.post('/furniture/save', { name: customName, room, items });
            }

            if (res.success) {
                showNotif(activeDesignId ? 'Vault Record Synchronized' : 'Design Committed to Vault');
                fetchDesigns();
                setView('dashboard');
                setActiveDesignId(null);
            }
        } catch (err) {
            console.error('Sync Error:', err);
            const errMsg = err.response?.data?.error || err.message || 'Unknown Network Error';
            showNotif(`Synchronization Failure: ${errMsg}`, 'error');
        }
    };

    const selectedItem = items.find(i => i.id === selectedId);

    const Catalog = () => (
      <div className="sidebar-content studio-scrollbar">
        <div className="section-label"><Plus size={14} /> Catalog Assets</div>
        {FURNITURE_CATALOG.map(cat => (
          <div key={cat.type} className="catalog-card" onClick={() => addItem(cat)}>
             <div className="catalog-icon">{cat.icon}</div>
             <div className="catalog-info">
                <h4>{cat.name}</h4>
                <span>{cat.width}m × {cat.depth}m</span>
             </div>
             <div style={{ marginLeft:'auto', opacity:0.3 }}><Plus size={16} /></div>
          </div>
        ))}
      </div>
    );

    const Settings = () => (
      <div className="sidebar-content">
        <div className="section-label"><Scaling size={14} /> Spatial Studio</div>
        <div className="param-group">
           <div className="param-grid">
              <div>
                <span className="section-label" style={{marginBottom:4, opacity:0.6}}>Width (m)</span>
                <input className="param-input" type="number" step="0.5" value={room.width} onChange={e => setRoom(p=>({...p, width: parseFloat(e.target.value)||2}))} />
              </div>
              <div>
                <span className="section-label" style={{marginBottom:4, opacity:0.6}}>Length (m)</span>
                <input className="param-input" type="number" step="0.5" value={room.length} onChange={e => setRoom(p=>({...p, length: parseFloat(e.target.value)||2}))} />
              </div>
           </div>
        </div>
        <div className="section-label"><Palette size={14} /> Render Appearance</div>
        <div className="param-group">
            <span className="section-label" style={{marginBottom:8, fontSize:'0.5rem'}}>Wall_Color</span>
            <input className="param-input" type="color" value={room.wallColor} onChange={e => setRoom(p=>({...p, wallColor: e.target.value}))} style={{height:40}} />
        </div>
        <button className="fc-save-btn" onClick={handleSaveDesign}>SAVE DESIGN</button>
      </div>
    );

    const Vault = () => (
      <div className="sidebar-content">
        <div className="section-label"><Folder size={14} /> Secure Vault</div>
        {savedDesigns.length === 0 ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-dim)', fontSize:'0.7rem'}}>VAULT_EMPTY</div>
        ) : (
          savedDesigns.map(design => (
            <div key={design._id} className="catalog-card" onClick={() => { 
                setRoom(design.room); 
                // Normalize items: Ensure every loaded item has a persistent 'id' for interactions
                const normalizedItems = design.items.map((i, idx) => ({ 
                    ...i, 
                    id: i.id || i._id || `item_node_${idx}_${Date.now()}` 
                }));
                setItems(normalizedItems); 
                setDesignName(design.name); 
                setActiveDesignId(design._id);
                setView('editor'); 
            }}>
               <div className="catalog-icon" style={{fontSize:'1.2rem'}}>📁</div>
               <div className="catalog-info"><h4>{design.name}</h4><span>{design.items.length} Items</span></div>
            </div>
          ))
        )}
      </div>
    );

    if (view === 'dashboard') {
      return (
        <div className="fc-wrap mesh-bg">
          <nav className="fc-nav" style={{backgroundColor:'transparent'}}>
              <div className="brand-title"><Layers size={22} color="var(--accent)" /> 3D DESIGNER <span className="brand-sub">by Architect</span></div>
              <button className="view-btn active" onClick={() => setView('new')}>+ New Design</button>
          </nav>
          <div className="fc-page" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
             <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="glass-panel" style={{padding:60, borderRadius:40, textAlign:'center', maxWidth:800}}>
                <h1 style={{fontSize:'3rem', fontWeight:900, marginBottom:20}}>Plan Your Dream Room</h1>
                <p style={{color:'var(--text-dim)', fontSize:'1.1rem', marginBottom:40}}>Design in 2D, visualize in 3D. Fast, simple, and professional.</p>
                <div style={{display:'flex', gap:20, justifyContent:'center'}}>
                   <button className="view-btn active" style={{padding:'20px 40px', fontSize:'1rem'}} onClick={() => setView('new')}>START DESIGNING</button>
                </div>
             </motion.div>
             {savedDesigns.length > 0 && <div style={{marginTop:60, width:'100%'}}>
                <h3 className="section-label">Active Vault Nodes</h3>
                <div className="fc-cards-grid" style={{marginTop:20}}>
                   {savedDesigns.map(d => (
                     <div className="fc-card glass-panel" key={d._id} onClick={() => { 
                        setRoom(d.room); 
                        // Normalize items: Ensure every loaded item has a persistent 'id' for interactions
                        const normalizedItems = d.items.map((i, idx) => ({ 
                            ...i, 
                            id: i.id || i._id || `item_node_${idx}_${Date.now()}` 
                        }));
                        setItems(normalizedItems); 
                        setDesignName(d.name); 
                        setActiveDesignId(d._id);
                        setView('editor'); 
                     }} style={{padding:20, cursor:'pointer'}}>
                        <h4 style={{fontWeight:900, textTransform:'uppercase'}}>{d.name}</h4>
                        <p style={{fontSize:'0.65rem', color:'var(--text-dim)'}}>{d.items.length} Assets</p>
                     </div>
                   ))}
                </div>
             </div>}
          </div>
        </div>
      );
    }

    if (view === 'new') {
        return (
          <div className="fc-wrap mesh-bg">
             <div className="fc-page" style={{display:'flex', justifyContent:'center', alignItems:'center', padding: '20px'}}>
                <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="glass-panel" style={{width:'100%', maxWidth:500, padding:40, borderRadius:32}}>
                   <h2 className="section-label">NEW DESIGN SETUP</h2>
                   <div className="param-group" style={{marginTop:20}}>
                      <span className="section-label" style={{marginBottom:8}}>Room Name</span>
                      <input className="param-input" placeholder="My New Room" value={designName} onChange={e => setDesignName(e.target.value)} />
                   </div>
                   <div className="param-grid">
                      <div className="param-group">
                        <span className="section-label" style={{marginBottom:8}}>Width</span>
                        <input className="param-input" type="number" value={room.width} onChange={e => setRoom(p=>({...p, width: parseFloat(e.target.value)||2}))} />
                      </div>
                      <div className="param-group">
                        <span className="section-label" style={{marginBottom:8}}>Length</span>
                        <input className="param-input" type="number" value={room.length} onChange={e => setRoom(p=>({...p, length: parseFloat(e.target.value)||2}))} />
                      </div>
                   </div>
                   <button className="view-btn active" style={{width:'100%', marginTop:20, height:60}} onClick={() => { setActiveDesignId(null); setItems([]); setView('editor'); }}>OPEN EDITOR</button>
                </motion.div>
             </div>
          </div>
        )
    }

    return (
        <div className="fc-wrap">
            <AnimatePresence>
                {notif && <motion.div initial={{x:100, opacity:0}} animate={{x:0, opacity:1}} exit={{x:100, opacity:0}} className="fc-notif">{notif.msg}</motion.div>}
            </AnimatePresence>

            <nav className="fc-nav glass-panel" style={{borderRadius:0, borderTop:'none', borderLeft:'none', borderRight:'none', height:70}}>
                <div className="brand-title"><Layers size={22} color="var(--accent)" /> 3D DESIGNER</div>
                <div className="tab-container" style={{width:240}}>
                    <button className={`tab-btn ${viewMode === '2d' ? 'active' : ''}`} onClick={() => setViewMode('2d')}>2D LAYOUT</button>
                    <button className={`tab-btn ${viewMode === '3d' ? 'active' : ''}`} onClick={() => setViewMode('3d')}>3D VIEW</button>
                </div>
                <button className="view-btn" style={{backgroundColor:'rgba(255,255,255,0.05)', fontSize:'0.7rem'}} onClick={() => setView('dashboard')}>EXIT</button>
            </nav>

            <div className="studio-layout">
                <aside className="sidebar glass-panel">
                    <div className="sidebar-header">
                       <div className="tab-container" style={{marginTop:12}}>
                          <button className={`tab-btn ${view === 'editor-catalog' || !view.includes('settings') ? 'active' : ''}`} onClick={() => setView('editor-catalog')}>ITEMS</button>
                          <button className={`tab-btn ${view === 'editor-settings' ? 'active' : ''}`} onClick={() => setView('editor-settings')}>ROOM</button>
                          <button className={`tab-btn ${view === 'editor-vault' ? 'active' : ''}`} onClick={() => setView('editor-vault')}>SAVED</button>
                       </div>
                    </div>
                    {view === 'editor-settings' ? <Settings /> : view === 'editor-vault' ? <Vault /> : <Catalog />}
                </aside>

                <main className="workspace">
                    <AnimatePresence mode="wait">
                        {viewMode === '2d' ? (
                            <motion.div key="2d" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="canvas-2d-wrap mesh-bg" onPointerMove={handlePointerMove} onPointerUp={() => setIsDragging(false)}>
                                <div className="svg-canvas" style={{ width: '100%', maxWidth: room.width * 70, aspectRatio: `${room.width} / ${room.length}` }}>
                                    <svg ref={svgRef} viewBox={`0 0 ${room.width} ${room.length}`} onPointerUp={() => setIsDragging(false)} style={{width:'100%', height:'100%', overflow:'visible'}}>
                                        <defs>
                                           <pattern id="grid-pattern" width="1" height="1" patternUnits="userSpaceOnUse"><circle cx="0.05" cy="0.05" r="0.02" fill="rgba(255,255,255,0.1)" /></pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid-pattern)" rx="0.5" />
                                        
                                        {items.map(item => (
                                          <g key={item.id} transform={`translate(${item.x}, ${item.z}) rotate(${item.rotation})`} onPointerDown={(e) => handlePointerDown(e, item)} style={{cursor:'move'}}>
                                             {(selectedId === item.id || hoveredId === item.id) && (
                                               <rect x={-item.width/2 - 0.1} y={-item.depth/2 - 0.1} width={item.width + 0.2} height={item.depth + 0.2} rx="0.1" fill="none" stroke={selectedId === item.id ? "var(--accent)" : "rgba(255,255,255,0.2)"} strokeWidth="0.05" strokeDasharray="0.1 0.1" />
                                             )}
                                             
                                             <rect x={-item.width/2} y={-item.depth/2} width={item.width} height={item.depth} rx="0.08" fill={item.color} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                                             
                                             {/* 2D Orientation Markers */}
                                             <rect x={-item.width/2} y={-item.depth/2} width={item.width} height={item.depth * 0.25} fill="rgba(0,0,0,0.35)" rx="0.04" />
                                             {item.type === 'sofa' && (
                                               <g><rect x={-item.width/2} y={-item.depth/2} width={0.12} height={item.depth} fill="rgba(0,0,0,0.2)" /><rect x={item.width/2-0.12} y={-item.depth/2} width={0.12} height={item.depth} fill="rgba(0,0,0,0.2)" /></g>
                                             )}
                                             {item.type === 'bed' && (
                                               <g><rect x={-item.width/4} y={-item.depth/2+0.1} width={item.width/4} height={0.2} fill="rgba(255,255,255,0.3)" rx="0.04" /><rect x={0.05} y={-item.depth/2+0.1} width={item.width/4} height={0.2} fill="rgba(255,255,255,0.3)" rx="0.04" /></g>
                                             )}
                                             <path d={`M -0.1 ${item.depth/2-0.2} L 0 ${item.depth/2-0.1} L 0.1 ${item.depth/2-0.2}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.04" strokeLinecap="round" />
                                             <text fontSize="0.22" fill="white" textAnchor="middle" y="0.1" pointerEvents="none" style={{fontWeight:900, textTransform:'uppercase', opacity:0.6}}>{item.type}</text>
                                          </g>
                                        ))}
                                    </svg>
                                </div>

                                {selectedId && selectedItem && (
                                  <div className="selection-toolbar glass-panel" style={{ left: `${(selectedItem.x / room.width) * 100}%`, top: `${(selectedItem.z / room.length) * 100}%` }}>
                                     <button className="tool-btn primary" onClick={(e) => { e.stopPropagation(); rotateItem(selectedId); }}><RotateCcw size={16} /></button>
                                     <button className="tool-btn primary" onClick={(e) => { e.stopPropagation(); duplicateItem(selectedId); }}><Copy size={16} /></button>
                                     <button className="tool-btn danger" onClick={(e) => { e.stopPropagation(); removeItem(selectedId); }}><Trash2 size={16} /></button>
                                  </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="3d" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="canvas-3d-wrap">
                                <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
                                    <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={35} />
                                    <ambientLight intensity={0.4} />
                                    <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                                    <Suspense fallback={null}><Environment preset="forest" /></Suspense>
                                    <OrbitControls makeDefault enableDamping minDistance={3} maxDistance={50} maxPolarAngle={Math.PI / 2.1} />
                                    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                                      <group>
                                         <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]} position={[0, -0.01, 0]}>
                                            <planeGeometry args={[room.width, room.length]} />
                                            <meshStandardMaterial color="#111" roughness={0.6} />
                                         </mesh>
                                         <mesh position={[0, 1.4, -room.length/2 - 0.1]} receiveShadow castShadow><boxGeometry args={[room.width+0.2, 2.8, 0.2]} /><meshStandardMaterial color={room.wallColor} /></mesh>
                                         <mesh position={[-room.width/2 - 0.1, 1.4, 0]} receiveShadow castShadow><boxGeometry args={[0.2, 2.8, room.length]} /><meshStandardMaterial color={room.wallColor} /></mesh>
                                         {items.map(item => (
                                           <FurnitureModel key={item.id} {...item} position={{x: item.x, z: item.z}} room={room} />
                                         ))}
                                      </group>
                                    </Float>
                                    <ContactShadows opacity={0.6} scale={30} blur={2} far={15} />
                                    <Grid sectionSize={5} sectionColor="#3b82f6" sectionThickness={1.5} cellSize={1} cellColor="#1e293b" cellThickness={0.8} infiniteGrid fadeDistance={50} position={[0, -0.02, 0]} />
                                </Canvas>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="hud-bottom glass-panel">
                       <div className="hud-item"><div className="hud-icon"><Move size={18} /></div><div className="hud-meta"><span>Scale</span><span>70PX/M</span></div></div>
                       <div className="hud-divider" />
                       <div className="hud-item"><div className="hud-icon"><Box size={18} /></div><div className="hud-meta"><span>Assets</span><span>{items.length}</span></div></div>
                    </div>
                </main>
            </div>
        </div>
    );
}
