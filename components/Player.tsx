import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../lib/gameStore';

interface PlayerProps {
  position: [number, number, number];
  onMove: (position: [number, number, number]) => void;
}

export default function Player({ position, onMove }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerHealth = useGameStore(state => state.playerHealth);
  const playerMaxHealth = useGameStore(state => state.playerMaxHealth);
  const inCombat = useGameStore(state => state.inCombat);

  const velocity = useRef({ x: 0, z: 0 });
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = 5 * delta;
    const newVelocity = { x: 0, z: 0 };

    if (keys.current.w) newVelocity.z -= speed;
    if (keys.current.s) newVelocity.z += speed;
    if (keys.current.a) newVelocity.x -= speed;
    if (keys.current.d) newVelocity.x += speed;

    velocity.current = newVelocity;

    meshRef.current.position.x += velocity.current.x;
    meshRef.current.position.z += velocity.current.z;

    // Keep player on platform
    meshRef.current.position.x = Math.max(-10, Math.min(10, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-10, Math.min(10, meshRef.current.position.z));

    onMove([
      meshRef.current.position.x,
      meshRef.current.position.y,
      meshRef.current.position.z
    ]);

    // Rotate based on movement
    if (velocity.current.x !== 0 || velocity.current.z !== 0) {
      const angle = Math.atan2(velocity.current.x, velocity.current.z);
      meshRef.current.rotation.y = angle;
    }
  });

  const healthPercent = playerHealth / playerMaxHealth;
  const color = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';

  return (
    <group position={position}>
      {/* Player body */}
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Health bar */}
      <group position={[0, 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
        <mesh position={[-(1 - healthPercent) / 2, 0, 0.01]}>
          <planeGeometry args={[healthPercent, 0.1]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>

      {/* Weapon - dagger */}
      <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Combat aura effect when in combat */}
      {inCombat && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
