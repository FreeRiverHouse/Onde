'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sky,
  Stars,
  Sparkles,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';

interface ReadingEnvironmentProps {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Lighting presets for different times of day
const LIGHTING_PRESETS = {
  morning: {
    ambient: 0.5,
    ambientColor: '#fff8e7',
    sunIntensity: 0.7,
    sunColor: '#ffeecc',
    sunPosition: [80, 30, 60] as [number, number, number],
    skyInclination: 0.4,
    windowGlow: 0.8,
    windowColor: '#ffeedd',
  },
  afternoon: {
    ambient: 0.45,
    ambientColor: '#fffef5',
    sunIntensity: 0.6,
    sunColor: '#fff5e6',
    sunPosition: [100, 50, 100] as [number, number, number],
    skyInclination: 0.3,
    windowGlow: 0.6,
    windowColor: '#fff8f0',
  },
  evening: {
    ambient: 0.35,
    ambientColor: '#ffd8b0',
    sunIntensity: 0.4,
    sunColor: '#ffaa66',
    sunPosition: [150, 10, 80] as [number, number, number],
    skyInclination: 0.1,
    windowGlow: 1.2,
    windowColor: '#ff9955',
  },
  night: {
    ambient: 0.2,
    ambientColor: '#aabbdd',
    sunIntensity: 0.1,
    sunColor: '#6688bb',
    sunPosition: [-50, -10, 100] as [number, number, number],
    skyInclination: 0.0,
    windowGlow: 0.3,
    windowColor: '#334466',
  },
};

export function ReadingEnvironment({ timeOfDay = 'evening' }: ReadingEnvironmentProps) {
  const lighting = LIGHTING_PRESETS[timeOfDay];
  const isNight = timeOfDay === 'night';
  
  return (
    <>
      {/* Ambient & directional lighting based on time of day */}
      <ambientLight intensity={lighting.ambient} color={lighting.ambientColor} />
      <directionalLight 
        position={lighting.sunPosition} 
        intensity={lighting.sunIntensity} 
        color={lighting.sunColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Fireplace warm glow - stronger at night */}
      <pointLight 
        position={[-3, 0.8, -4]} 
        intensity={isNight ? 2 : 1.2} 
        color="#ff6622" 
        distance={6}
      />
      
      {/* Secondary fireplace bounce light */}
      <pointLight 
        position={[-3, 0.3, -3.5]} 
        intensity={isNight ? 0.8 : 0.5} 
        color="#ff8844" 
        distance={4}
      />
      
      {/* Sky with time-appropriate tones */}
      <Sky 
        distance={450000}
        sunPosition={lighting.sunPosition}
        inclination={lighting.skyInclination}
        azimuth={0.25}
        rayleigh={isNight ? 0.1 : 0.5}
      />
      
      {/* Stars (more visible at night) */}
      <Stars 
        radius={100}
        depth={50}
        count={isNight ? 3000 : 500}
        factor={isNight ? 6 : 3}
        saturation={0}
        fade
        speed={0.3}
      />
      
      {/* Floating dust motes / magical particles */}
      <Sparkles
        count={80}
        scale={[12, 6, 12]}
        size={2.5}
        speed={0.15}
        opacity={0.25}
        color="#ffcc88"
      />
      
      {/* Floor - rich wooden planks with subtle pattern */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial 
          color="#4a3526"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      
      {/* Oriental rug under reading area */}
      <Rug position={[0, 0.01, 0]} />
      
      {/* Walls with wainscoting */}
      <WallWithWainscoting position={[0, 0, -6]} rotation={[0, 0, 0]} width={14} />
      <WallWithWainscoting position={[-7, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={12} />
      <WallWithWainscoting position={[7, 0, 0]} rotation={[0, -Math.PI / 2, 0]} width={12} />
      
      {/* Ceiling with crown molding */}
      <Ceiling />
      
      {/* Fireplace on left wall */}
      <Fireplace position={[-3, 0, -5.8]} />
      
      {/* Window on right wall with view */}
      <Window 
        position={[6.9, 1.8, -2]} 
        rotation={[0, -Math.PI / 2, 0]} 
        glowIntensity={lighting.windowGlow}
        glowColor={lighting.windowColor}
        isNight={isNight}
      />
      
      {/* Bookshelf elements - fuller library */}
      <Bookshelf position={[-1.5, 1.5, -5.85]} scale={1.1} />
      <Bookshelf position={[1.5, 1.5, -5.85]} scale={1.1} />
      <Bookshelf position={[4.5, 1.5, -5.85]} scale={1.0} />
      
      {/* Tall corner bookshelf */}
      <TallBookshelf position={[6.5, 0, -5.5]} rotation={[0, -Math.PI / 4, 0]} />
      
      {/* Reading chair (enhanced) */}
      <LeatherArmchair position={[0, 0, 0.5]} rotation={[0, Math.PI * 0.05, 0]} />
      
      {/* Side table with lamp */}
      <SideTable position={[1.3, 0, 0.2]} />
      
      {/* Small side table on left */}
      <SmallTable position={[-1.1, 0, 0.3]} />
      
      {/* Grandfather clock in corner */}
      <GrandfatherClock position={[-6.3, 0, -5]} />
      
      {/* Floating candles for magical ambiance */}
      <FloatingCandle position={[-1.5, 2.0, -2]} delay={0} />
      <FloatingCandle position={[1.8, 2.2, -2.5]} delay={0.5} />
      <FloatingCandle position={[0.2, 2.4, -3.5]} delay={1.0} />
      <FloatingCandle position={[-2.5, 1.9, -3]} delay={1.5} />
      <FloatingCandle position={[3, 2.1, -4]} delay={2.0} />
      
      {/* Globe on a stand */}
      <Globe position={[5, 0, -3]} />
      
      {/* Potted plant */}
      <PottedPlant position={[-5.5, 0, -2]} />
    </>
  );
}

// Rich oriental rug
function Rug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main rug body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 4]} />
        <meshStandardMaterial color="#8B2323" roughness={0.95} />
      </mesh>
      {/* Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[1.5, 1.7, 4]} />
        <meshStandardMaterial color="#4a1515" roughness={0.95} />
      </mesh>
      {/* Center medallion */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -0.5]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#b8860b" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Wall with wainscoting panels
function WallWithWainscoting({ 
  position, 
  rotation, 
  width 
}: { 
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
}) {
  const panelCount = Math.floor(width / 2);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Upper wall - darker */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[width, 3]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.95} />
      </mesh>
      
      {/* Wainscoting (lower wall) */}
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[width, 2]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      
      {/* Chair rail */}
      <mesh position={[0, 2, 0.02]}>
        <boxGeometry args={[width, 0.08, 0.04]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
      </mesh>
      
      {/* Wainscoting panels */}
      {Array.from({ length: panelCount }).map((_, i) => (
        <mesh 
          key={i} 
          position={[(-width / 2) + (i + 0.5) * (width / panelCount), 1, 0.01]}
        >
          <boxGeometry args={[1.2, 1.5, 0.02]} />
          <meshStandardMaterial color="#4a3526" roughness={0.88} />
        </mesh>
      ))}
      
      {/* Baseboard */}
      <mesh position={[0, 0.06, 0.02]}>
        <boxGeometry args={[width, 0.12, 0.03]} />
        <meshStandardMaterial color="#2d1f15" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Ceiling with crown molding
function Ceiling() {
  return (
    <group>
      {/* Ceiling plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
      </mesh>
      
      {/* Crown molding (simplified) */}
      <mesh position={[0, 4.9, -6]}>
        <boxGeometry args={[14, 0.15, 0.15]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
      <mesh position={[-7, 4.9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 0.15, 0.15]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
      <mesh position={[7, 4.9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[12, 0.15, 0.15]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Fireplace with animated flames
function Fireplace({ position }: { position: [number, number, number] }) {
  const flameRefs = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    flameRefs.current.forEach((flame, i) => {
      if (flame) {
        const t = state.clock.elapsedTime;
        flame.scale.y = 0.8 + Math.sin(t * 8 + i * 2) * 0.3;
        flame.scale.x = 0.9 + Math.sin(t * 6 + i) * 0.15;
        flame.position.y = 0.25 + Math.sin(t * 5 + i * 1.5) * 0.05;
      }
    });
  });
  
  return (
    <group position={position}>
      {/* Fireplace mantle */}
      <mesh position={[0, 1.4, 0.1]}>
        <boxGeometry args={[1.8, 0.15, 0.25]} />
        <meshStandardMaterial color="#5c4033" roughness={0.85} />
      </mesh>
      
      {/* Mantle top shelf */}
      <mesh position={[0, 1.5, 0.05]}>
        <boxGeometry args={[2, 0.08, 0.35]} />
        <meshStandardMaterial color="#4a3526" roughness={0.9} />
      </mesh>
      
      {/* Fireplace surround - left pillar */}
      <mesh position={[-0.75, 0.7, 0.1]}>
        <boxGeometry args={[0.2, 1.4, 0.2]} />
        <meshStandardMaterial color="#666" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Right pillar */}
      <mesh position={[0.75, 0.7, 0.1]}>
        <boxGeometry args={[0.2, 1.4, 0.2]} />
        <meshStandardMaterial color="#666" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Firebox opening */}
      <mesh position={[0, 0.55, 0.05]}>
        <boxGeometry args={[1.3, 1, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      
      {/* Fire logs */}
      <mesh position={[-0.2, 0.15, 0.15]} rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.95} />
      </mesh>
      <mesh position={[0.15, 0.12, 0.2]} rotation={[0, -0.2, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.09, 0.55, 8]} />
        <meshStandardMaterial color="#4a3526" roughness={0.95} />
      </mesh>
      
      {/* Flames */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          ref={(el) => { if (el) flameRefs.current[i] = el; }}
          position={[-0.25 + i * 0.12, 0.3, 0.18]}
        >
          <coneGeometry args={[0.06, 0.35, 8]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? '#ff6600' : '#ffaa00'} 
            transparent 
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Ember glow */}
      <pointLight position={[0, 0.2, 0.2]} intensity={1.5} color="#ff4400" distance={2} />
      
      {/* Hearth */}
      <mesh position={[0, 0.02, 0.35]}>
        <boxGeometry args={[1.6, 0.04, 0.5]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Window with outside view and glow
function Window({ 
  position, 
  rotation, 
  glowIntensity,
  glowColor,
  isNight,
}: { 
  position: [number, number, number];
  rotation: [number, number, number];
  glowIntensity: number;
  glowColor: string;
  isNight: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[1.6, 2.2, 0.15]} />
        <meshStandardMaterial color="#5c4033" roughness={0.85} />
      </mesh>
      
      {/* Window panes (2x2 grid) */}
      {[[-0.35, 0.45], [0.35, 0.45], [-0.35, -0.45], [0.35, -0.45]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <planeGeometry args={[0.55, 0.85]} />
          <meshBasicMaterial 
            color={glowColor} 
            transparent 
            opacity={0.3 + glowIntensity * 0.2}
          />
        </mesh>
      ))}
      
      {/* Window dividers */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.06, 2, 0.02]} />
        <meshStandardMaterial color="#4a3526" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[1.4, 0.06, 0.02]} />
        <meshStandardMaterial color="#4a3526" roughness={0.9} />
      </mesh>
      
      {/* Window light */}
      <rectAreaLight 
        width={1.2}
        height={1.8}
        intensity={glowIntensity * 2}
        color={glowColor}
        position={[0, 0, 0.2]}
        rotation={[0, Math.PI, 0]}
      />
      
      {/* Curtains */}
      <mesh position={[-0.85, 0, 0.05]}>
        <boxGeometry args={[0.15, 2.4, 0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.95} />
      </mesh>
      <mesh position={[0.85, 0, 0.05]}>
        <boxGeometry args={[0.15, 2.4, 0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.95} />
      </mesh>
      
      {/* Curtain rod */}
      <mesh position={[0, 1.25, 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Enhanced bookshelf with colorful book spines
function Bookshelf({ 
  position, 
  scale = 1 
}: { 
  position: [number, number, number];
  scale?: number;
}) {
  const bookColors = useMemo(() => [
    '#8B0000', '#006400', '#00008B', '#8B4513', '#4B0082',
    '#8B2252', '#2F4F4F', '#B8860B', '#556B2F', '#8B008B',
    '#CD853F', '#2E8B57', '#4682B4', '#9932CC', '#D2691E',
  ], []);
  
  const books = useMemo(() => {
    return Array.from({ length: 4 }).map((_, row) => 
      Array.from({ length: 8 }).map((_, i) => ({
        color: bookColors[(row * 8 + i) % bookColors.length],
        height: 0.32 + Math.random() * 0.12,
        width: 0.10 + Math.random() * 0.04,
        tilt: (Math.random() - 0.5) * 0.08,
      }))
    );
  }, [bookColors]);
  
  return (
    <group position={position} scale={scale}>
      {/* Shelf frame - darker wood */}
      <mesh>
        <boxGeometry args={[2.2, 2.6, 0.35]} />
        <meshStandardMaterial color="#2d1f15" roughness={0.88} />
      </mesh>
      
      {/* Shelf boards */}
      {[-0.95, -0.35, 0.25, 0.85].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[2, 0.04, 0.3]} />
          <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Book rows */}
      {books.map((row, rowIndex) => (
        <group key={rowIndex} position={[0, -0.75 + rowIndex * 0.6, 0.12]}>
          {row.map((book, i) => (
            <mesh 
              key={i} 
              position={[-0.85 + i * 0.22, book.height / 2, 0]}
              rotation={[0, 0, book.tilt]}
            >
              <boxGeometry args={[book.width, book.height, 0.16]} />
              <meshStandardMaterial color={book.color} roughness={0.75} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// Tall floor-to-ceiling bookshelf for corners
function TallBookshelf({ 
  position,
  rotation = [0, 0, 0],
}: { 
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const bookColors = ['#8B0000', '#006400', '#00008B', '#8B4513', '#4B0082', '#CD853F'];
  
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.2, 4, 0.35]} />
        <meshStandardMaterial color="#2d1f15" roughness={0.9} />
      </mesh>
      
      {/* Shelves and books - 6 rows */}
      {[0.3, 0.9, 1.5, 2.1, 2.7, 3.3].map((y, row) => (
        <group key={row}>
          <mesh position={[0, y, 0.05]}>
            <boxGeometry args={[1.1, 0.03, 0.28]} />
            <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
          </mesh>
          <group position={[0, y + 0.2, 0.1]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh key={i} position={[-0.4 + i * 0.2, 0, 0]}>
                <boxGeometry args={[0.12, 0.28 + Math.random() * 0.08, 0.14]} />
                <meshStandardMaterial 
                  color={bookColors[(row + i) % bookColors.length]} 
                  roughness={0.8} 
                />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

// Luxurious leather armchair
function LeatherArmchair({ 
  position,
  rotation = [0, 0, 0],
}: { 
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base/legs */}
      {[[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]}>
          <cylinderGeometry args={[0.04, 0.05, 0.16, 8]} />
          <meshStandardMaterial color="#2d1f15" roughness={0.85} />
        </mesh>
      ))}
      
      {/* Seat cushion - tufted leather look */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.75, 0.18, 0.65]} />
        <meshStandardMaterial color="#5c2018" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Seat pillow (rounded) */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.5]} />
        <meshStandardMaterial color="#722020" roughness={0.8} />
      </mesh>
      
      {/* Back - curved */}
      <mesh position={[0, 0.7, -0.3]}>
        <boxGeometry args={[0.75, 0.8, 0.12]} />
        <meshStandardMaterial color="#5c2018" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Back cushion */}
      <mesh position={[0, 0.65, -0.22]}>
        <boxGeometry args={[0.6, 0.55, 0.08]} />
        <meshStandardMaterial color="#722020" roughness={0.8} />
      </mesh>
      
      {/* Arms - curved leather */}
      <mesh position={[-0.4, 0.5, -0.05]}>
        <boxGeometry args={[0.12, 0.2, 0.55]} />
        <meshStandardMaterial color="#5c2018" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0.4, 0.5, -0.05]}>
        <boxGeometry args={[0.12, 0.2, 0.55]} />
        <meshStandardMaterial color="#5c2018" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Arm tops (padded) */}
      <mesh position={[-0.4, 0.62, -0.05]}>
        <boxGeometry args={[0.14, 0.06, 0.5]} />
        <meshStandardMaterial color="#722020" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 0.62, -0.05]}>
        <boxGeometry args={[0.14, 0.06, 0.5]} />
        <meshStandardMaterial color="#722020" roughness={0.8} />
      </mesh>
      
      {/* Tufting details (small spheres) */}
      {[[-0.2, 0.75, -0.16], [0, 0.8, -0.16], [0.2, 0.75, -0.16]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Side table with Tiffany-style lamp
function SideTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top - rich wood */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 24]} />
        <meshStandardMaterial color="#4a3526" roughness={0.85} />
      </mesh>
      
      {/* Table edge trim */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.28, 0.02, 8, 24]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
      </mesh>
      
      {/* Table leg - turned wood */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.5, 12]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.88} />
      </mesh>
      
      {/* Table base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
      </mesh>
      
      {/* Lamp base - brass */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Lamp stem */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Tiffany lamp shade */}
      <mesh position={[0, 0.92, 0]}>
        <coneGeometry args={[0.14, 0.12, 12, 1, true]} />
        <meshStandardMaterial 
          color="#daa520" 
          roughness={0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
          emissive="#ff9944"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Lamp light */}
      <pointLight position={[0, 0.88, 0]} intensity={0.8} color="#fff5e6" distance={2.5} />
      
      {/* Small book on table */}
      <mesh position={[-0.08, 0.56, 0.08]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.14]} />
        <meshStandardMaterial color="#8B0000" roughness={0.85} />
      </mesh>
      
      {/* Tea cup */}
      <mesh position={[0.1, 0.56, -0.05]}>
        <cylinderGeometry args={[0.03, 0.025, 0.04, 12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
    </group>
  );
}

// Small side table (left side)
function SmallTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.35]} />
        <meshStandardMaterial color="#4a3526" roughness={0.85} />
      </mesh>
      
      {/* Legs */}
      {[[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]}>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Whiskey glass */}
      <mesh position={[0.05, 0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.022, 0.05, 12]} />
        <meshStandardMaterial color="#d4a574" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      
      {/* Small stack of books */}
      <mesh position={[-0.08, 0.48, 0.05]}>
        <boxGeometry args={[0.12, 0.04, 0.08]} />
        <meshStandardMaterial color="#006400" roughness={0.85} />
      </mesh>
      <mesh position={[-0.08, 0.51, 0.05]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.11, 0.03, 0.075]} />
        <meshStandardMaterial color="#8B4513" roughness={0.85} />
      </mesh>
    </group>
  );
}

// Grandfather clock
function GrandfatherClock({ position }: { position: [number, number, number] }) {
  const pendulumRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (pendulumRef.current) {
      pendulumRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
  });
  
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.35]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.88} />
      </mesh>
      
      {/* Middle section */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.45, 1.0, 0.32]} />
        <meshStandardMaterial color="#4a3526" roughness={0.85} />
      </mesh>
      
      {/* Clock head */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.35]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.88} />
      </mesh>
      
