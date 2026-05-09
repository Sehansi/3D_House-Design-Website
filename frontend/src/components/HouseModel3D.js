import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// CONSTANTS & UTILS
// ─────────────────────────────────────────────────────────────
const WALL_H = 3.5;
const WALL_T = 0.8;  
const INNER_T = 0.6; 
const ADJ_TOL = 1.0;

function computeFloorWalls(rooms) {
  const outer = [];
  const inner = [];
  const innerSet = new Set();
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    if (!r.size || !r.position) continue;
    const [rW,, rD] = r.size;
    const [rX,, rZ] = r.position;
    const rL = rX - rW / 2, rR = rX + rW / 2;
    const rF = rZ - rD / 2, rB = rZ + rD / 2;
    const sides = [
      { axis: 'z', fixed: rL, span0: rF, span1: rB, dir: 'left' },
      { axis: 'z', fixed: rR, span0: rF, span1: rB, dir: 'right' },
      { axis: 'x', fixed: rF, span0: rL, span1: rR, dir: 'front' },
      { axis: 'x', fixed: rB, span0: rL, span1: rR, dir: 'back' },
    ];
    for (const side of sides) {
      let adjOvlp = null;
      for (let j = 0; j < rooms.length; j++) {
        if (j === i) continue;
        const n = rooms[j];
        if (!n.size || !n.position) continue;
        const [nW,, nD] = n.size;
        const [nX,, nZ] = n.position;
        const nL = nX - nW / 2, nR = nX + nW / 2;
        const nF = nZ - nD / 2, nB = nZ + nD / 2;
        if (side.axis === 'z') {
          const nEdge = side.dir === 'left' ? nR : nL;
          if (Math.abs(nEdge - side.fixed) < ADJ_TOL) {
            const o0 = Math.max(side.span0, nF), o1 = Math.min(side.span1, nB);
            if (o1 - o0 > 0.5) { adjOvlp = { span0: o0, span1: o1 }; break; }
          }
        } else {
          const nEdge = side.dir === 'front' ? nB : nF;
          if (Math.abs(nEdge - side.fixed) < ADJ_TOL) {
            const o0 = Math.max(side.span0, nL), o1 = Math.min(side.span1, nR);
            if (o1 - o0 > 0.5) { adjOvlp = { span0: o0, span1: o1 }; break; }
          }
        }
      }
      if (adjOvlp) {
        const key = `${side.axis}-${side.fixed.toFixed(1)}-${adjOvlp.span0.toFixed(1)}-${adjOvlp.span1.toFixed(1)}`;
        if (!innerSet.has(key)) {
          innerSet.add(key);
          inner.push({ axis: side.axis, fixed: side.fixed, span0: adjOvlp.span0, span1: adjOvlp.span1 });
        }
      } else {
        outer.push({ axis: side.axis, fixed: side.fixed, span0: side.span0, span1: side.span1, dir: side.dir });
      }
    }
  }
  return { outer, inner };
}

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────
function WallWithOpening({ wall, type = 'outer', color, openings = [] }) {
  const len = wall.span1 - wall.span0;
  const midS = (wall.span0 + wall.span1) / 2;
  const px = wall.axis === 'z' ? wall.fixed : midS;
  const pz = wall.axis === 'z' ? midS : wall.fixed;
  const ry = wall.axis === 'z' ? Math.PI / 2 : 0;
  const t = type === 'outer' ? WALL_T : INNER_T;
  const wallCol = type === 'outer' ? (color || "#1a202c") : "#ffffff";

  if (openings.length === 0) {
    return (
      <mesh position={[px, WALL_H / 2, pz]} rotation={[0, ry, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, WALL_H, t]} />
        <meshStandardMaterial color={wallCol} roughness={0.6} />
      </mesh>
    );
  }

  const op = openings[0]; 
  const opPos = wall.axis === 'z' ? op.centerZ : op.centerX;
  const opLen = op.length || (op.type === 'door' ? 1.4 : 2.2);
  const opH = op.type === 'door' ? 2.6 : 1.6;
  const opY = op.type === 'door' ? 0 : 1.4;
  
  const relPos = opPos - wall.span0;
  const s1Len = Math.max(0, relPos - opLen / 2);
  const s2Len = Math.max(0, len - (relPos + opLen / 2));

  return (
    <group position={[px, 0, pz]} rotation={[0, ry, 0]}>
      {s1Len > 0.05 && (
        <mesh position={[-len / 2 + s1Len / 2, WALL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[s1Len, WALL_H, t]} />
          <meshStandardMaterial color={wallCol} />
        </mesh>
      )}
      {s2Len > 0.05 && (
        <mesh position={[len / 2 - s2Len / 2, WALL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[s2Len, WALL_H, t]} />
          <meshStandardMaterial color={wallCol} />
        </mesh>
      )}
      <mesh position={[-len / 2 + relPos, opY + opH + (WALL_H - (opY + opH)) / 2, 0]} castShadow>
        <boxGeometry args={[opLen, WALL_H - (opY + opH), t]} />
        <meshStandardMaterial color={wallCol} />
      </mesh>
      {opY > 0.1 && (
        <mesh position={[-len / 2 + relPos, opY / 2, 0]} castShadow>
          <boxGeometry args={[opLen, opY, t]} />
          <meshStandardMaterial color={wallCol} />
        </mesh>
      )}
    </group>
  );
}

function DoorMesh({ door }) {
  return (
    <group position={[door.centerX, 1.3, door.centerZ]} rotation={[0, door.rotation || 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 2.5, 0.2]} />
        <meshStandardMaterial color="#ecc94b" />
      </mesh>
    </group>
  );
}

function WindowMesh({ win }) {
  return (
    <group position={[win.centerX, 2.2, win.centerZ]} rotation={[0, win.rotation || 0, 0]}>
      <mesh>
        <boxGeometry args={[2.0, 1.5, 0.1]} />
        <meshPhysicalMaterial color="#a5d8ff" transparent opacity={0.35} transmission={0.8} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// FURNITURE
// ─────────────────────────────────────────────────────────────
function FurnitureItem({ type, position, rotation = 0, scale = 1 }) {
  const model = useMemo(() => {
    switch ((type || '').toLowerCase()) {
      case 'sofa':
        return (<group scale={scale}>
          <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[2.8, 0.6, 1.1]} /><meshStandardMaterial color="#4a5568" /></mesh>
          <mesh position={[0, 0.8, -0.45]} castShadow><boxGeometry args={[2.8, 1.0, 0.2]} /><meshStandardMaterial color="#2d3748" /></mesh>
        </group>);
      case 'bed':
        return (<group scale={scale}>
          <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[2.2, 0.5, 2.4]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, 0.9, -1.15]} castShadow><boxGeometry args={[2.2, 1.3, 0.2]} /><meshStandardMaterial color="#4a5568" /></mesh>
        </group>);
      case 'kitchen':
        return (<group scale={scale}>
          <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[3.2, 1.0, 0.8]} /><meshStandardMaterial color="#f7fafc" /></mesh>
          <mesh position={[0, 1.02, 0]}><boxGeometry args={[3.3, 0.1, 0.85]} /><meshStandardMaterial color="#1a202c" /></mesh>
        </group>);
      default: return null;
    }
  }, [type, scale]);
  if (!model) return null;
  return <group position={position} rotation={[0, rotation, 0]}>{model}</group>;
}

