'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface SkinPreview3DProps {
  skinCanvas: HTMLCanvasElement | null;
  /** Increment to force texture refresh (e.g., on each draw) */
  textureVersion?: number;
}

// 🎨 Minecraft skin UV mapping coordinates (64x64 skin format)
// Each body part has 6 faces: front, back, left, right, top, bottom
const SKIN_UV_MAP = {
  head: {
    front: { x: 8, y: 8, w: 8, h: 8 },
    back: { x: 24, y: 8, w: 8, h: 8 },
    left: { x: 16, y: 8, w: 8, h: 8 },
    right: { x: 0, y: 8, w: 8, h: 8 },
    top: { x: 8, y: 0, w: 8, h: 8 },
    bottom: { x: 16, y: 0, w: 8, h: 8 },
  },
  body: {
    front: { x: 20, y: 20, w: 8, h: 12 },
    back: { x: 32, y: 20, w: 8, h: 12 },
    left: { x: 28, y: 20, w: 4, h: 12 },
    right: { x: 16, y: 20, w: 4, h: 12 },
    top: { x: 20, y: 16, w: 8, h: 4 },
    bottom: { x: 28, y: 16, w: 8, h: 4 },
  },
  rightArm: {
    front: { x: 44, y: 20, w: 4, h: 12 },
    back: { x: 52, y: 20, w: 4, h: 12 },
    left: { x: 48, y: 20, w: 4, h: 12 },
    right: { x: 40, y: 20, w: 4, h: 12 },
    top: { x: 44, y: 16, w: 4, h: 4 },
    bottom: { x: 48, y: 16, w: 4, h: 4 },
  },
  leftArm: {
    front: { x: 36, y: 52, w: 4, h: 12 },
    back: { x: 44, y: 52, w: 4, h: 12 },
    left: { x: 40, y: 52, w: 4, h: 12 },
    right: { x: 32, y: 52, w: 4, h: 12 },
    top: { x: 36, y: 48, w: 4, h: 4 },
    bottom: { x: 40, y: 48, w: 4, h: 4 },
  },
  rightLeg: {
    front: { x: 4, y: 20, w: 4, h: 12 },
    back: { x: 12, y: 20, w: 4, h: 12 },
    left: { x: 8, y: 20, w: 4, h: 12 },
    right: { x: 0, y: 20, w: 4, h: 12 },
    top: { x: 4, y: 16, w: 4, h: 4 },
    bottom: { x: 8, y: 16, w: 4, h: 4 },
  },
  leftLeg: {
    front: { x: 20, y: 52, w: 4, h: 12 },
    back: { x: 28, y: 52, w: 4, h: 12 },
    left: { x: 24, y: 52, w: 4, h: 12 },
    right: { x: 16, y: 52, w: 4, h: 12 },
    top: { x: 20, y: 48, w: 4, h: 4 },
    bottom: { x: 24, y: 48, w: 4, h: 4 },
  },
};

