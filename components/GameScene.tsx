'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import Player from './Player';
import Enemy from './Enemy';
import Shadow from './Shadow';
import { useGameStore } from '../lib/gameStore';

function Dungeon() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[30, 30, 10, 10]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -15]} receiveShadow castShadow>
        <boxGeometry args={[30, 4, 1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 2, 15]} receiveShadow castShadow>
        <boxGeometry args={[30, 4, 1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-15, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 4, 30]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[15, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 4, 30]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Pillars */}
      {[
        [-8, 0, -8],
        [8, 0, -8],
        [-8, 0, 8],
        [8, 0, 8]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Mystical crystals */}
      {[
        [-10, 1, 0],
        [10, 1, 0],
        [0, 1, -10],
        [0, 1, 10]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Ambient particles */}
      <Stars radius={50} depth={50} count={1000} factor={2} saturation={0} fade speed={1} />
    </>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#6366f1" />
      <hemisphereLight intensity={0.2} groundColor="#1e293b" />
    </>
  );
}

export default function GameScene() {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0.5, 0]);
  const enemies = useGameStore(state => state.enemies);
  const activeShadows = useGameStore(state => state.activeShadows);
  const damageEnemy = useGameStore(state => state.damageEnemy);
  const addEnemy = useGameStore(state => state.addEnemy);
  const startCombat = useGameStore(state => state.startCombat);
  const inCombat = useGameStore(state => state.inCombat);

  // Spawn initial enemies
  useEffect(() => {
    const spawnEnemies = () => {
      const enemyTypes = [
        { type: 'normal' as const, count: 3 },
        { type: 'elite' as const, count: 1 },
        { type: 'boss' as const, count: 0 }
      ];

      enemyTypes.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 5 + Math.random() * 5;
          const x = Math.cos(angle) * distance;
          const z = Math.sin(angle) * distance;

          addEnemy({
            id: `${type}-${Date.now()}-${i}`,
            name: type === 'boss' ? 'Statue of God' :
                  type === 'elite' ? 'Elite Beast' : 'Dungeon Beast',
            level: type === 'boss' ? 10 : type === 'elite' ? 5 : 2,
            health: type === 'boss' ? 500 : type === 'elite' ? 150 : 50,
            maxHealth: type === 'boss' ? 500 : type === 'elite' ? 150 : 50,
            attack: type === 'boss' ? 30 : type === 'elite' ? 15 : 8,
            position: [x, 0.5, z],
            type: type,
            aiPattern: type === 'boss' ? 'aggressive' : 'standard'
          });
        }
      });

      startCombat();
    };

    const timer = setTimeout(spawnEnemies, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle pointer click for attacking
  const handlePointerDown = (event: any) => {
    if (event.object && event.object.userData?.enemyId) {
      damageEnemy(event.object.userData.enemyId, 25);
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 15], fov: 60 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => {}}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 10, 40]} />

        <Lighting />
        <Dungeon />

        <Player position={playerPosition} onMove={setPlayerPosition} />

        {enemies.map(enemy => (
          <group key={enemy.id} onPointerDown={handlePointerDown}>
            <Enemy
              enemy={enemy}
              playerPosition={playerPosition}
            />
          </group>
        ))}

        {activeShadows.map(shadow => (
          <Shadow
            key={shadow.id}
            shadow={shadow}
            playerPosition={playerPosition}
            enemies={enemies}
            onAttack={damageEnemy}
          />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.2}
          target={playerPosition}
        />

        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