      {/* Crown */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[0.55, 0.1, 0.38]} />
        <meshStandardMaterial color="#2d1f15" roughness={0.9} />
      </mesh>
      
      {/* Clock face */}
      <mesh position={[0, 2.1, 0.18]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.4} />
      </mesh>
      
      {/* Clock rim */}
      <mesh position={[0, 2.1, 0.19]}>
        <torusGeometry args={[0.18, 0.015, 8, 32]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Pendulum window */}
      <mesh position={[0, 1.3, 0.17]}>
        <planeGeometry args={[0.25, 0.6]} />
        <meshStandardMaterial color="#222" transparent opacity={0.5} />
      </mesh>
      
      {/* Pendulum */}
      <mesh ref={pendulumRef} position={[0, 1.1, 0.18]}>
        <group>
          {/* Rod */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.015, 0.5, 0.01]} />
            <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Bob */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
            <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </mesh>
    </group>
  );
}

// Decorative globe on stand
function Globe({ position }: { position: [number, number, number] }) {
  const globeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <group position={position}>
      {/* Stand base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.04, 12]} />
        <meshStandardMaterial color="#4a3526" roughness={0.85} />
      </mesh>
      
      {/* Stand pillar */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Globe ring */}
      <mesh position={[0, 0.75, 0]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.22, 0.015, 8, 32]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Globe sphere */}
      <mesh ref={globeRef} position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial 
          color="#4682b4" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Potted plant
function PottedPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.4, 12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* Soil */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
        <meshStandardMaterial color="#3d2b1f" roughness={1} />
      </mesh>
      
      {/* Leaves (simplified as cones) */}
      {[0, 0.8, 1.6, 2.4, 3.2, 4.0].map((angle, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(angle) * 0.08, 
            0.55 + Math.random() * 0.15, 
            Math.sin(angle) * 0.08
          ]}
          rotation={[0.5 - Math.random() * 0.3, angle, 0]}
        >
          <coneGeometry args={[0.04, 0.25 + Math.random() * 0.1, 8]} />
          <meshStandardMaterial color="#228B22" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Center stem */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.35, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Floating magical candle with delay for staggered animation
function FloatingCandle({ 
  position,
  delay = 0,
}: { 
  position: [number, number, number];
  delay?: number;
}) {
  const candleRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    if (candleRef.current) {
      candleRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.08;
      candleRef.current.rotation.z = Math.sin(t * 0.4) * 0.05;
    }
    if (flameRef.current) {
      flameRef.current.scale.y = 0.9 + Math.sin(t * 12) * 0.25;
      flameRef.current.scale.x = 0.95 + Math.sin(t * 10 + 0.5) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.35 + Math.sin(t * 8) * 0.1;
    }
  });
  
  return (
    <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={candleRef} position={position}>
        {/* Candle body - tapered */}
        <mesh>
          <cylinderGeometry args={[0.018, 0.025, 0.18, 12]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.85} />
        </mesh>
        
        {/* Wax drips */}
        <mesh position={[0.015, 0.02, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
        </mesh>
        <mesh position={[-0.012, -0.01, 0.01]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
        </mesh>
        
        {/* Wick */}
        <mesh position={[0, 0.095, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.02, 4]} />
          <meshStandardMaterial color="#222" roughness={1} />
        </mesh>
        
        {/* Flame inner (bright) */}
        <mesh ref={flameRef} position={[0, 0.12, 0]}>
          <coneGeometry args={[0.012, 0.055, 8]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.95} />
        </mesh>
        
        {/* Flame outer (glow) */}
        <mesh position={[0, 0.13, 0]}>
          <coneGeometry args={[0.018, 0.07, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.5} />
        </mesh>
        
        {/* Flame glow light */}
        <pointLight 
          ref={glowRef}
          position={[0, 0.12, 0]} 
          intensity={0.35} 
          color="#ff9944" 
          distance={1.2} 
        />
      </group>
    </Float>
  );
}
