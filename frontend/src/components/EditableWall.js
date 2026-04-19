/**
 * EditableWall.js
 * ───────────────
 * A selectable, transformable 3D wall mesh.
 *
 * KEY FIX: Uses `ref={setMeshObj}` (state-setter as ref callback) so that
 * the Three.js mesh OBJECT is available in state before TransformControls
 * mounts. Passing `object={meshRef}` (the ref wrapper) was causing
 * "Cannot read properties of null (reading 'updateMatrixWorld')".
 *
 * Props:
 *  wall       WallData  {centerX, centerZ, length, rotation, thickness, height}
 *  index      number    Unique index in the walls[] array
 *  isSelected boolean   Controlled by parent
 *  mode       string    'translate' | 'rotate' | 'scale'
 *  snapSize   number    Grid snap size in Three.js units (default 0.5)
 *  wallColor  string    Hex colour for unselected walls
 *  onSelect   fn(index) Called when user clicks this wall
 *  onUpdate   fn(index, updatedWall) Called after user releases the gizmo
 *  onDragStart fn()     Called on drag start → parent disables OrbitControls
 *  onDragEnd   fn()     Called on drag end   → parent re-enables OrbitControls
 */

import React, { useState, useCallback } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

// ── Snap helper ──────────────────────────────────────────────────────────────
function snap(value, size) {
  if (!size || size <= 0) return value;
  return Math.round(value / size) * size;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function EditableWall({
  wall,
  index,
  isSelected,
  mode        = 'translate',
  snapSize    = 0.5,
  wallColor   = '#d4c9b0',
  onSelect,
  onUpdate,
  onDragStart,
  onDragEnd,
}) {
  // Use a state ref callback so the Three.js mesh object is available
  // as a proper state value before TransformControls renders.
  // This avoids the null reference crash on updateMatrixWorld.
  const [meshObj, setMeshObj] = useState(null);
  const [hovered, setHovered] = useState(false);

  const h   = wall.height    ?? 5;
  const t   = wall.thickness ?? 1.5;
  const len = wall.length    ?? 1;

  const color = isSelected
    ? '#00d9ff'
    : hovered
    ? '#b266ff'
    : wallColor;

  // ── Snap & emit updated wall data when drag ends ──────────────────────────
  const handleChange = useCallback(() => {
    if (!meshObj || !onUpdate) return;

    const pos = meshObj.position;
    const rot = meshObj.rotation;
    const scl = meshObj.scale;

    const snappedX = snap(pos.x, snapSize);
    const snappedZ = snap(pos.z, snapSize);
    const wallH    = (wall.height    ?? 5)   * scl.y;
    const newLen   = (wall.length    ?? 1)   * scl.x;
    const newThick = (wall.thickness ?? 1.5) * scl.z;

    // Force mesh to snapped position
    meshObj.position.set(snappedX, wallH / 2, snappedZ);

    // Snap rotation to 15° steps (π/12)
    const snappedR = snap(rot.y, Math.PI / 12);
    meshObj.rotation.set(0, snappedR, 0);

    onUpdate(index, {
      ...wall,
      centerX:   snappedX,
      centerZ:   snappedZ,
      rotation:  snappedR,
      height:    wallH,
      length:    newLen,
      thickness: newThick,
    });
  }, [meshObj, wall, index, snapSize, onUpdate]);

  return (
    <>
      {/*
        TransformControls only mounts when:
          1. This wall is selected (isSelected)
          2. The Three.js mesh object is available (meshObj !== null)
        Passing object={meshObj} (the actual THREE.Mesh) is correct.
        Never pass the React ref object { current: mesh } — that causes
        the "Cannot read properties of null (reading 'updateMatrixWorld')" crash.
      */}
      {isSelected && meshObj && (
        <TransformControls
          object={meshObj}
          mode={mode}
          translationSnap={snapSize}
          rotationSnap={Math.PI / 12}
          scaleSnap={0.1}
          onMouseDown={onDragStart}
          onMouseUp={() => {
            handleChange();
            onDragEnd?.();
          }}
        />
      )}

      {/* Wall mesh — ref={setMeshObj} stores the Three.js object in state */}
      <mesh
        ref={setMeshObj}
        position={[wall.centerX, h / 2, wall.centerZ]}
        rotation={[0, wall.rotation ?? 0, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[len, h, t]} />
        <meshStandardMaterial
          color={color}
          roughness={0.65}
          metalness={0.05}
          emissive={isSelected ? '#002244' : '#000000'}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>

      {/* Cyan wireframe selection outline */}
      {isSelected && (
        <mesh
          position={[wall.centerX, h / 2, wall.centerZ]}
          rotation={[0, wall.rotation ?? 0, 0]}
        >
          <boxGeometry args={[len + 0.18, h + 0.18, t + 0.18]} />
          <meshBasicMaterial
            color="#00d9ff"
            wireframe
            transparent
            opacity={0.55}
          />
        </mesh>
      )}
    </>
  );
}