export default function SkinPreview3D({ skinCanvas, textureVersion = 0 }: SkinPreview3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.1, y: 0.3 });
  const autoRotateRef = useRef(true);
  const particlesRef = useRef<THREE.Points | null>(null);
  const [showParticles, setShowParticles] = useState(true);
  const [pose, setPose] = useState<'walk' | 'idle' | 'wave' | 'dance' | 'floss' | 'dab'>('walk');
  const poseRef = useRef<'walk' | 'idle' | 'wave' | 'dance' | 'floss' | 'dab'>('walk');
  const [zoom, setZoom] = useState(5);
  const zoomRef = useRef(5);
  const [animSpeed, setAnimSpeed] = useState(1);
  const animSpeedRef = useRef(1);
  const [autoRotate, setAutoRotate] = useState(true);

  // 🎨 Extract a face texture from the skin canvas
  const extractFaceTexture = useCallback((
    ctx: CanvasRenderingContext2D,
    region: { x: number; y: number; w: number; h: number }
  ): HTMLCanvasElement => {
    const faceCanvas = document.createElement('canvas');
    const size = 64;
    faceCanvas.width = size;
    faceCanvas.height = size;
    const faceCtx = faceCanvas.getContext('2d')!;
    faceCtx.imageSmoothingEnabled = false;
    
    faceCtx.drawImage(
      ctx.canvas,
      region.x, region.y, region.w, region.h,
      0, 0, size, size
    );
    
    return faceCanvas;
  }, []);

  // 🎨 Create material with proper UV for a body part face
  const createFaceMaterial = useCallback((
    ctx: CanvasRenderingContext2D,
    region: { x: number; y: number; w: number; h: number }
  ): THREE.MeshStandardMaterial => {
    const faceCanvas = extractFaceTexture(ctx, region);
    const texture = new THREE.CanvasTexture(faceCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.FrontSide,
    });
  }, [extractFaceTexture]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 2;
    bgCanvas.height = 256;
    const bgCtx = bgCanvas.getContext('2d')!;
    const gradient = bgCtx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(0.5, '#2a2a4e');
    gradient.addColorStop(1, '#0a0a1e');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, 2, 256);
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    scene.background = bgTexture;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 200 / 280, 0.1, 1000);
    camera.position.set(0, 1.2, 5);
    camera.lookAt(0, 0.9, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(200, 280);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    scene.add(keyLight);
    
    const rimLight = new THREE.DirectionalLight(0x6699ff, 0.6);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    
    const fillLight = new THREE.PointLight(0xff9966, 0.4, 10);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);
    
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Character group
    const character = new THREE.Group();
    characterRef.current = character;

    const defaultMat = new THREE.MeshStandardMaterial({ color: 0xc4a57b, roughness: 0.8 });
    
    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeo, [defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone()]);
    head.position.y = 1.75;
    head.name = 'head';
    head.castShadow = true;
    character.add(head);

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.75, 0.25);
    const body = new THREE.Mesh(bodyGeo, [defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone()]);
    body.position.y = 1.125;
    body.name = 'body';
    body.castShadow = true;
    character.add(body);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const rightArm = new THREE.Mesh(armGeo, [defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone()]);
    rightArm.position.set(-0.375, 1.125, 0);
    rightArm.name = 'rightArm';
    rightArm.castShadow = true;
    character.add(rightArm);

    const leftArm = new THREE.Mesh(armGeo.clone(), [defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone()]);
    leftArm.position.set(0.375, 1.125, 0);
    leftArm.name = 'leftArm';
    leftArm.castShadow = true;
    character.add(leftArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const rightLeg = new THREE.Mesh(legGeo, [defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone()]);
    rightLeg.position.set(-0.125, 0.375, 0);
    rightLeg.name = 'rightLeg';
    rightLeg.castShadow = true;
    character.add(rightLeg);

    const leftLeg = new THREE.Mesh(legGeo.clone(), [defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone(), defaultMat.clone()]);
    leftLeg.position.set(0.125, 0.375, 0);
    leftLeg.name = 'leftLeg';
    leftLeg.castShadow = true;
    character.add(leftLeg);

    scene.add(character);

    // Particles
    const particleCount = 30;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 2.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.84; colors[i * 3 + 2] = 0;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1;
      }
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      autoRotateRef.current = false;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;
      rotationRef.current.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, rotationRef.current.x));
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      setTimeout(() => { autoRotateRef.current = true; }, 3000);
    };

    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      autoRotateRef.current = false;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;
      rotationRef.current.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, rotationRef.current.x));
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    
    const onTouchEnd = () => {
      isDragging.current = false;
      setTimeout(() => { autoRotateRef.current = true; }, 3000);
    };
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.3 : -0.3;
      const newZoom = Math.min(8, Math.max(3, zoomRef.current + delta));
      zoomRef.current = newZoom;
      setZoom(newZoom);
      if (camera) camera.position.z = newZoom;
    };
    
    const onDoubleClick = () => {
      rotationRef.current = { x: 0.1, y: 0.3 };
      zoomRef.current = 5;
      setZoom(5);
      if (camera) camera.position.z = 5;
      autoRotateRef.current = true;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('dblclick', onDoubleClick);

    // Animation loop
    let walkTime = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      walkTime += 0.05 * animSpeedRef.current;
      
      if (autoRotateRef.current) {
        rotationRef.current.y += 0.008;
      }
      character.rotation.y = rotationRef.current.y;
      character.rotation.x = rotationRef.current.x;
      
      character.rotation.z = 0;
      character.position.y = 0;
      
      const rightArmMesh = character.getObjectByName('rightArm');
      const leftArmMesh = character.getObjectByName('leftArm');
      const rightLegMesh = character.getObjectByName('rightLeg');
      const leftLegMesh = character.getObjectByName('leftLeg');
      
      if (rightArmMesh) rightArmMesh.rotation.z = 0;
      if (leftArmMesh) leftArmMesh.rotation.z = 0;
      
      const currentPose = poseRef.current;
      if (currentPose === 'walk') {
        const swing = Math.sin(walkTime) * 0.4;
        if (rightArmMesh) rightArmMesh.rotation.x = swing;
        if (leftArmMesh) leftArmMesh.rotation.x = -swing;
        if (rightLegMesh) rightLegMesh.rotation.x = -swing;
        if (leftLegMesh) leftLegMesh.rotation.x = swing;
      } else if (currentPose === 'idle') {
        const breath = Math.sin(walkTime * 0.5) * 0.05;
        if (rightArmMesh) rightArmMesh.rotation.x = breath;
        if (leftArmMesh) leftArmMesh.rotation.x = breath;
        if (rightLegMesh) rightLegMesh.rotation.x = 0;
        if (leftLegMesh) leftLegMesh.rotation.x = 0;
      } else if (currentPose === 'wave') {
        const wave = Math.sin(walkTime * 3) * 0.5 + 0.8;
        if (rightArmMesh) { rightArmMesh.rotation.x = -1.5; rightArmMesh.rotation.z = wave; }
        if (leftArmMesh) leftArmMesh.rotation.x = 0;
        if (rightLegMesh) rightLegMesh.rotation.x = 0;
        if (leftLegMesh) leftLegMesh.rotation.x = 0;
      } else if (currentPose === 'dance') {
        const t = walkTime * 2;
        const bounce = Math.abs(Math.sin(t * 2)) * 0.1;
        const armSwing = Math.sin(t) * 1.2;
        const legSwing = Math.sin(t) * 0.4;
        if (rightArmMesh) { rightArmMesh.rotation.x = armSwing; rightArmMesh.rotation.z = Math.sin(t * 2) * 0.3; }
        if (leftArmMesh) { leftArmMesh.rotation.x = -armSwing; leftArmMesh.rotation.z = -Math.sin(t * 2) * 0.3; }
        if (rightLegMesh) rightLegMesh.rotation.x = legSwing;
        if (leftLegMesh) leftLegMesh.rotation.x = -legSwing;
        character.position.y = bounce;
      } else if (currentPose === 'floss') {
        const t = walkTime * 4;
        const swing = Math.sin(t) * 1.5;
        const hipSwing = Math.sin(t) * 0.2;
        if (rightArmMesh) { rightArmMesh.rotation.x = 0; rightArmMesh.rotation.z = swing; }
        if (leftArmMesh) { leftArmMesh.rotation.x = 0; leftArmMesh.rotation.z = -swing; }
        if (rightLegMesh) rightLegMesh.rotation.x = hipSwing * 0.3;
        if (leftLegMesh) leftLegMesh.rotation.x = -hipSwing * 0.3;
      } else if (currentPose === 'dab') {
        const bounce = Math.sin(walkTime * 2) * 0.02;
        if (rightArmMesh) { rightArmMesh.rotation.x = -2.5; rightArmMesh.rotation.z = 0.5; }
        if (leftArmMesh) { leftArmMesh.rotation.x = -0.5; leftArmMesh.rotation.z = -1.2; }
        character.rotation.z = 0.2 + bounce;
        if (rightLegMesh) rightLegMesh.rotation.x = 0;
        if (leftLegMesh) leftLegMesh.rotation.x = 0;
      }
      
      if (particles.visible) {
        const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          posAttr.array[i * 3 + 1] += 0.01;
          if (posAttr.array[i * 3 + 1] > 2.8) {
            posAttr.array[i * 3 + 1] = 0;
          }
        }
        posAttr.needsUpdate = true;
        particles.rotation.y = walkTime * 0.2;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      renderer.dispose();
      materialsRef.current.clear();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 🎨 Update textures when skin canvas or version changes
  useEffect(() => {
    if (!skinCanvas || !characterRef.current) return;
    
    const ctx = skinCanvas.getContext('2d');
    if (!ctx) return;

    characterRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name in SKIN_UV_MAP) {
        const partName = child.name as keyof typeof SKIN_UV_MAP;
        const uvMap = SKIN_UV_MAP[partName];
        
        const faceOrder = ['right', 'left', 'top', 'bottom', 'front', 'back'] as const;
        const newMaterials = faceOrder.map((face, i) => {
          const region = uvMap[face];
          const material = createFaceMaterial(ctx, region);
          materialsRef.current.set(`${partName}-${i}`, material);
          return material;
        });
        
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        }
        
        child.material = newMaterials;
      }
    });
  }, [skinCanvas, textureVersion, createFaceMaterial]);

  useEffect(() => { poseRef.current = pose; }, [pose]);
  useEffect(() => { animSpeedRef.current = animSpeed; }, [animSpeed]);
  useEffect(() => { if (cameraRef.current) cameraRef.current.position.z = zoom; }, [zoom]);
  useEffect(() => { if (particlesRef.current) particlesRef.current.visible = showParticles; }, [showParticles]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  const setCameraAngle = (angle: 'front' | 'side' | 'back' | 'left') => {
    switch (angle) {
      case 'front': rotationRef.current = { x: 0.1, y: 0 }; break;
      case 'side': rotationRef.current = { x: 0.1, y: Math.PI / 2 }; break;
      case 'back': rotationRef.current = { x: 0.1, y: Math.PI }; break;
      case 'left': rotationRef.current = { x: 0.1, y: -Math.PI / 2 }; break;
    }
    autoRotateRef.current = false;
    setAutoRotate(false);
  };

  const takeScreenshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    
    const originalSize = renderer.getSize(new THREE.Vector2());
    renderer.setSize(800, 1120);
    renderer.render(scene, camera);
    
    const dataUrl = renderer.domElement.toDataURL('image/png');
    renderer.setSize(originalSize.x, originalSize.y);
    
    const link = document.createElement('a');
    link.download = 'minecraft-skin-3d.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative group">
      <div 
        className="relative rounded-xl overflow-hidden mx-auto cursor-grab active:cursor-grabbing shadow-2xl"
        style={{ 
          width: 200, 
          height: 280,
          boxShadow: '0 0 30px rgba(100, 149, 237, 0.3), 0 0 60px rgba(138, 43, 226, 0.2)',
        }}
      >
        <div ref={containerRef} className="w-full h-full" />
        
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }}
        />
        
        <button
          onClick={takeScreenshot}
          className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:scale-105 shadow-lg"
          title="Save 3D preview as image"
        >
          📸
        </button>
        
        <button
          onClick={() => { setAutoRotate(!autoRotate); autoRotateRef.current = !autoRotate; }}
          className={`absolute top-12 right-2 px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:scale-105 shadow ${
            autoRotate ? 'bg-green-400 text-green-900' : 'bg-gray-400 text-gray-700'
          }`}
          title={autoRotate ? 'Stop auto-rotate' : 'Start auto-rotate'}
        >
          🔄
        </button>
        
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => setZoom(z => Math.max(3, z - 0.5))} className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold shadow" title="Zoom in">🔍+</button>
          <button onClick={() => setZoom(z => Math.min(8, z + 0.5))} className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold shadow" title="Zoom out">🔍−</button>
        </div>
        
        <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => setCameraAngle('front')} className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold shadow" title="Front view">👤</button>
          <button onClick={() => setCameraAngle('side')} className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold shadow" title="Right side">👉</button>
          <button onClick={() => setCameraAngle('left')} className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold shadow" title="Left side">👈</button>
          <button onClick={() => setCameraAngle('back')} className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold shadow" title="Back view">🔙</button>
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-1.5 py-1 rounded text-xs font-bold shadow ${showParticles ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-gray-700'}`}
            title={showParticles ? 'Hide sparkles' : 'Show sparkles'}
          >
            ✨
          </button>
        </div>
        
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all" style={{ maxWidth: '120px' }}>
          {[
            { id: 'walk', emoji: '🚶', label: 'Walk' },
            { id: 'idle', emoji: '🧍', label: 'Idle' },
            { id: 'wave', emoji: '👋', label: 'Wave' },
            { id: 'dance', emoji: '💃', label: 'Dance' },
            { id: 'floss', emoji: '🕺', label: 'Floss' },
            { id: 'dab', emoji: '😎', label: 'Dab' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPose(p.id as typeof pose)}
              className={`px-1.5 py-1 rounded text-xs font-bold shadow transition-all hover:scale-105 ${
                pose === p.id ? 'bg-purple-500 text-white' : 'bg-white/90 text-gray-800'
              }`}
              title={p.label}
            >
              {p.emoji}
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-1">🖱️ Drag to rotate • Scroll to zoom • Double-click to reset</p>
    </div>
  );
}
