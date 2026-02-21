import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import '../styles/Viewer3D.css';

// Simple House Model Component
function HouseModel({ color = '#00d9ff', interiorView = false, showFurniture = true }) {
  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5, 0.4, 5]} />
        <meshStandardMaterial color="#666666" roughness={0.8} />
      </mesh>

      {/* Main Walls */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 3, 4.5]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.6} 
          metalness={0.1}
          transparent={interiorView}
          opacity={interiorView ? 0.3 : 1}
          side={2}
        />
      </mesh>

      {/* Interior Floor */}
      {interiorView && (
        <mesh position={[0, 0.41, 0]} receiveShadow>
          <boxGeometry args={[4.3, 0.02, 4.3]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>
      )}

      {/* Interior Walls - Living Room Division */}
      {interiorView && (
        <>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 2.5, 4.3]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 2.5, 2.1]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
          </mesh>
        </>
      )}

      {/* Furniture - Living Room */}
      {interiorView && showFurniture && (
        <group position={[-1.5, 0.6, -1.5]}>
          {/* Sofa */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1.5, 0.6, 0.8]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, -0.35]} castShadow>
            <boxGeometry args={[1.5, 0.6, 0.1]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
          </mesh>
          
          {/* Coffee Table */}
          <mesh position={[0, 0.2, 0.6]} castShadow>
            <boxGeometry args={[0.8, 0.05, 0.5]} />
            <meshStandardMaterial color="#8b4513" roughness={0.6} />
          </mesh>
          <mesh position={[-0.3, 0.1, 0.5]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.2]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[0.3, 0.1, 0.5]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.2]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>
      )}

      {/* Furniture - Bedroom */}
      {interiorView && showFurniture && (
        <group position={[1.5, 0.5, -1.5]}>
          {/* Bed */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.3, 1.8]} />
            <meshStandardMaterial color="#8b0000" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, -0.8]} castShadow>
            <boxGeometry args={[1.2, 0.4, 0.1]} />
            <meshStandardMaterial color="#654321" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Furniture - Kitchen */}
      {interiorView && showFurniture && (
        <group position={[-1.5, 0.5, 1.5]}>
          {/* Counter */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1.5, 0.8, 0.6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Stove */}
          <mesh position={[0, 0.41, 0]} castShadow>
            <boxGeometry args={[0.6, 0.05, 0.5]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Interior Lighting */}
      {interiorView && (
        <>
          <pointLight position={[-1.5, 2.5, -1.5]} intensity={0.8} color="#fff5e6" distance={4} />
          <pointLight position={[1.5, 2.5, -1.5]} intensity={0.8} color="#fff5e6" distance={4} />
          <pointLight position={[-1.5, 2.5, 1.5]} intensity={0.8} color="#fff5e6" distance={4} />
          <pointLight position={[1.5, 2.5, 1.5]} intensity={0.8} color="#fff5e6" distance={4} />
        </>
      )}

      {/* Roof */}
      <mesh position={[0, 4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.5, 1.8, 4]} />
        <meshStandardMaterial 
          color="#8b4513" 
          roughness={0.9}
          transparent={interiorView}
          opacity={interiorView ? 0.2 : 1}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1.5, 2.26]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.7}
          transparent={interiorView}
          opacity={interiorView ? 0.3 : 1}
        />
      </mesh>
      
      {/* Door Handle */}
      <mesh position={[0.3, 1.5, 2.31]} castShadow>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front Windows */}
      <mesh position={[-1.5, 2.2, 2.26]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} roughness={0.1} metalness={0.5} />
      </mesh>
      <mesh position={[1.5, 2.2, 2.26]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} roughness={0.1} metalness={0.5} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[2.26, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} roughness={0.1} metalness={0.5} />
      </mesh>
      <mesh position={[-2.26, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} roughness={0.1} metalness={0.5} />
      </mesh>
      
      {/* Back Windows */}
      <mesh position={[0, 2.2, -2.26]} castShadow>
        <boxGeometry args={[1.5, 1, 0.1]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} roughness={0.1} metalness={0.5} />
      </mesh>

      {/* Chimney */}
      <mesh position={[1.5, 4.5, -1]} castShadow>
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial 
          color="#8b4513" 
          roughness={0.9}
          transparent={interiorView}
          opacity={interiorView ? 0.3 : 1}
        />
      </mesh>

      {!interiorView && (
        <>
          {/* Garden/Pathway */}
          <mesh position={[0, 0.05, 4]} receiveShadow>
            <boxGeometry args={[1.5, 0.05, 3]} />
            <meshStandardMaterial color="#cccccc" roughness={0.8} />
          </mesh>

          {/* Small Trees */}
          <group position={[-3, 0, 3]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1]} />
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.3, 0]} castShadow>
              <sphereGeometry args={[0.6]} />
              <meshStandardMaterial color="#228b22" roughness={0.8} />
            </mesh>
          </group>
          
          <group position={[3, 0, 3]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1]} />
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.3, 0]} castShadow>
              <sphereGeometry args={[0.6]} />
              <meshStandardMaterial color="#228b22" roughness={0.8} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}