function RoomContent({ room }) {
  const [w,, d] = room.size || [5, 3, 5];
  const [x,, z] = room.position || [0, 0, 0];
  const t = (room.type || '').toLowerCase();
  
  return (
    <group>
      {/* Floor for room */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[x, 0.02, z]} receiveShadow>
        <planeGeometry args={[w - 0.2, d - 0.2]} />
        <meshStandardMaterial color={t.includes('bath') ? '#e2e8f0' : '#f0e6d2'} roughness={0.8} />
      </mesh>
      
      {t.includes('living') && <FurnitureItem type="sofa" position={[x, 0.05, z]} scale={Math.max(0.8, Math.min(w, d) * 0.25)} />}
      {t.includes('bedroom') && <FurnitureItem type="bed" position={[x, 0.05, z]} scale={Math.max(0.8, Math.min(w, d) * 0.35)} />}
      {t.includes('kitchen') && <FurnitureItem type="kitchen" position={[x, 0.05, z]} scale={Math.max(0.8, Math.min(w, d) * 0.35)} />}
      
      <Text position={[x, 4.0, z]} fontSize={0.75} color="#1a202c" anchorX="center" outlineWidth={0.03} outlineColor="white">
        {room.type?.toUpperCase()}
      </Text>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// SCENE
// ─────────────────────────────────────────────────────────────
function AIScene({ rooms, doors, windows, wallColor, autoRotate }) {
  const groupRef = useRef();
  useFrame((_, delta) => { if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.05; });

  const { outer, inner } = useMemo(() => computeFloorWalls(rooms), [rooms]);

  const wallWithOps = useMemo(() => {
    const checkOp = (w) => {
      const ops = [];
      doors.forEach(d => {
        if (w.axis === 'z' && Math.abs(d.centerX - w.fixed) < 1.0 && d.centerZ > w.span0 && d.centerZ < w.span1) ops.push({...d, type:'door'});
        else if (w.axis === 'x' && Math.abs(d.centerZ - w.fixed) < 1.0 && d.centerX > w.span0 && d.centerX < w.span1) ops.push({...d, type:'door'});
      });
      windows.forEach(win => {
        if (w.axis === 'z' && Math.abs(win.centerX - w.fixed) < 1.0 && win.centerZ > w.span0 && win.centerZ < w.span1) ops.push({...win, type:'window'});
        else if (w.axis === 'x' && Math.abs(win.centerZ - w.fixed) < 1.0 && win.centerX > w.span0 && win.centerX < w.span1) ops.push({...win, type:'window'});
      });
      return ops;
    };
    return {
      outer: outer.map(w => ({ ...w, openings: checkOp(w) })),
      inner: inner.map(w => ({ ...w, openings: checkOp(w) })),
    };
  }, [outer, inner, doors, windows]);

  return (
    <group ref={groupRef}>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Large Floor Slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#f7fafc" />
      </mesh>
      <gridHelper args={[150, 150, '#e2e8f0', '#edf2f7']} position={[0, 0.01, 0]} />

      {wallWithOps.outer.map((w, i) => <WallWithOpening key={`out-${i}`} wall={w} type="outer" color={wallColor} openings={w.openings} />)}
      {wallWithOps.inner.map((w, i) => <WallWithOpening key={`in-${i}`} wall={w} type="inner" openings={w.openings} />)}
      {rooms.map((r, i) => <RoomContent key={i} room={r} />)}
      {doors.map((d, i) => <DoorMesh key={i} door={d} />)}
      {windows.map((w, i) => <WindowMesh key={i} win={w} />)}
      
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={100} blur={2} far={10} />
    </group>
  );
}

export function CanvasWrapper({ children, autoRotate = false }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [50, 50, 50], fov: 40 }}>
        <Sky sunPosition={[100, 50, 100]} turbidity={0.1} rayleigh={0.5} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 80, 50]} intensity={1.5} castShadow shadow-mapSize={[4096, 4096]} />
        <Suspense fallback={null}>{children}</Suspense>
        <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2.2} minDistance={20} maxDistance={150} />
      </Canvas>
    </div>
  );
}

function HouseModel3D({ rooms, doors, windows, wallColor = '#5c4033', autoRotate = false }) {
  if (!rooms || rooms.length === 0) return <div style={{ color: 'white', padding: '20px', textAlign:'center', marginTop:'20%' }}>🏗️ RECONSTRUCTING SPACIOUS ARCHITECTURE...</div>;
  return (
    <CanvasWrapper autoRotate={autoRotate}>
      <AIScene rooms={rooms} doors={doors || []} windows={windows || []} wallColor={wallColor} autoRotate={autoRotate} />
    </CanvasWrapper>
  );
}

HouseModel3D.CanvasWrapper = CanvasWrapper;
export default HouseModel3D;
