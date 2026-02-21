import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import '../styles/Viewer3D.css';

// Simple House Model Component
function HouseModel({ color = '#00d9ff' }) {
  return (
    <group>
      {/* Base/Foundation */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Main Walls */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3, 1.5, 4]} />
        <meshStandardMaterial color="#c41e3a" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.5, 2.01]} castShadow>
        <boxGeometry args={[0.8, 1.5, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Windows */}
      <mesh position={[-1.2, 2, 2.01]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      <mesh position={[1.2, 2, 2.01]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>

      {/* Side Windows */}
      <mesh position={[2.01, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      <mesh position={[-2.01, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
    </group>
  );
}

// Modern Villa Model
function ModernVilla() {
  return (
    <group>
      {/* Main Structure */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[6, 3, 5]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Second Floor */}
      <mesh position={[-1, 4, 0]} castShadow>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Flat Roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[6.2, 0.2, 5.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Large Windows */}
      <mesh position={[0, 1.5, 2.51]} castShadow>
        <boxGeometry args={[4, 2, 0.1]} />
        <meshStandardMaterial color="#4a90e2" opacity={0.7} transparent />
      </mesh>

      {/* Balcony */}
      <mesh position={[-1, 5.2, 2.5]} castShadow>
        <boxGeometry args={[4, 0.2, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </group>
  );
}

// Garden House Model
function GardenHouse() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[5, 2, 4]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>

      {/* Sloped Roof */}
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[5.5, 0.2, 4.5]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
        <boxGeometry args={[5.5, 0.2, 4.5]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Garden Elements */}
      <mesh position={[-3, 0.5, 2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-3, 1.5, 2]} castShadow>
        <sphereGeometry args={[0.8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
}

function Viewer3D() {
  const [selectedModel, setSelectedModel] = useState('house');
  const [houseColor, setHouseColor] = useState('#00d9ff');
  const [showGrid, setShowGrid] = useState(true);

  const models = {
    house: <HouseModel color={houseColor} />,
    villa: <ModernVilla />,
    garden: <GardenHouse />
  };

  return (
    <div className="viewer-container">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/designer" className="nav-link">Designer</a>
          <a href="/viewer" className="nav-link-active">3D Viewer</a>
        </div>
      </nav>

      <div className="viewer-content">
        <div className="viewer-sidebar">
          <h2>3D Model Viewer</h2>
          <p className="sidebar-subtitle">Select and customize your house design</p>

          <div className="control-section">
            <h3>Select Model</h3>
            <div className="model-buttons">
              <button 
                className={selectedModel === 'house' ? 'active' : ''}
                onClick={() => setSelectedModel('house')}
              >
                🏠 Basic House
              </button>
              <button 
                className={selectedModel === 'villa' ? 'active' : ''}
                onClick={() => setSelectedModel('villa')}
              >
                🏢 Modern Villa
              </button>
              <button 
                className={selectedModel === 'garden' ? 'active' : ''}
                onClick={() => setSelectedModel('garden')}
              >
                🌳 Garden House
              </button>
            </div>
          </div>

          {selectedModel === 'house' && (
            <div className="control-section">
              <h3>Wall Color</h3>
              <div className="color-picker">
                <button 
                  className="color-btn"
                  style={{ background: '#00d9ff' }}
                  onClick={() => setHouseColor('#00d9ff')}
                />
                <button 
                  className="color-btn"
                  style={{ background: '#ff6b9d' }}
                  onClick={() => setHouseColor('#ff6b9d')}
                />
                <button 
                  className="color-btn"
                  style={{ background: '#ffd700' }}
                  onClick={() => setHouseColor('#ffd700')}
                />
                <button 
                  className="color-btn"
                  style={{ background: '#98fb98' }}
                  onClick={() => setHouseColor('#98fb98')}
                />
                <button 
                  className="color-btn"
                  style={{ background: '#dda0dd' }}
                  onClick={() => setHouseColor('#dda0dd')}
                />
              </div>
            </div>
          )}

          <div className="control-section">
            <h3>View Options</h3>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              Show Grid
            </label>
          </div>

          <div className="control-section">
            <h3>Controls</h3>
            <ul className="controls-list">
              <li>🖱️ Left Click + Drag: Rotate</li>
              <li>🖱️ Right Click + Drag: Pan</li>
              <li>🖱️ Scroll: Zoom</li>
            </ul>
          </div>

          <div className="control-section">
            <button className="export-btn">📥 Export Model</button>
            <button className="save-btn">💾 Save Design</button>
          </div>
        </div>

        <div className="viewer-canvas">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[8, 6, 8]} />
            <OrbitControls 
              enableDamping
              dampingFactor={0.05}
              minDistance={5}
              maxDistance={20}
            />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />

            {/* Environment */}
            <Environment preset="sunset" />
            
            {/* Grid */}
            {showGrid && (
              <Grid 
                args={[20, 20]} 
                cellSize={1} 
                cellThickness={0.5}
                cellColor="#6e6e6e"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#00d9ff"
                fadeDistance={25}
                fadeStrength={1}
                followCamera={false}
              />
            )}

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            {/* Selected Model */}
            {models[selectedModel]}
          </Canvas>

          <div className="viewer-info">
            <div className="info-badge">
              <span className="info-label">Model:</span>
              <span className="info-value">
                {selectedModel === 'house' && 'Basic House'}
                {selectedModel === 'villa' && 'Modern Villa'}
                {selectedModel === 'garden' && 'Garden House'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewer3D;
