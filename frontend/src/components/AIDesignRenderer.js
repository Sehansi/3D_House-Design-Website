import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// GABLED ROOF COMPONENT
// Creates a classic triangular gable roof using ExtrudeGeometry.
// Fits over the entire house footprint with an overhang.
// ─────────────────────────────────────────────────────────────
function GabledRoof({ bounds, topY, style }) {
  const overhang  = 0.7;          // roof extends past walls
  const roofW     = bounds.w + overhang * 2;
  const roofD     = bounds.d + overhang * 2;
  const ridgeH    = Math.min(roofW, roofD) * 0.32;  // height of the peak

  // Roof colour by style
  const roofColors = {
    modern: '#5a6270', minimalist: '#888', industrial: '#3a3a3a',
    luxury: '#7a5c3a', rustic: '#6b4226', default: '#8B6355',
  };
  const color = roofColors[(style || 'default').toLowerCase()] || roofColors.default;

  // Triangle cross-section (XY) extruded along Z
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-roofW / 2, 0);
    s.lineTo(0,          ridgeH);
    s.lineTo(roofW / 2,  0);
    s.closePath();
    return s;
  }, [roofW, ridgeH]);

  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: roofD, bevelEnabled: false,
    });
    // Center the extrusion (it goes +Z by default)
    g.translate(0, 0, -roofD / 2);
    return g;
  }, [shape, roofD]);

  return (
    <group position={[bounds.cx, topY, bounds.cz]}>
      {/* Main gable roof */}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Ridge cap (thin box along the peak) */}
      <mesh position={[0, ridgeH + 0.04, 0]} castShadow>
        <boxGeometry args={[0.18, 0.08, roofD + 0.2]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
      </mesh>

      {/* Chimney */}
      <mesh position={[roofW * 0.18, ridgeH * 0.55, roofD * 0.12 - roofD / 2]} castShadow>
        <boxGeometry args={[0.4, ridgeH * 0.65, 0.4]} />
        <meshStandardMaterial color="#b55" roughness={0.9} />
      </mesh>
      <mesh position={[roofW * 0.18, ridgeH + 0.04, roofD * 0.12 - roofD / 2]}>
        <boxGeometry args={[0.46, 0.08, 0.46]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const WALL_H   = 3.5;   // wall height per floor
const WALL_T   = 0.22;  // outer wall thickness
const INNER_T  = 0.15;  // inner partition wall thickness
const DOOR_W   = 1.0;   // door opening width
const DOOR_H   = 2.2;   // door opening height
const ADJ_TOL  = 1.0;   // adjacency tolerance (scene units)
const SLAB_T   = 0.18;  // inter-floor concrete slab thickness

const ROOM_FLOOR = {
  'living room': '#dbeafe', 'bedroom': '#fef3c7', 'kitchen': '#fee2e2',
  'bathroom': '#e0f2fe', 'dining room': '#f5f3ff', 'hallway': '#f0fdf4',
  'office': '#fdf4ff', 'staircase': '#e5e7eb', 'default': '#f3f4f6',
};

const STYLE_WALL = {
  modern: '#f0f0f0', minimalist: '#ffffff', industrial: '#4a4a4a',
  luxury: '#f5f0e8', rustic: '#ddd0c0', default: '#e8e0d0',
};

// ─────────────────────────────────────────────────────────────
// 1. ADJACENCY — works within a single floor level
// ─────────────────────────────────────────────────────────────
function computeFloorWalls(rooms) {
  const outer    = [];
  const inner    = [];
  const innerSet = new Set();

  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    if (!r.size || !r.position) continue;
    const [rW,, rD] = r.size;
    const [rX,, rZ] = r.position;
    const rL = rX - rW / 2, rR = rX + rW / 2;
    const rF = rZ - rD / 2, rB = rZ + rD / 2;

    const sides = [
      { axis: 'z', fixed: rL,  span0: rF, span1: rB, dir: 'left'  },
      { axis: 'z', fixed: rR,  span0: rF, span1: rB, dir: 'right' },
      { axis: 'x', fixed: rF,  span0: rL, span1: rR, dir: 'front' },
      { axis: 'x', fixed: rB,  span0: rL, span1: rR, dir: 'back'  },
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
// 2. OUTER WALL  (yBase = floor bottom, height = WALL_H)
//    Long faces → window opening
// ─────────────────────────────────────────────────────────────
function OuterWall({ wall, color, yBase }) {
  const len  = wall.span1 - wall.span0;
  const midS = (wall.span0 + wall.span1) / 2;
  const px   = wall.axis === 'z' ? wall.fixed : midS;
  const pz   = wall.axis === 'z' ? midS       : wall.fixed;
  const ry   = wall.axis === 'z' ? Math.PI / 2 : 0;

  const hasWin = len > 2.5;
  const winW   = Math.min(len * 0.42, 1.8);
  const winH   = 1.1;
  const winY   = yBase + WALL_H * 0.62;
  const wt     = 0.04;
  const gapH   = winW / 2;
  const sideLen = Math.max(0, len / 2 - gapH - 0.01);

  if (hasWin) {
    return (
      <group position={[px, 0, pz]} rotation={[0, ry, 0]}>
        {/* Left segment */}
        <mesh position={[-(gapH + sideLen / 2), yBase + WALL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideLen, WALL_H, WALL_T]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Right segment */}
        <mesh position={[gapH + sideLen / 2, yBase + WALL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideLen, WALL_H, WALL_T]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Header above window */}
        <mesh position={[0, yBase + WALL_H - (WALL_H - DOOR_H) / 2, 0]} castShadow>
          <boxGeometry args={[winW, WALL_H - DOOR_H, WALL_T]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Sill */}
        <mesh position={[0, winY - winH / 2 - 0.1, 0]}>
          <boxGeometry args={[winW + 0.1, 0.12, WALL_T + 0.04]} />
          <meshStandardMaterial color="#ccc" roughness={0.4} />
        </mesh>
        {/* Glass */}
        <mesh position={[0, winY, 0]}>
          <boxGeometry args={[winW, winH, wt]} />
          <meshPhysicalMaterial color="#b8daf5" transparent opacity={0.38} roughness={0} transmission={0.75} />
        </mesh>
        {/* Frame sides */}
        {[-winW / 2 - 0.04, winW / 2 + 0.04].map((fx, k) => (
          <mesh key={k} position={[fx, winY, 0]}>
            <boxGeometry args={[0.06, winH + 0.08, WALL_T + 0.03]} />
            <meshStandardMaterial color="#999" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        {/* Frame top */}
        <mesh position={[0, winY + winH / 2 + 0.03, 0]}>
          <boxGeometry args={[winW + 0.08, 0.06, WALL_T + 0.03]} />
          <meshStandardMaterial color="#999" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[px, yBase + WALL_H / 2, pz]} rotation={[0, ry, 0]} castShadow receiveShadow>
      <boxGeometry args={[len, WALL_H, WALL_T]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. INNER DIVIDING WALL  with door
// ─────────────────────────────────────────────────────────────
function InnerWallWithDoor({ wall, color, yBase }) {
  const len    = wall.span1 - wall.span0;
  const midS   = (wall.span0 + wall.span1) / 2;
  const px     = wall.axis === 'z' ? wall.fixed : midS;
  const pz     = wall.axis === 'z' ? midS       : wall.fixed;
  const ry     = wall.axis === 'z' ? Math.PI / 2 : 0;
  const sideLen = Math.max(0, (len - DOOR_W) / 2);

  return (
    <group position={[px, 0, pz]} rotation={[0, ry, 0]}>
      {sideLen > 0.05 && <>
        <mesh position={[-(DOOR_W / 2 + sideLen / 2), yBase + WALL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideLen, WALL_H, INNER_T]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
        <mesh position={[DOOR_W / 2 + sideLen / 2, yBase + WALL_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideLen, WALL_H, INNER_T]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
      </>}
      {/* Header above door */}
      {WALL_H > DOOR_H + 0.1 && (
        <mesh position={[0, yBase + DOOR_H + (WALL_H - DOOR_H) / 2, 0]}>
          <boxGeometry args={[DOOR_W, WALL_H - DOOR_H, INNER_T]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
      )}
      {/* Door panel */}
      <mesh position={[0, yBase + DOOR_H / 2, 0]} castShadow>
        <boxGeometry args={[DOOR_W - 0.08, DOOR_H, INNER_T * 0.5]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.65} />
      </mesh>
      {/* Knob */}
      <mesh position={[DOOR_W * 0.35, yBase + DOOR_H * 0.45, INNER_T * 0.4]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.15} />
      </mesh>
      {/* Frame strips */}
      {[-DOOR_W / 2 - 0.04, DOOR_W / 2 + 0.04].map((fx, k) => (
        <mesh key={k} position={[fx, yBase + DOOR_H / 2, 0]}>
          <boxGeometry args={[0.07, DOOR_H, INNER_T + 0.02]} />
          <meshStandardMaterial color="#3a2410" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. FLOOR SLAB  (concrete between storeys OR ground floor)
// ─────────────────────────────────────────────────────────────
function FloorSlab({ bounds, yPos, isGround }) {
  return (
    <mesh position={[bounds.cx, yPos, bounds.cz]} receiveShadow>
      <boxGeometry args={[bounds.w + WALL_T, SLAB_T, bounds.d + WALL_T]} />
      <meshStandardMaterial color={isGround ? '#b0b0b0' : '#d1d5db'} roughness={0.9} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. ROOM FLOOR FINISH (colored carpet/tile per room)
// ─────────────────────────────────────────────────────────────
function RoomFloor({ room, yBase }) {
  const [w,, d] = room.size;
  const [x,, z] = room.position;
  const color   = ROOM_FLOOR[room.type] || ROOM_FLOOR.default;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, yBase + SLAB_T / 2 + 0.01, z]} receiveShadow>
      <planeGeometry args={[w - 0.02, d - 0.02]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. STAIRCASE  between floors
// ─────────────────────────────────────────────────────────────
function Staircase({ position, fromY, toY }) {
  const steps  = 14;
  const totalH = toY - fromY;
  const sH     = totalH / steps;
  const sW     = 0.9;
  const sD     = totalH / steps;  // step depth

  return (
    <group position={position}>
      {/* Central support rail */}
      <mesh position={[0, fromY + totalH / 2, totalH / 2]}>
        <boxGeometry args={[0.06, totalH, 0.06]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh
          key={i}
          position={[0, fromY + (i + 0.5) * sH, (i + 0.5) * sD]}
          castShadow
        >
          <boxGeometry args={[sW, sH * 0.3, sD * 1.05]} />
          <meshStandardMaterial color="#7c6f5e" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. ROOM LABEL
// ─────────────────────────────────────────────────────────────
function RoomLabel3D({ room, yBase }) {
  const [x,, z] = room.position;
  return (
    <Text
      position={[x, 4.0, z]}
      fontSize={0.4}
      color="#1e1e2e"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.015}
      outlineColor="white"
    >
      {room.type || room.name || 'Room'}
    </Text>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. FURNITURE  (unchanged from before)
// ─────────────────────────────────────────────────────────────
function FurnitureItem({ type, position, rotation = 0, scale = 1 }) {
  const model = useMemo(() => {
    switch ((type || '').toLowerCase()) {
      case 'sofa':
        return (<group scale={scale}>
          <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[2.2, 0.5, 0.9]} /><meshStandardMaterial color="#2d3748" roughness={0.8} /></mesh>
          <mesh position={[0, 0.65, -0.38]} castShadow><boxGeometry args={[2.2, 0.85, 0.2]} /><meshStandardMaterial color="#1a202c" /></mesh>
        </group>);
      case 'bed':
        return (<group scale={scale}>
          <mesh position={[0, 0.22, 0]} castShadow><boxGeometry args={[1.8, 0.45, 2.1]} /><meshStandardMaterial color="#edf2f7" roughness={0.9} /></mesh>
          <mesh position={[0, 0.7, -1.0]} castShadow><boxGeometry args={[1.8, 1.1, 0.15]} /><meshStandardMaterial color="#2d3748" /></mesh>
        </group>);
      case 'dining table':
        return (<group scale={scale}>
          <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[1.5, 0.05, 0.9]} /><meshStandardMaterial color="#634b3a" /></mesh>
          {[-0.6, 0.6].map(x => [-0.3, 0.3].map(z => (
            <mesh key={`${x}-${z}`} position={[x, 0.375, z]} castShadow><boxGeometry args={[0.05, 0.75, 0.05]} /><meshStandardMaterial color="#2d1c0c" /></mesh>
          )))}
        </group>);
      case 'kitchen counter':
        return (<group scale={scale}>
          <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[2.0, 0.9, 0.6]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
          <mesh position={[0, 0.92, 0]}><boxGeometry args={[2.05, 0.05, 0.65]} /><meshStandardMaterial color="#1f2937" /></mesh>
        </group>);
      case 'tv unit':
        return (<group scale={scale}>
          <mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[1.5, 0.3, 0.35]} /><meshStandardMaterial color="#1a202c" metalness={0.8} /></mesh>
          <mesh position={[0, 0.9, 0]}><boxGeometry args={[1.4, 0.8, 0.04]} /><meshStandardMaterial color="#000" emissive="#111" /></mesh>
        </group>);
      case 'plant':
        return (<group scale={scale}>
          <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.18, 0.12, 0.4, 16]} /><meshStandardMaterial color="#5d4037" /></mesh>
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
            <mesh position={[0, 0.65, 0]}><sphereGeometry args={[0.32, 12, 12]} /><meshStandardMaterial color="#38a169" roughness={1} /></mesh>
          </Float>
        </group>);
      case 'bathtub':
        return (<group scale={scale}>
          <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={[0.85, 0.5, 1.7]} /><meshStandardMaterial color="#e5e7eb" roughness={0.2} /></mesh>
        </group>);
      case 'desk':
        return (<group scale={scale}>
          <mesh position={[0, 0.75, 0]} castShadow><boxGeometry args={[1.4, 0.04, 0.7]} /><meshStandardMaterial color="#634b3a" /></mesh>
          {[-0.6, 0.6].map(x => (<mesh key={x} position={[x, 0.37, 0]}><boxGeometry args={[0.05, 0.75, 0.05]} /><meshStandardMaterial color="#2d1c0c" /></mesh>))}
        </group>);
      default: return null;
    }
  }, [type, scale]);

  if (!model) return null;
  return <group position={position} rotation={[0, rotation, 0]}>{model}</group>;
}

function RoomFurniture({ room, yBase }) {
  const [w,, d] = room.size;
  const [x,, z] = room.position;
  const t       = room.type || '';
  const fy      = yBase + SLAB_T / 2 + 0.02;

  if (t.includes('living'))  return <group>
    <FurnitureItem type="sofa"    position={[x, fy, z - d * 0.25]} scale={Math.min(w, d) * 0.25} />
    <FurnitureItem type="tv unit" position={[x, fy, z + d * 0.38]} rotation={Math.PI} scale={Math.min(w, d) * 0.24} />
    <FurnitureItem type="plant"   position={[x - w * 0.38, fy, z + d * 0.38]} scale={0.8} />
  </group>;
  if (t.includes('bedroom')) return <group>
    <FurnitureItem type="bed"   position={[x + w * 0.1, fy, z - d * 0.12]} scale={Math.min(w, d) * 0.37} />
    <FurnitureItem type="plant" position={[x + w * 0.38, fy, z + d * 0.38]} scale={0.7} />
  </group>;
  if (t.includes('dining'))  return <FurnitureItem type="dining table" position={[x, fy, z]} scale={Math.min(w, d) * 0.37} />;
  if (t.includes('kitchen')) return <FurnitureItem type="kitchen counter" position={[x, fy, z - d * 0.38]} scale={Math.min(w, d) * 0.3} />;
  if (t.includes('bathroom'))return <FurnitureItem type="bathtub" position={[x - w * 0.18, fy, z]} scale={Math.min(w, d) * 0.38} />;
  if (t.includes('office'))  return <FurnitureItem type="desk"    position={[x, fy, z - d * 0.28]} scale={Math.min(w, d) * 0.28} />;
  return null;
}

// ─────────────────────────────────────────────────────────────
// 9. MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export default function AIDesignRenderer({ data, autoRotate = false, showRoof = true }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const style     = (data.style || 'modern').toLowerCase();
  const wallColor = STYLE_WALL[style] || STYLE_WALL.default;

  // ── Normalise rooms ──────────────────────────────────────────
  const rooms = useMemo(() => {
    if (!data.rooms || !Array.isArray(data.rooms)) return [];
    return data.rooms.map(r => ({
      ...r,
      type:     (r.type || r.name || 'room').toLowerCase(),
      size:     r.size     || [4, WALL_H, 4],
      position: r.position || [0, 0, 0],
    }));
  }, [data.rooms]);

  // ── Group rooms by floor index ───────────────────────────────
  // A room belongs to floor N if position[1] rounds to N * WALL_H
  const floorGroups = useMemo(() => {
    const map = {};
    rooms.forEach(r => {
      const floorIdx = Math.round(r.position[1] / WALL_H);
      if (!map[floorIdx]) map[floorIdx] = [];
      // Offset room position to start from y=0 within its floor
      map[floorIdx].push({
        ...r,
        position: [r.position[0], 0, r.position[2]],   // flatten to y=0 for wall calc
        _yBase: floorIdx * WALL_H,                       // real y base for rendering
      });
    });
    return map;
  }, [rooms]);

  const floorIndices = useMemo(() => Object.keys(floorGroups).map(Number).sort((a, b) => a - b), [floorGroups]);
  const numFloors    = floorIndices.length;

  // ── Overall bounding box ────────────────────────────────────
  const bounds = useMemo(() => {
    if (rooms.length === 0) return { w: 15, d: 15, cx: 0, cz: 0 };
    let mnX = Infinity, mxX = -Infinity, mnZ = Infinity, mxZ = -Infinity;
    rooms.forEach(r => {
      const [rW,, rD] = r.size, [rX,, rZ] = r.position;
      mnX = Math.min(mnX, rX - rW / 2); mxX = Math.max(mxX, rX + rW / 2);
      mnZ = Math.min(mnZ, rZ - rD / 2); mxZ = Math.max(mxZ, rZ + rD / 2);
    });
    return { w: mxX - mnX, d: mxZ - mnZ, cx: (mnX + mxX) / 2, cz: (mnZ + mxZ) / 2 };
  }, [rooms]);

  // ── Per-floor wall sets ─────────────────────────────────────
  const floorWalls = useMemo(() => {
    const result = {};
    floorIndices.forEach(fi => {
      result[fi] = computeFloorWalls(floorGroups[fi]);
    });
    return result;
  }, [floorGroups, floorIndices]);

  // ── Find a good staircase position (centre of building) ─────
  const stairPos = [bounds.cx + bounds.w * 0.25, 0, bounds.cz + bounds.d * 0.25];

  const hasVisionWalls = data.walls && data.walls.length > 0;

  return (
    <group ref={groupRef}>
      {/* Extended garden ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[bounds.cx, -0.02, bounds.cz]} receiveShadow>
        <planeGeometry args={[bounds.w + 22, bounds.d + 22]} />
        <meshStandardMaterial color="#8fba8f" roughness={1} />
      </mesh>

      {/* Foundation slab */}
      <mesh position={[bounds.cx, -0.06, bounds.cz]}>
        <boxGeometry args={[bounds.w + 0.6, 0.1, bounds.d + 0.6]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.9} />
      </mesh>

      {/* ── CONNECTED MULTI-FLOOR HOUSE ───────────────────────── */}
      {!hasVisionWalls && rooms.length > 0 && floorIndices.map(fi => {
        const floorRooms = floorGroups[fi];
        const yBase      = fi * WALL_H + (fi > 0 ? SLAB_T * fi : 0);
        const { outer, inner } = floorWalls[fi];
        const isTop      = fi === floorIndices[floorIndices.length - 1];

        // Floor bounds for this storey's slab
        let fmnX=Infinity, fmxX=-Infinity, fmnZ=Infinity, fmxZ=-Infinity;
        floorRooms.forEach(r => {
          const [rW,, rD] = r.size, [rX,, rZ] = r.position;
          fmnX = Math.min(fmnX, rX - rW/2); fmxX = Math.max(fmxX, rX + rW/2);
          fmnZ = Math.min(fmnZ, rZ - rD/2); fmxZ = Math.max(fmxZ, rZ + rD/2);
        });
        const fb = { w: fmxX-fmnX, d: fmxZ-fmnZ, cx:(fmnX+fmxX)/2, cz:(fmnZ+fmxZ)/2 };

        return (
          <group key={`floor-${fi}`}>
            {/* Concrete floor slab at bottom of this storey */}
            <FloorSlab bounds={fb} yPos={yBase} isGround={fi === 0} />

            {/* Colored room finishes */}
            {floorRooms.map((r, i) => (
              <RoomFloor key={`rf-${i}`} room={r} yBase={yBase} />
            ))}

            {/* Outer walls with windows */}
            {outer.map((w, i) => (
              <OuterWall key={`ow-${i}`} wall={w} color={wallColor} yBase={yBase} />
            ))}

            {/* Inner dividing walls with doors */}
            {inner.map((w, i) => (
              <InnerWallWithDoor key={`iw-${i}`} wall={w} color={wallColor} yBase={yBase} />
            ))}

            {/* Room labels */}
            {floorRooms.map((r, i) => (
              <RoomLabel3D key={`lb-${i}`} room={r} yBase={yBase} />
            ))}

            {/* Auto furniture */}
            {floorRooms.map((r, i) => (
              <RoomFurniture key={`fu-${i}`} room={r} yBase={yBase} />
            ))}

            {/* Ceiling panel on top floor only - HIDE if showRoof is False */}
            {isTop && showRoof && (
              <mesh position={[fb.cx, yBase + WALL_H, fb.cz]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[fb.w + WALL_T, fb.d + WALL_T]} />
                <meshStandardMaterial color="#f5f5f0" roughness={1} side={THREE.FrontSide} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* ── STAIRCASE between floors ─────────────────────────── */}
      {!hasVisionWalls && numFloors > 1 && floorIndices.slice(0, -1).map((fi, i) => {
        const fromY = fi * WALL_H + (fi > 0 ? SLAB_T * fi : 0) + SLAB_T;
        const toY   = (fi + 1) * WALL_H + SLAB_T * (fi + 1);
        return (
          <Staircase key={`stair-${i}`} position={stairPos} fromY={fromY} toY={toY} />
        );
      })}

      {/* ── GABLED ROOF on the topmost floor ─────────────────── */}
      {showRoof && !hasVisionWalls && rooms.length > 0 && (() => {
        const topFi = floorIndices[floorIndices.length - 1];
        const topY  = topFi * WALL_H + (topFi > 0 ? SLAB_T * topFi : 0) + WALL_H;
        return (
          <GabledRoof bounds={bounds} topY={topY} style={style} />
        );
      })()}

      {/* ── VISION / POLYGON PATH (Gemini Vision / upload) ────── */}
      {hasVisionWalls && (
        <>
          {data.walls.map((w, i) => {
            const dx  = w.end?.x - w.start?.x || w.length * Math.cos(w.rotation || 0);
            const dz  = w.end?.z - w.start?.z || w.length * Math.sin(w.rotation || 0);
            const len = Math.sqrt(dx * dx + dz * dz);
            const cx  = w.start ? (w.start.x + w.end.x) / 2 : w.centerX;
            const cz  = w.start ? (w.start.z + w.end.z) / 2 : w.centerZ;
            const rot = -Math.atan2(dz, dx);
            return (
              <mesh key={i} position={[cx, (w.height || WALL_H) / 2, cz]} rotation={[0, rot, 0]} castShadow>
                <boxGeometry args={[len, w.height || WALL_H, w.thickness || WALL_T]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
              </mesh>
            );
          })}
          {data.rooms?.map((r, i) => (
            <Text key={i} position={[r.center?.x || 0, 3.6, r.center?.z || 0]} fontSize={0.5} color="#1e1e2e" anchorX="center">
              {r.name}
            </Text>
          ))}
        </>
      )}

      {/* Atmosphere */}
      <ContactShadows position={[bounds.cx, -0.01, bounds.cz]} opacity={0.3} scale={70} blur={3} far={12} color="#000" />
      <gridHelper args={[120, 60, '#555', '#333']} position={[0, -0.01, 0]} />
    </group>
  );
}
