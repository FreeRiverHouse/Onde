'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Environment,
  Sky,
  Stars,
  Sparkles,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';

export function ReadingEnvironment() {
  return (
    <>
      {/* Ambient & directional lighting */}
      <ambientLight intensity={0.4} color="#ffeedd" />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.6} 
        color="#fff5e6"
        castShadow
      />
      
      {/* Warm point light simulating fireplace */}
      <pointLight 
        position={[-2, 0.5, -2]} 
        intensity={1} 
        color="#ff9944" 
        distance={5}
      />
      
      {/* Sky with warm sunset tones */}
      <Sky 
        distance={450000}
        sunPosition={[100, 10, 100]}
        inclination={0.2}
        azimuth={0.25}
        rayleigh={0.5}
      />
      
      {/* Stars (subtle, background) */}
      <Stars 
        radius={100}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      {/* Floating dust motes / magical particles */}
      <Sparkles
        count={50}
        scale={[10, 5, 10]}
        size={3}
        speed={0.2}
        opacity={0.3}
        color="#ffcc88"
      />
      
      {/* Floor - wooden planks */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#5c4033"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Walls - library backdrop */}
      {/* Back wall */}
      <mesh position={[0, 2.5, -5]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-6, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#4a3728" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[6, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#4a3728" roughness={0.95} />
      </mesh>
      
      {/* Bookshelf elements on back wall */}
      <Bookshelf position={[-3, 1.5, -4.9]} />
      <Bookshelf position={[3, 1.5, -4.9]} />
      
      {/* Reading chair (simple representation) */}
      <ReadingChair position={[0, 0, 0.5]} />
      
      {/* Side table with lamp */}
      <SideTable position={[1.2, 0, 0]} />
      
      {/* Floating candles for ambiance */}
      <FloatingCandle position={[-1.5, 1.8, -2]} />
      <FloatingCandle position={[1.5, 2.0, -2.5]} />
      <FloatingCandle position={[0, 2.2, -3]} />
    </>
  );
}

// Simple bookshelf with colorful book spines
function Bookshelf({ position }: { position: [number, number, number] }) {
  const bookColors = [
    '#8B0000', '#006400', '#00008B', '#8B4513', '#4B0082',
    '#8B0000', '#006400', '#00008B', '#8B4513', '#4B0082',
  ];
  
  return (
    <group position={position}>
      {/* Shelf frame */}
      <mesh>
        <boxGeometry args={[2, 2.5, 0.3]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
      </mesh>
      
      {/* Book rows */}
      {[-0.8, -0.3, 0.2, 0.7].map((shelfY, rowIndex) => (
        <group key={rowIndex} position={[0, shelfY, 0.1]}>
          {bookColors.slice(0, 8).map((color, i) => (
            <mesh 
              key={i} 
              position={[-0.7 + i * 0.18, 0, 0]}
              scale={[0.12, 0.35 + Math.random() * 0.1, 0.15]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Simple reading chair
function ReadingChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Seat */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.15, 0.6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* Back */}
      <mesh position={[0, 0.65, -0.25]}>
        <boxGeometry args={[0.7, 0.7, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.35, 0.5, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.5]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.5, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.5]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      
      {/* Cushion */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.45]} />
        <meshStandardMaterial color="#800020" roughness={0.95} />
      </mesh>
    </group>
  );
}

// Side table with lamp
function SideTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      
      {/* Table leg */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
      </mesh>
      
      {/* Lamp base */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.05, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Lamp stem */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Lamp shade */}
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.12, 0.15, 8, 1, true]} />
        <meshStandardMaterial 
          color="#f5deb3" 
          roughness={0.9}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Lamp light */}
      <pointLight position={[0, 0.85, 0]} intensity={0.5} color="#fff5e6" distance={2} />
    </group>
  );
}

// Floating magical candle
function FloatingCandle({ position }: { position: [number, number, number] }) {
  const candleRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (candleRef.current) {
      candleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.1;
    }
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
    }
  });
  
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={candleRef} position={position}>
        {/* Candle body */}
        <mesh>
          <cylinderGeometry args={[0.02, 0.025, 0.15, 8]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
        </mesh>
        
        {/* Flame */}
        <mesh ref={flameRef} position={[0, 0.1, 0]}>
          <coneGeometry args={[0.015, 0.06, 8]} />
          <meshBasicMaterial color="#ff6600" />
        </mesh>
        
        {/* Flame glow */}
        <pointLight position={[0, 0.1, 0]} intensity={0.3} color="#ff9944" distance={1} />
      </group>
    </Float>
  );
}
