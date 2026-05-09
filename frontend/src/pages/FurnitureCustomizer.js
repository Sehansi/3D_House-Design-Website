import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/FurnitureCustomizer.css';

// Furniture Components
function Sofa({ style = 'modern', position }) {
  const colors = {
    modern: '#4a4a4a',
    classic: '#8b4513',
    minimal: '#f5f5f5'
  };
  
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.6, 0.8]} />
        <meshStandardMaterial color={colors[style]} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, -0.35]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshStandardMaterial color={colors[style]} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Bed({ style = 'modern', position }) {
  const colors = {
    modern: '#8b0000',
    classic: '#800020',
    minimal: '#ffffff'
  };
  
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.3, 1.8]} />
        <meshStandardMaterial color={colors[style]} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, -0.8]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.1]} />
        <meshStandardMaterial color="#654321" roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.35, -0.6]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.35, -0.6]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
    </group>
  );
}

function DiningTable({ style, position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#8b4513" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
      </mesh>
      <mesh position={[-0.5, 0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Wardrobe({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1, 1.8, 0.5]} />
        <meshStandardMaterial color="#654321" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.26]} castShadow>
        <boxGeometry args={[0.02, 1.6, 0.02]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

function TVStand({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.4, 0.4]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Room({ furniture }) {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[5, 0.1, 5]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.5, -2.5]} receiveShadow>
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      <mesh position={[-2.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      <mesh position={[2.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Render selected furniture */}
      {furniture.map((item, index) => {
        const FurnitureComponent = {
          sofa: Sofa,
          bed: Bed,
          diningTable: DiningTable,
          wardrobe: Wardrobe,
          tvStand: TVStand
        }[item.type];

        return FurnitureComponent ? (
          <FurnitureComponent
            key={index}
            style={item.style}
            color={item.color}
            position={item.position}
          />
        ) : null;
      })}

      {/* Lighting */}
      <pointLight position={[0, 2.5, 0]} intensity={1} color="#fff5e6" />
      <pointLight position={[-2, 2, -2]} intensity={0.5} color="#ffffff" />
      <pointLight position={[2, 2, 2]} intensity={0.5} color="#ffffff" />
    </group>
  );
}

function FurnitureCustomizer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedRoom, setSelectedRoom] = useState('living');
  const [furniture, setFurniture] = useState({
    living: [
      { type: 'sofa', style: 'modern', position: [-1, 0.3, 0] },
      { type: 'tvStand', position: [0, 0.2, -2] }
    ],
    bedroom: [
      { type: 'bed', style: 'modern', position: [0, 0.15, 0] },
      { type: 'wardrobe', position: [-1.8, 0.9, -2] }
    ],
    dining: [
      { type: 'diningTable', position: [0, 0.2, 0] }
    ]
  });
  
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [customizationOptions, setCustomizationOptions] = useState({
    color: '',
    material: '',
    size: '',
    quantity: 1
  });
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedCatalogItems, setSelectedCatalogItems] = useState([]);

  // Fetch furniture catalog
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const response = await api.get('/furniture/catalog');
      if (response.data.success) {
        setCatalog(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching catalog:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const furnitureOptions = {
    living: [
      { type: 'sofa', name: '🛋️ Sofa', icon: '🛋️' },
      { type: 'tvStand', name: '📺 TV Stand', icon: '📺' },
      { type: 'diningTable', name: '🪑 Coffee Table', icon: '🪑' }
    ],
    bedroom: [
      { type: 'bed', name: '🛏️ Bed', icon: '🛏️' },
      { type: 'wardrobe', name: '🚪 Wardrobe', icon: '🚪' },
      { type: 'tvStand', name: '📺 TV Stand', icon: '📺' }
    ],
    dining: [
      { type: 'diningTable', name: '🍽️ Dining Table', icon: '🍽️' }
    ]
  };

  const addFurniture = (type) => {
    const newItem = {
      type,
      style: 'modern',
      position: [Math.random() * 2 - 1, 0.2, Math.random() * 2 - 1]
    };

    setFurniture(prev => ({
      ...prev,
      [selectedRoom]: [...prev[selectedRoom], newItem]
    }));
  };

  const removeFurniture = (index) => {
    setFurniture(prev => ({
      ...prev,
      [selectedRoom]: prev[selectedRoom].filter((_, i) => i !== index)
    }));
  };

  const clearRoom = () => {
    setFurniture(prev => ({
      ...prev,
      [selectedRoom]: []
    }));
    showNotification('Room cleared', 'info');
  };

  const saveDesign = async () => {
    if (!user) {
      showNotification('Please sign in to save your design', 'error');
      setTimeout(() => navigate('/signin'), 1500);
      return;
    }

    setLoading(true);
    try {
      const designData = {
        roomType: selectedRoom,
        furniture: furniture[selectedRoom],
        totalItems: furniture[selectedRoom].length
      };

      // For now, save as a simple customization
      const response = await api.post('/furniture/customize', {
        furnitureId: '1',
        name: `${selectedRoom.charAt(0).toUpperCase() + selectedRoom.slice(1)} Room Design`,
        color: 'custom',
        material: 'mixed',
        size: 'custom',
        quantity: furniture[selectedRoom].length
      });

      if (response.data.success) {
        showNotification('Design saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification(error.response?.data?.error || 'Failed to save design', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCustomizeModal = (furnitureItem) => {
    setSelectedFurniture(furnitureItem);
    setCustomizationOptions({
      color: furnitureItem.colors?.[0] || '',
      material: furnitureItem.materials?.[0] || '',
      size: furnitureItem.sizes?.[0] || '',
      quantity: 1
    });
    setShowCustomizeModal(true);
    
    // Add to selected items if not already there
    if (!selectedCatalogItems.find(item => item.id === furnitureItem.id)) {
      setSelectedCatalogItems(prev => [...prev, furnitureItem]);
    }
  };

  const removeSelectedItem = (itemId) => {
    setSelectedCatalogItems(prev => prev.filter(item => item.id !== itemId));
    showNotification('Item removed from selection', 'info');
  };

  const saveCustomization = async () => {
    if (!user) {
      showNotification('Please sign in to save customization', 'error');
      setTimeout(() => navigate('/signin'), 1500);
      return;
    }

    if (!selectedFurniture) return;

    setLoading(true);
    try {
      const response = await api.post('/furniture/customize', {
        furnitureId: selectedFurniture.id,
        name: selectedFurniture.name,
        ...customizationOptions
      });

      if (response.data.success) {
        showNotification('Customization saved!', 'success');
        setShowCustomizeModal(false);
      }
    } catch (error) {
      console.error('Customization error:', error);
      showNotification(error.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customizer-container">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Customize Modal */}
      {showCustomizeModal && selectedFurniture && (
        <div className="modal-overlay" onClick={() => setShowCustomizeModal(false)}>
          <div className="customize-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customize {selectedFurniture.name}</h3>
              <button className="modal-close" onClick={() => setShowCustomizeModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="customize-option">
                <label>Color</label>
                <select 
                  value={customizationOptions.color}
                  onChange={(e) => setCustomizationOptions({...customizationOptions, color: e.target.value})}
                >
                  {selectedFurniture.colors?.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="customize-option">
                <label>Material</label>
                <select 
                  value={customizationOptions.material}
                  onChange={(e) => setCustomizationOptions({...customizationOptions, material: e.target.value})}
                >
                  {selectedFurniture.materials?.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>

              <div className="customize-option">
                <label>Size</label>
                <select 
                  value={customizationOptions.size}
                  onChange={(e) => setCustomizationOptions({...customizationOptions, size: e.target.value})}
                >
                  {selectedFurniture.sizes?.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="customize-option">
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={customizationOptions.quantity}
                  onChange={(e) => setCustomizationOptions({...customizationOptions, quantity: parseInt(e.target.value)})}
                />
              </div>

              <div className="price-display">
                <span>Base Price:</span>
                <span className="price">${selectedFurniture.basePrice}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCustomizeModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={saveCustomization}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Customization'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">3D House Design</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/gallery" className="nav-link">Projects</a>
          <a href="/designer" className="nav-link">Designer</a>
          <a href="/ai-designer" className="nav-link">AI Designer</a>
          <a href="/furniture-customizer" className="nav-link-active">Furniture</a>
          <a href="/viewer" className="nav-link">3D Viewer</a>
          <a href="/services" className="nav-link">Services</a>
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          {user ? (
            <a href="/profile" className="nav-link">Profile</a>
          ) : (
            <>
              <a href="/signin" className="nav-link-signin">Sign In</a>
              <a href="/register" className="btn-nav-primary">Get Started Free</a>
            </>
          )}
        </div>
      </nav>

      <div className="customizer-content">
        <div className="customizer-sidebar">
          <h2>🪑 Furniture Customizer</h2>
          <p className="sidebar-subtitle">Design your room with custom furniture</p>

          <div className="control-section">
            <h3>Select Room</h3>
            <div className="room-buttons">
              <button
                className={selectedRoom === 'living' ? 'active' : ''}
                onClick={() => setSelectedRoom('living')}
              >
                🛋️ Living Room
              </button>
              <button
                className={selectedRoom === 'bedroom' ? 'active' : ''}
                onClick={() => setSelectedRoom('bedroom')}
              >
                🛏️ Bedroom
              </button>
              <button
                className={selectedRoom === 'dining' ? 'active' : ''}
                onClick={() => setSelectedRoom('dining')}
              >
                🍽️ Dining Room
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>Add Furniture</h3>
            <div className="furniture-grid">
              {furnitureOptions[selectedRoom].map((option) => (
                <button
                  key={option.type}
                  className="furniture-add-btn"
                  onClick={() => addFurniture(option.type)}
                >
                  <span className="furniture-icon">{option.icon}</span>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3>Current Furniture</h3>
            <div className="furniture-list">
              {furniture[selectedRoom].length === 0 ? (
                <p className="empty-message">No furniture added yet</p>
              ) : (
                furniture[selectedRoom].map((item, index) => (
                  <div key={index} className="furniture-item">
                    <span>{furnitureOptions[selectedRoom].find(f => f.type === item.type)?.icon} {item.type}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeFurniture(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="control-section">
            <button className="clear-btn" onClick={clearRoom}>
              🗑️ Clear Room
            </button>
            <button 
              className="save-btn" 
              onClick={saveDesign}
              disabled={loading}
            >
              {loading ? '💾 Saving...' : '💾 Save Design'}
            </button>
          </div>

          {/* Furniture Catalog */}
          {catalog.length > 0 && (
            <div className="control-section">
              <h3>Furniture Catalog</h3>
              <div className="catalog-list">
                {catalog.map((item) => (
                  <div key={item.id} className="catalog-item">
                    <div className="catalog-info">
                      <span className="catalog-name">{item.name}</span>
                      <span className="catalog-price">${item.basePrice}</span>
                    </div>
                    <button
                      className="customize-btn"
                      onClick={() => openCustomizeModal(item)}
                    >
                      Customize
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Furniture Items */}
          {selectedCatalogItems.length > 0 && (
            <div className="control-section">
              <h3>Selected Items ({selectedCatalogItems.length})</h3>
              <div className="selected-items-grid">
                {selectedCatalogItems.map((item) => (
                  <div key={item.id} className="selected-item-card">
                    <div className="selected-item-image">
                      <img src={item.image} alt={item.name} />
                      <button
                        className="remove-selected-btn"
                        onClick={() => removeSelectedItem(item.id)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="selected-item-info">
                      <h4>{item.name}</h4>
                      <p className="selected-item-price">${item.basePrice}</p>
                      <div className="selected-item-tags">
                        <span className="tag">{item.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="selected-items-total">
                <span>Total:</span>
                <span className="total-price">
                  ${selectedCatalogItems.reduce((sum, item) => sum + item.basePrice, 0)}
                </span>
              </div>
            </div>
          )}

          <div className="control-section">
            <h3>Controls</h3>
            <ul className="controls-list">
              <li>🖱️ Left Click + Drag: Rotate</li>
              <li>🖱️ Right Click + Drag: Pan</li>
              <li>🖱️ Scroll: Zoom</li>
            </ul>
          </div>
        </div>

        <div className="customizer-canvas">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[5, 5, 5]} />
            <OrbitControls enableDamping dampingFactor={0.05} />
            
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            <Environment preset="apartment" />
            
            <Room furniture={furniture[selectedRoom]} roomType={selectedRoom} />
          </Canvas>

          <div className="canvas-info">
            <div className="info-badge">
              <span className="info-label">Room:</span>
              <span className="info-value">
                {selectedRoom === 'living' && 'Living Room'}
                {selectedRoom === 'bedroom' && 'Bedroom'}
                {selectedRoom === 'dining' && 'Dining Room'}
              </span>
            </div>
            <div className="info-badge">
              <span className="info-label">Furniture:</span>
              <span className="info-value">{furniture[selectedRoom].length} items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FurnitureCustomizer;
