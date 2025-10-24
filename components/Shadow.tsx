import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Shadow as ShadowType } from '../lib/gameStore';

interface ShadowProps {
  shadow: ShadowType;
  playerPosition: [number, number, number];
  enemies: Array<{ id: string; position: [number, number, number] }>;
  onAttack: (enemyId: string, damage: number) => void;
}

export default function Shadow({ shadow, playerPosition, enemies, onAttack }: ShadowProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetEnemy = useRef<string | null>(null);
  const attackCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);

    // Find nearest enemy
    if (enemies.length > 0) {
      let nearestEnemy = enemies[0];
      let minDistance = Infinity;

      enemies.forEach(enemy => {
        const dx = enemy.position[0] - meshRef.current!.position.x;
        const dz = enemy.position[2] - meshRef.current!.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < minDistance) {
          minDistance = distance;
          nearestEnemy = enemy;
        }
      });

      targetEnemy.current = nearestEnemy.id;

      // Move towards enemy
      const dx = nearestEnemy.position[0] - meshRef.current.position.x;
      const dz = nearestEnemy.position[2] - meshRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 1.5) {
        const speed = 3 * delta;
        meshRef.current.position.x += (dx / distance) * speed;
        meshRef.current.position.z += (dz / distance) * speed;
      } else if (attackCooldown.current === 0) {
        onAttack(nearestEnemy.id, shadow.attack);
        attackCooldown.current = 1;
      }

      // Rotate to face enemy
      const angle = Math.atan2(dx, dz);
      meshRef.current.rotation.y = angle;
    } else {
      // Follow player
      const dx = playerPosition[0] - meshRef.current.position.x;
      const dz = playerPosition[2] - meshRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 2) {
        const speed = 4 * delta;
        meshRef.current.position.x += (dx / distance) * speed;
        meshRef.current.position.z += (dz / distance) * speed;
      }
    }

    // Floating animation
    meshRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3 + shadow.level) * 0.1;
  });

  const color = shadow.type === 'warrior' ? '#8b5cf6' :
                shadow.type === 'mage' ? '#3b82f6' :
                shadow.type === 'tank' ? '#6366f1' :
                '#a855f7';

  const size = shadow.type === 'tank' ? 0.6 : 0.4;

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <coneGeometry args={[size, size * 2, 6]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Shadow aura */}
      <mesh position={[meshRef.current?.position.x || 0, 0.1, meshRef.current?.position.z || 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