// Modern Villa Model
function ModernVilla() {
  return (
    <group>
      {/* Ground Floor */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 3.5, 6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Second Floor */}
      <mesh position={[-1.5, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 2.5, 5]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Flat Roof - Ground Floor */}
      <mesh position={[0, 3.6, 0]} castShadow>
        <boxGeometry args={[7.2, 0.15, 6.2]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.7} />
      </mesh>

      {/* Flat Roof - Second Floor */}
      <mesh position={[-1.5, 6.3, 0]} castShadow>
        <boxGeometry args={[4.7, 0.15, 5.2]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.7} />
      </mesh>

      {/* Large Glass Windows - Ground Floor */}
      <mesh position={[0, 1.8, 3.01]} castShadow>
        <boxGeometry args={[5, 2.5, 0.1]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Glass Windows - Second Floor */}
      <mesh position={[-1.5, 5, 2.51]} castShadow>
        <boxGeometry args={[3.5, 2, 0.1]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Balcony */}
      <mesh position={[-1.5, 6.5, 3]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.6} />
      </mesh>

      {/* Balcony Railing */}
      <mesh position={[-1.5, 7, 3.7]} castShadow>
        <boxGeometry args={[4.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Entrance Door */}
      <mesh position={[2, 1.2, 3.01]} castShadow>
        <boxGeometry args={[1.2, 2.3, 0.1]} />
        <meshStandardMaterial color="#333333" roughness={0.6} />
      </mesh>

      {/* Side Windows */}
      <mesh position={[3.51, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Pool */}
      <mesh position={[0, 0.1, 6]} receiveShadow>
        <boxGeometry args={[5, 0.2, 3]} />
        <meshStandardMaterial color="#1e90ff" transparent opacity={0.8} roughness={0.1} metalness={0.5} />
      </mesh>

      {/* Garden Lights */}
      <pointLight position={[-4, 3, 4]} intensity={0.5} color="#ffd700" distance={8} />
      <pointLight position={[4, 3, 4]} intensity={0.5} color="#ffd700" distance={8} />
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
  const [interiorView, setInteriorView] = useState(false);
  const [showFurniture, setShowFurniture] = useState(true);

  const models = {
    house: <HouseModel color={houseColor} interiorView={interiorView} showFurniture={showFurniture} />,
    villa: <ModernVilla interiorView={interiorView} showFurniture={showFurniture} />,
    garden: <GardenHouse interiorView={interiorView} showFurniture={showFurniture} />
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
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={interiorView}
                onChange={(e) => setInteriorView(e.target.checked)}
              />
              Interior View
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={showFurniture}
                onChange={(e) => setShowFurniture(e.target.checked)}
                disabled={!interiorView}
              />
              Show Furniture
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
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[15, 20, 10]} 
              intensity={1.2}
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            <pointLight position={[-15, 15, -10]} intensity={0.6} color="#ffa500" />
            <spotLight 
              position={[0, 20, 0]} 
              angle={0.3} 
              penumbra={0.5} 
              intensity={0.5}
              castShadow
            />
            <hemisphereLight intensity={0.3} groundColor="#444444" />

            {/* Environment */}
            <Environment preset="sunset" />
            
            {/* Fog for depth */}
            <fog attach="fog" args={['#0d1230', 20, 50]} />
            
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
