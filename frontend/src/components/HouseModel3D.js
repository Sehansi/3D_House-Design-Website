import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// 1. WALL SEGMENT — Simple box per wall (from Python walls[])
// ─────────────────────────────────────────────────────────────
function WallBox({ wall, color }) {
  const h   = wall.height    ?? 4;
  const t   = wall.thickness ?? 0.6;
  const len = wall.length    ?? 1;

  return (
    <mesh
      position={[wall.centerX, h / 2, wall.centerZ]}
      rotation={[0, wall.rotation ?? 0, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[len, h, t]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 1b. EXTRUDED WALL RING — renders any polygon as a proper
//     hollow 3D wall using ExtrudeGeometry.
//     Outer shape = polygon points.
//     Inner hole  = polygon scaled inward toward centroid.
//     This solves the "always a square" problem by following
//     the actual detected polygon shape.
// ─────────────────────────────────────────────────────────────
function ExtrudedWallRing({ points, wallHeight = 4, wallColor = '#d4c9b0', insetRatio = 0.88 }) {
  const geo = useMemo(() => {
    if (!points || points.length < 3) return null;

    // Centroid for inward scaling
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cz = points.reduce((s, p) => s + p.z, 0) / points.length;

    // Outer shape — follows the exact polygon
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].z);
    }
    shape.closePath();

    // Inner hole — polygon scaled toward centroid by insetRatio
    // Creates the hollow "wall ring" effect
    const hole = new THREE.Path();
    const inset = points.map(p => ({
      x: cx + (p.x - cx) * insetRatio,
      z: cz + (p.z - cz) * insetRatio,
    }));
    hole.moveTo(inset[0].x, inset[0].z);
    for (let i = 1; i < inset.length; i++) {
      hole.lineTo(inset[i].x, inset[i].z);
    }
    hole.closePath();
    shape.holes.push(hole);

    const g = new THREE.ExtrudeGeometry(shape, {
      depth:         wallHeight,
      bevelEnabled:  false,
    });
    // ExtrudeGeometry goes along Z — rotate to lie on the XZ plane
    g.rotateX(-Math.PI / 2);
    return g;
  }, [points, wallHeight, insetRatio]);

  if (!geo) return null;
  return (
    <mesh geometry={geo} castShadow receiveShadow position={[0, 0, 0]}>
      <meshStandardMaterial color={wallColor} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. POLYGON FILL — Extruded room floor (from Python polygons[])
//    This creates the colored floor slab for each detected room.
// ─────────────────────────────────────────────────────────────
const ROOM_COLORS = [
  '#d4a574', '#a8c5a0', '#9bb5cc', '#d4c5a0',
  '#c5a0c0', '#a0c5c5', '#c5b5a0', '#b5a0c5',
];

function PolygonFloor({ points, colorIndex }) {
  const geo = useMemo(() => {
    if (!points || points.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].z);
    }
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);   // lie flat on XZ plane
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
        opacity={0.9}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 2b. DOOR MESH — frame + panel + knob
// ─────────────────────────────────────────────────────────────
function DoorMesh({ wall }) {
  const wallH = wall.height ?? 4;
  const t     = (wall.thickness ?? 0.6) * 0.25;   // door is thinner than wall
  const doorW = Math.min(wall.length ?? 2, 1.8);
  const doorH = Math.min(wallH * 0.75, 2.4);
  const frameT = 0.12;

  return (
    <group
      position={[wall.centerX, 0, wall.centerZ]}
      rotation={[0, wall.rotation ?? 0, 0]}
    >
      {/* Door panel */}
      <mesh position={[0, doorH / 2, 0]} castShadow>
        <boxGeometry args={[doorW, doorH, t]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.65} metalness={0.05} />
      </mesh>
      {/* Top frame */}
      <mesh position={[0, doorH + frameT / 2, 0]} castShadow>
        <boxGeometry args={[doorW + frameT * 2, frameT, t + 0.02]} />
        <meshStandardMaterial color="#3a2410" roughness={0.5} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-(doorW / 2 + frameT / 2), doorH / 2, 0]} castShadow>
        <boxGeometry args={[frameT, doorH + frameT, t + 0.02]} />
        <meshStandardMaterial color="#3a2410" roughness={0.5} />
      </mesh>
      {/* Right frame */}
      <mesh position={[doorW / 2 + frameT / 2, doorH / 2, 0]} castShadow>
        <boxGeometry args={[frameT, doorH + frameT, t + 0.02]} />
        <meshStandardMaterial color="#3a2410" roughness={0.5} />
      </mesh>
      {/* Door knob */}
      <mesh position={[doorW * 0.38, doorH * 0.45, t / 2 + 0.04]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 2c. WINDOW MESH — glass pane with thin frame
// ─────────────────────────────────────────────────────────────
function WindowMesh({ wall }) {
  const wallH = wall.height    ?? 4;
  const winW  = Math.min(wall.length ?? 1.2, 2.0);
  const winH  = Math.min(wallH * 0.35, 1.4);
  const yPos  = wallH * 0.58;              // mid-upper height
  const t     = (wall.thickness ?? 0.6) * 0.15;
  const frameT = 0.08;

  return (
    <group
      position={[wall.centerX, yPos, wall.centerZ]}
      rotation={[0, wall.rotation ?? 0, 0]}
    >
      {/* Glass pane */}
      <mesh>
        <boxGeometry args={[winW, winH, t]} />
        <meshPhysicalMaterial
          color="#b8daf5"
          transparent
          opacity={0.4}
          roughness={0.0}
          metalness={0.1}
          transmission={0.7}
        />
      </mesh>
      {/* Top frame */}
      <mesh position={[0, winH / 2 + frameT / 2, 0]}>
        <boxGeometry args={[winW + frameT * 2, frameT, t + 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, -winH / 2 - frameT / 2, 0]}>
        <boxGeometry args={[winW + frameT * 2, frameT, t + 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-(winW / 2 + frameT / 2), 0, 0]}>
        <boxGeometry args={[frameT, winH + frameT * 2, t + 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Right frame */}
      <mesh position={[winW / 2 + frameT / 2, 0, 0]}>
        <boxGeometry args={[frameT, winH + frameT * 2, t + 0.02]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Center divider */}
      <mesh>
        <boxGeometry args={[0.04, winH, t + 0.01]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// 3. AI SCENE — walls + floor slabs + doors + windows
// ─────────────────────────────────────────────────────────────
function AIScene({ walls, polygons, doors, windows, wallColor, wallHeight, autoRotate, isCorrected = false }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.07;
  });

  const hasWalls    = walls    && walls.length    > 0;
  const hasPolygons = polygons && polygons.length > 0;

  // Compute bounding box for ground plane
  const bounds = useMemo(() => {
    let minX = -55, maxX = 55, minZ = -55, maxZ = 55;
    if (hasWalls) {
      walls.forEach(w => {
        minX = Math.min(minX, w.centerX - w.length / 2);
        maxX = Math.max(maxX, w.centerX + w.length / 2);
        minZ = Math.min(minZ, w.centerZ - (w.thickness ?? 0.6) / 2);
        maxZ = Math.max(maxZ, w.centerZ + (w.thickness ?? 0.6) / 2);
      });
    }
    return {
      cx: (minX + maxX) / 2,
      cz: (minZ + maxZ) / 2,
      w:  maxX - minX + 20,
      d:  maxZ - minZ + 20,
    };
  }, [walls, hasWalls]);

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[bounds.cx, 0, bounds.cz]} receiveShadow>
        <planeGeometry args={[bounds.w, bounds.d]} />
        <meshStandardMaterial color="#c8bca8" roughness={1} />
      </mesh>

      {/* ── WALL POLYGONS → ExtrudedWallRing ─────────────────────────
           Each detected polygon is rendered as a hollow 3D wall ring
           following the exact polygon shape (not just 4 box segments).
           Only show if the layout HASN'T been corrected by the user yet.
      */}
      {!isCorrected && hasPolygons && polygons.map((poly, i) => (
        <ExtrudedWallRing
          key={`ring-${i}`}
          points={poly.points}
          wallHeight={wallHeight}
          wallColor={wallColor}
          insetRatio={0.87}
        />
      ))}

      {/* ── FLOOR SLABS — colored floors inside the wall rings ──── */}
      {hasPolygons && polygons.map((poly, i) => (
        <PolygonFloor key={`floor-${i}`} points={poly.points} colorIndex={i} />
      ))}

      {/* ── INTERNAL WALL SEGMENTS (WallBox) ─────────────────────────
           If CORRECTED: Render every wall segment in the walls[] array.
           If AI-ONLY: Render segments only if they are dense (more segments
           than room sides) to avoid re-drawing the outer hulls.
      */}
      {hasWalls && (isCorrected || walls.length > (polygons?.length ?? 0) * 5) && walls.map((wall, i) => (
        <WallBox
          key={`w-${i}`}
          wall={{ ...wall, height: wallHeight }}
          color={wallColor}
        />
      ))}

      {/* Doors — dark brown boxes */}
      {doors && doors.length > 0 && doors.map((door, i) => (
        <DoorMesh key={`d-${i}`} wall={{ ...door, height: wallHeight }} />
      ))}

      {/* Windows — semi-transparent glass slabs */}
      {windows && windows.length > 0 && windows.map((win, i) => (
        <WindowMesh key={`win-${i}`} wall={{ ...win, height: wallHeight }} />
      ))}

      {/* If no walls at all — show placeholder */}
      {!hasWalls && !hasPolygons && (
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[20, 4, 20]} />
          <meshStandardMaterial color={wallColor} wireframe />
        </mesh>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. STANDARD SCENE — parametric room boxes
// ─────────────────────────────────────────────────────────────
function Room({ position, dimensions, color }) {
  const w = dimensions.width, h = dimensions.height, d = dimensions.depth;
  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#c8bca8" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, h/2, -d/2]} castShadow>
        <boxGeometry args={[w, h, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-w/2, h/2, 0]} castShadow>
        <boxGeometry args={[0.2, h, d]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Right wall */}
      <mesh position={[w/2, h/2, 0]} castShadow>
        <boxGeometry args={[0.2, h, d]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function StandardScene({ modelData, finishes, autoRotate, showRoof = true }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.07;
  });

  const bounds = useMemo(() => {
    if (!modelData?.rooms) return { w: 15, d: 15, cx: 0, cz: 0, h: 3 };
    let minX=Infinity, maxX=-Infinity, minZ=Infinity, maxZ=-Infinity, maxY=0;
    modelData.rooms.forEach(r => {
      minX = Math.min(minX, r.position.x - r.dimensions.width/2);
      maxX = Math.max(maxX, r.position.x + r.dimensions.width/2);
      minZ = Math.min(minZ, r.position.z - r.dimensions.depth/2);
      maxZ = Math.max(maxZ, r.position.z + r.dimensions.depth/2);
      maxY = Math.max(maxY, r.dimensions.height);
    });
    return { w: maxX-minX, d: maxZ-minZ, cx:(minX+maxX)/2, cz:(minZ+maxZ)/2, h: maxY };
  }, [modelData]);

  if (!modelData?.rooms) return null;
  const wallColor = finishes?.wallColor || '#e8e0d0';

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[bounds.cx,-0.05,bounds.cz]} receiveShadow>
        <planeGeometry args={[bounds.w+15, bounds.d+15]} />
        <meshStandardMaterial color="#c8bca8" />
      </mesh>
      {modelData.rooms.map((room, i) => (
        <Room key={i} position={[room.position.x, room.position.y, room.position.z]}
          dimensions={room.dimensions} color={wallColor} />
      ))}
      {/* Simple flat roof - HIDE if showRoof is False */}
      {showRoof && (
        <mesh position={[bounds.cx, bounds.h+0.1, bounds.cz]} castShadow>
          <boxGeometry args={[bounds.w+1, 0.3, bounds.d+1]} />
          <meshStandardMaterial color="#8B6355" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. MAIN EXPORT AND WRAPPER
// ─────────────────────────────────────────────────────────────
export function CanvasWrapper({ children, autoRotate = false }) {
  return (
    <Canvas shadows camera={{ position: [40, 35, 55], fov: 50 }}>
      {/* Sky & Lights */}
      <Sky sunPosition={[100, 40, 100]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[25, 35, 20]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />
      <directionalLight position={[-20, 20, -30]} intensity={0.35} />

      <Suspense fallback={null}>
        {children}
      </Suspense>

      <gridHelper args={[140, 70, '#445566', '#1a2233']} position={[0, 0.01, 0]} />
      <OrbitControls
        target={[0, 2, 0]}
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}

export default function HouseModel3D({
  modelData, parameters, finishes,
  polygons, walls, doors, windows,
  wallHeight = 4, wallColor = '#e8e0d0',
  autoRotate = false, showRoof = true,
}) {
  const isAI = (walls && walls.length > 0) || (polygons && polygons.length > 0);
  const isCorrected = parameters?.isCorrected || parameters?.source === 'roboflow-corrected';

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <CanvasWrapper autoRotate={autoRotate}>
        {isAI ? (
          <AIScene
            walls={walls || []}
            polygons={polygons || []}
            doors={doors || []}
            windows={windows || []}
            wallColor={wallColor}
            wallHeight={wallHeight}
            autoRotate={autoRotate}
            isCorrected={isCorrected}
          />
        ) : (
          <StandardScene
            modelData={modelData}
            parameters={parameters}
            finishes={finishes}
            autoRotate={autoRotate}
            showRoof={showRoof}
          />
        )}
      </CanvasWrapper>
    </div>
  );
}

HouseModel3D.CanvasWrapper = CanvasWrapper;
