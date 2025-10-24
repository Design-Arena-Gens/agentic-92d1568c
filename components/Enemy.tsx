import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, Enemy as EnemyType } from '../lib/gameStore';

interface EnemyProps {
  enemy: EnemyType;
  playerPosition: [number, number, number];
}

export default function Enemy({ enemy, playerPosition }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const damageEnemy = useGameStore(state => state.damageEnemy);
  const removeEnemy = useGameStore(state => state.removeEnemy);
  const takeDamage = useGameStore(state => state.takeDamage);
  const gainExp = useGameStore(state => state.gainExp);

  const attackCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // AI Movement - chase player
    const dx = playerPosition[0] - enemy.position[0];
    const dz = playerPosition[2] - enemy.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 1) {
      const speed = (enemy.type === 'boss' ? 1.5 : 2) * delta;
      meshRef.current.position.x += (dx / distance) * speed;
      meshRef.current.position.z += (dz / distance) * speed;

      // Rotate to face player
      const angle = Math.atan2(dx, dz);
      meshRef.current.rotation.y = angle;
    } else {
      // Attack player
      attackCooldown.current -= delta;
      if (attackCooldown.current <= 0) {
        takeDamage(enemy.attack);
        attackCooldown.current = 1.5;
      }
    }

    // Boss special pattern
    if (enemy.type === 'boss' && distance < 5) {
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }

    // Check if dead
    if (enemy.health <= 0) {
      gainExp(enemy.level * 20);
      removeEnemy(enemy.id);
    }
  });

  const healthPercent = enemy.health / enemy.maxHealth;
  const color = enemy.type === 'boss' ? '#dc2626' : enemy.type === 'elite' ? '#f59e0b' : '#ef4444';
  const size = enemy.type === 'boss' ? 1.5 : enemy.type === 'elite' ? 1 : 0.7;

  return (
    <group position={enemy.position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[size, size * 1.5, size]} />
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.8}
          emissive={color}
          emissiveIntensity={enemy.type === 'boss' ? 0.3 : 0.1}
        />
      </mesh>

      {/* Health bar */}
      <group position={[0, size * 1.2, 0]}>
        <mesh>
          <planeGeometry args={[size * 1.2, 0.1]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
        <mesh position={[-(size * 1.2 - healthPercent * size * 1.2) / 2, 0, 0.01]}>
          <planeGeometry args={[healthPercent * size * 1.2, 0.1]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Boss aura */}
      {enemy.type === 'boss' && (
        <mesh>
          <sphereGeometry args={[size * 1.5, 16, 16]} />
          <meshBasicMaterial
            color="#dc2626"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Level indicator */}
      {enemy.type === 'boss' && (
        <mesh position={[0, size * 1.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  );
}
