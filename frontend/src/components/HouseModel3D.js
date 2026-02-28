import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import * as THREE from 'three';

// Room component
function Room({ position, dimensions, color = '#ffffff', type = 'bedroom' }) {
  const meshRef = useRef();

  return (
    <group position={position}>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dimensions.width, dimensions.depth]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, dimensions.height / 2, -dimensions.depth / 2]}>
        <boxGeometry args={[dimensions.width, dimensions.height, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-dimensions.width / 2, dimensions.height / 2, 0]}>
        <boxGeometry args={[0.2, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Right wall */}
      <mesh position={[dimensions.width / 2, dimensions.height / 2, 0]}>
        <boxGeometry args={[0.2, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, dimensions.height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dimensions.width, dimensions.depth]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Room label */}
      <mesh position={[0, dimensions.height + 0.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Roof component
function Roof({ position, dimensions, type = 'sloped' }) {
  // Always call hooks at the top level
  const shape = useMemo(() => {
    if (type === 'flat') return null;
    
    const shape = new THREE.Shape();
    shape.moveTo(-dimensions.width / 2, 0);
    shape.lineTo(0, dimensions.height);
    shape.lineTo(dimensions.width / 2, 0);
    shape.lineTo(-dimensions.width / 2, 0);
    return shape;
  }, [dimensions, type]);

  if (type === 'flat') {
    return (
      <mesh position={[position[0], position[1], position[2]]}>
        <boxGeometry args={[dimensions.width, 0.3, dimensions.depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
  }

  // Sloped roof
  return (
    <mesh position={[position[0], position[1], position[2]]} rotation={[Math.PI / 2, 0, 0]}>
      <extrudeGeometry
        args={[
          shape,
          {
            depth: dimensions.depth,
            bevelEnabled: false,
          },
        ]}
      />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
  );
}

// Window component
function Window({ position, size = [1, 1.5, 0.1] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
    </mesh>
  );
}

// Door component
function Door({ position, size = [1, 2, 0.1] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#654321" />
    </mesh>
  );
}

// Main House Model
function HouseModel({ modelData, parameters, finishes }) {
  const groupRef = useRef();

  // Calculate house bounds - Always call hooks at top level
  const bounds = useMemo(() => {
    if (!modelData || !modelData.rooms) {
      return {
        width: 10,
        depth: 10,
        height: 3,
        centerX: 0,
        centerZ: 0,
      };
    }

    const { rooms } = modelData;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let maxY = 0;

    rooms.forEach(room => {
      const { position, dimensions } = room;
      minX = Math.min(minX, position.x - dimensions.width / 2);
      maxX = Math.max(maxX, position.x + dimensions.width / 2);
      minZ = Math.min(minZ, position.z - dimensions.depth / 2);
      maxZ = Math.max(maxZ, position.z + dimensions.depth / 2);
      maxY = Math.max(maxY, dimensions.height);
    });

    return {
      width: maxX - minX,
      depth: maxZ - minZ,
      height: maxY,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
    };
  }, [modelData]);

  // Rotate the house slowly
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  if (!modelData || !modelData.rooms) {
    return null;
  }

  const { rooms, style } = modelData;
  const wallColor = finishes?.wallColor || '#ffffff';
  const roofType = finishes?.roofType || 'sloped';

  return (
    <group ref={groupRef}>
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[bounds.width + 10, bounds.depth + 10]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>

      {/* Rooms */}
      {rooms.map((room, index) => (
        <Room
          key={index}
          position={[room.position.x, room.position.y, room.position.z]}
          dimensions={room.dimensions}
          color={wallColor}
          type={room.type}
        />
      ))}

      {/* Roof */}
      <Roof
        position={[bounds.centerX, bounds.height, bounds.centerZ]}
        dimensions={{
          width: bounds.width + 0.5,
          depth: bounds.depth + 0.5,
          height: 2,
        }}
        type={roofType}
      />

      {/* Windows */}
      {rooms.map((room, roomIndex) => {
        const windowCount = room.type === 'living' ? 3 : 2;
        return Array.from({ length: windowCount }).map((_, winIndex) => (
          <Window
            key={`window-${roomIndex}-${winIndex}`}
            position={[
              room.position.x + (winIndex - windowCount / 2) * 1.5,
              room.position.y + room.dimensions.height / 2,
              room.position.z + room.dimensions.depth / 2 + 0.15,
            ]}
          />
        ));
      })}

      {/* Front door */}
      <Door
        position={[bounds.centerX, 1, bounds.depth / 2 + 0.15]}
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
    </group>
  );
}

// Main Canvas Component
export default function HouseModel3D({ modelData, parameters, finishes }) {
  return (
    <div style={{ width: '100%', height: '600px', background: '#0a0e27', borderRadius: '15px', overflow: 'hidden' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={60} />
        <Sky sunPosition={[100, 20, 100]} />
        
        <HouseModel modelData={modelData} parameters={parameters} finishes={finishes} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
        
        <gridHelper args={[50, 50, '#00d9ff', '#1a1a2e']} position={[0, -0.1, 0]} />
      </Canvas>
    </div>
  );
}
