'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SkinPreview3DProps {
  skinCanvas: HTMLCanvasElement | null;
}

export default function SkinPreview3D({ skinCanvas }: SkinPreview3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.1, y: 0.3 }); // Slight angle to show front nicely
  const autoRotateRef = useRef(true);
  const particlesRef = useRef<THREE.Points | null>(null);
  const [showParticles, setShowParticles] = useState(true);
  const [pose, setPose] = useState<'walk' | 'idle' | 'wave' | 'dance' | 'floss' | 'dab'>('walk');
  const poseRef = useRef<'walk' | 'idle' | 'wave' | 'dance' | 'floss' | 'dab'>('walk');
  const [zoom, setZoom] = useState(5); // Camera distance
  const zoomRef = useRef(5);
  const [animSpeed, setAnimSpeed] = useState(1); // Animation speed multiplier
  const animSpeedRef = useRef(1);
  const [screenshotBg, setScreenshotBg] = useState<'gradient' | 'transparent' | 'white' | 'black' | 'green'>('gradient');
  const [showBgMenu, setShowBgMenu] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with gradient background
    const scene = new THREE.Scene();
    // Create gradient texture for background
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

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5); // Closer and centered on character
    camera.lookAt(0, 0.9, 0);
    cameraRef.current = camera;

    // Renderer with shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(200, 280);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 🌟 IMPROVED LIGHTING - More dramatic!
    // Ambient (soft fill)
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);
    
    // Main key light with shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);
    
    // Rim light (dramatic edge lighting)
    const rimLight = new THREE.DirectionalLight(0x6699ff, 0.6);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    
    // Fill light (warm)
    const fillLight = new THREE.PointLight(0xff9966, 0.3, 10);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);
    
    // Ground plane for shadow
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create character group
    const character = new THREE.Group();
    characterRef.current = character;

    // Materials will be updated when skin loads
    // 🎨 Improved material with better shading
    const improvedMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc4a57b,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Head (8x8x8 in Minecraft scale, we use 0.5 units)
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeometry, improvedMaterial.clone());
    head.position.y = 1.75;
    head.name = 'head';
    head.castShadow = true;
    head.receiveShadow = true;
    character.add(head);

    // Body (8x12x4)
    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.75, 0.25);
    const body = new THREE.Mesh(bodyGeometry, improvedMaterial.clone());
    body.position.y = 1.125;
    body.name = 'body';
    body.castShadow = true;
    body.receiveShadow = true;
    character.add(body);

    // Right Arm
    const armGeometry = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const rightArm = new THREE.Mesh(armGeometry, improvedMaterial.clone());
    rightArm.position.set(-0.375, 1.125, 0);
    rightArm.name = 'rightArm';
    rightArm.castShadow = true;
    character.add(rightArm);

    // Left Arm
    const leftArm = new THREE.Mesh(armGeometry, improvedMaterial.clone());
    leftArm.position.set(0.375, 1.125, 0);
    leftArm.name = 'leftArm';
    leftArm.castShadow = true;
    character.add(leftArm);

    // Right Leg
    const legGeometry = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const rightLeg = new THREE.Mesh(legGeometry, improvedMaterial.clone());
    rightLeg.position.set(-0.125, 0.375, 0);
    rightLeg.name = 'rightLeg';
    rightLeg.castShadow = true;
    character.add(rightLeg);

    // Left Leg
    const leftLeg = new THREE.Mesh(legGeometry, improvedMaterial.clone());
    leftLeg.position.set(0.125, 0.375, 0);
    leftLeg.name = 'leftLeg';
    leftLeg.castShadow = true;
    character.add(leftLeg);

    scene.add(character);

    // ✨ PARTICLE EFFECTS - Sparkles around character
    const particleCount = 30;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Spawn in a cylinder around character
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 2.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Random colors (gold, cyan, purple)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.84; colors[i * 3 + 2] = 0; // Gold
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // Cyan
      } else {
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1; // Purple
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

    // Mouse/Touch drag handlers
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
      rotationRef.current.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, rotationRef.current.x));
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      // Resume auto-rotate after 3 seconds
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
      rotationRef.current.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, rotationRef.current.x));
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    
    const onTouchEnd = () => {
      isDragging.current = false;
      setTimeout(() => { autoRotateRef.current = true; }, 3000);
    };
    
    // 🔍 Mouse wheel zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.5 : -0.5;
      const newZoom = Math.min(10, Math.max(3, zoomRef.current + delta));
      zoomRef.current = newZoom;
      setZoom(newZoom);
      if (camera) camera.position.z = newZoom;
    };
    
    // 🔄 Double-click to reset view
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

    // Animation loop with interactive rotation and walking
    let walkTime = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      walkTime += 0.05 * animSpeedRef.current;
      
      if (autoRotateRef.current) {
        rotationRef.current.y += 0.01;
      }
      character.rotation.y = rotationRef.current.y;
      character.rotation.x = rotationRef.current.x;
      
      // 🕺 Pose-based animation
      const rightArmMesh = character.getObjectByName('rightArm');
      const leftArmMesh = character.getObjectByName('leftArm');
      const rightLegMesh = character.getObjectByName('rightLeg');
      const leftLegMesh = character.getObjectByName('leftLeg');
      
      const currentPose = poseRef.current;
      if (currentPose === 'walk') {
        const swing = Math.sin(walkTime) * 0.3;
        if (rightArmMesh) rightArmMesh.rotation.x = swing;
        if (leftArmMesh) leftArmMesh.rotation.x = -swing;
        if (rightLegMesh) rightLegMesh.rotation.x = -swing;
        if (leftLegMesh) leftLegMesh.rotation.x = swing;
      } else if (currentPose === 'idle') {
        // Subtle breathing animation
        const breath = Math.sin(walkTime * 0.5) * 0.05;
        if (rightArmMesh) rightArmMesh.rotation.x = breath;
        if (leftArmMesh) leftArmMesh.rotation.x = breath;
        if (rightLegMesh) rightLegMesh.rotation.x = 0;
        if (leftLegMesh) leftLegMesh.rotation.x = 0;
      } else if (currentPose === 'wave') {
        // Waving animation
        const wave = Math.sin(walkTime * 3) * 0.5 + 0.8;
        if (rightArmMesh) { rightArmMesh.rotation.x = -1.5; rightArmMesh.rotation.z = wave; }
        if (leftArmMesh) leftArmMesh.rotation.x = 0;
        if (rightLegMesh) rightLegMesh.rotation.x = 0;
        if (leftLegMesh) leftLegMesh.rotation.x = 0;
      } else if (currentPose === 'dance') {
        // 💃 Dance animation - Fortnite-style!
        const t = walkTime * 2;
        const bounce = Math.abs(Math.sin(t * 2)) * 0.1;
        const armSwing = Math.sin(t) * 1.2;
        const legSwing = Math.sin(t) * 0.4;
        if (rightArmMesh) { rightArmMesh.rotation.x = armSwing; rightArmMesh.rotation.z = Math.sin(t * 2) * 0.3; }
        if (leftArmMesh) { leftArmMesh.rotation.x = -armSwing; leftArmMesh.rotation.z = -Math.sin(t * 2) * 0.3; }
        if (rightLegMesh) rightLegMesh.rotation.x = legSwing;
        if (leftLegMesh) leftLegMesh.rotation.x = -legSwing;
        // Bounce the whole character
        character.position.y = bounce;
      } else if (currentPose === 'floss') {
        // 🕺 FLOSS DANCE - The classic!
        const t = walkTime * 4; // Fast!
        const swing = Math.sin(t) * 1.5;
        const hipSwing = Math.sin(t) * 0.2;
        // Arms swing side to side, opposite direction
        if (rightArmMesh) { rightArmMesh.rotation.x = 0; rightArmMesh.rotation.z = swing; }
        if (leftArmMesh) { leftArmMesh.rotation.x = 0; leftArmMesh.rotation.z = -swing; }
        // Legs stay mostly still, slight hip movement
        if (rightLegMesh) rightLegMesh.rotation.x = hipSwing * 0.3;
        if (leftLegMesh) leftLegMesh.rotation.x = -hipSwing * 0.3;
        // Hip rotation
        character.rotation.y = rotationRef.current.y + hipSwing;
      } else if (currentPose === 'dab') {
        // 😎 DAB POSE - Static with subtle bounce
        const bounce = Math.sin(walkTime * 2) * 0.02;
        // Right arm up diagonal, left arm down diagonal
        if (rightArmMesh) { rightArmMesh.rotation.x = -2.5; rightArmMesh.rotation.z = 0.5; }
        if (leftArmMesh) { leftArmMesh.rotation.x = -0.5; leftArmMesh.rotation.z = -1.2; }
        // Head tucked into elbow (simulated by body tilt)
        character.rotation.z = 0.2 + bounce;
        if (rightLegMesh) rightLegMesh.rotation.x = 0;
        if (leftLegMesh) leftLegMesh.rotation.x = 0;
      }
      
      // ✨ Animate particles - float upward and respawn
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.array[i * 3 + 1] += 0.01; // Float up
        if (posAttr.array[i * 3 + 1] > 2.8) {
          posAttr.array[i * 3 + 1] = 0; // Respawn at bottom
        }
      }
      posAttr.needsUpdate = true;
      particles.rotation.y = walkTime * 0.2; // Slow spin
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
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
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update texture when skin changes
  useEffect(() => {
    if (!skinCanvas || !characterRef.current) return;

    // Create texture from skin canvas
    const texture = new THREE.CanvasTexture(skinCanvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    textureRef.current = texture;

    // Update materials (simplified - just color for now)
    characterRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Full UV mapping would require more complex setup
        // For now, the basic blocky character is displayed
        void child.material; // Material available for future texture mapping
      }
    });
  }, [skinCanvas]);

  // ✨ Update particle visibility
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.visible = showParticles;
    }
  }, [showParticles]);

  // 🕺 Update pose ref
  useEffect(() => {
    poseRef.current = pose;
  }, [pose]);

  // 🔍 Update camera zoom
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoom;
    }
  }, [zoom]);

  // ⏩ Update animation speed
  useEffect(() => {
    animSpeedRef.current = animSpeed;
  }, [animSpeed]);

  // 🎥 Camera angle presets
  const setCameraAngle = (angle: 'front' | 'side' | 'back') => {
    switch (angle) {
      case 'front':
        rotationRef.current = { x: 0.1, y: 0 };
        break;
      case 'side':
        rotationRef.current = { x: 0.1, y: Math.PI / 2 };
        break;
      case 'back':
        rotationRef.current = { x: 0.1, y: Math.PI };
        break;
    }
    autoRotateRef.current = false;
    setTimeout(() => { autoRotateRef.current = true; }, 3000);
  };

  // 📸 Screenshot function with background options
  const takeScreenshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    
    // Store original background
    const originalBackground = scene.background;
    
    // Set screenshot background based on selection
    switch (screenshotBg) {
      case 'transparent':
        scene.background = null;
        break;
      case 'white':
        scene.background = new THREE.Color(0xffffff);
        break;
      case 'black':
        scene.background = new THREE.Color(0x000000);
        break;
      case 'green':
        scene.background = new THREE.Color(0x00ff00); // Green screen for compositing
        break;
      // 'gradient' keeps the original background
    }
    
    // Render at high resolution
    const originalSize = renderer.getSize(new THREE.Vector2());
    renderer.setSize(800, 1120); // 4x resolution
    renderer.render(scene, camera);
    
    // Get image data
    const dataUrl = renderer.domElement.toDataURL('image/png');
    
    // Restore original background and size
    scene.background = originalBackground;
    renderer.setSize(originalSize.x, originalSize.y);
    
    // Download
    const link = document.createElement('a');
    link.download = `minecraft-skin-3d-${screenshotBg}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative group">
      {/* 🎬 Post-processing container with glow */}
      <div 
        className="relative rounded-xl overflow-hidden mx-auto cursor-grab active:cursor-grabbing shadow-2xl"
        style={{ 
          width: 200, 
          height: 280,
          boxShadow: '0 0 30px rgba(100, 149, 237, 0.3), 0 0 60px rgba(138, 43, 226, 0.2)',
        }}
      >
        <div ref={containerRef} className="w-full h-full" />
        
        {/* 🌟 Vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        
        {/* ✨ Subtle bloom overlay on hover */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 60%)',
          }}
        />
        
        {/* 📸 Screenshot controls */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          {/* Background selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBgMenu(!showBgMenu)}
              className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded-lg text-xs font-bold hover:scale-105 shadow-lg"
              title="Choose screenshot background"
            >
              {screenshotBg === 'gradient' && '🌈'}
              {screenshotBg === 'transparent' && '🔲'}
              {screenshotBg === 'white' && '⬜'}
              {screenshotBg === 'black' && '⬛'}
              {screenshotBg === 'green' && '🟢'}
            </button>
            {showBgMenu && (
              <div className="absolute bottom-full right-0 mb-1 bg-white rounded-lg shadow-xl p-1 flex flex-col gap-0.5 z-10">
                <button
                  onClick={() => { setScreenshotBg('gradient'); setShowBgMenu(false); }}
                  className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 flex items-center gap-1 ${screenshotBg === 'gradient' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                  title="Gradient background"
                >
                  🌈 Gradient
                </button>
                <button
                  onClick={() => { setScreenshotBg('transparent'); setShowBgMenu(false); }}
                  className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 flex items-center gap-1 ${screenshotBg === 'transparent' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                  title="Transparent background (PNG)"
                >
                  🔲 Transparent
                </button>
                <button
                  onClick={() => { setScreenshotBg('white'); setShowBgMenu(false); }}
                  className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 flex items-center gap-1 ${screenshotBg === 'white' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                  title="White background"
                >
                  ⬜ White
                </button>
                <button
                  onClick={() => { setScreenshotBg('black'); setShowBgMenu(false); }}
                  className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 flex items-center gap-1 ${screenshotBg === 'black' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                  title="Black background"
                >
                  ⬛ Black
                </button>
                <button
                  onClick={() => { setScreenshotBg('green'); setShowBgMenu(false); }}
                  className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 flex items-center gap-1 ${screenshotBg === 'green' ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                  title="Green screen (for compositing)"
                >
                  🟢 Green
                </button>
              </div>
            )}
          </div>
          {/* Screenshot button */}
          <button
            onClick={takeScreenshot}
            className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded-lg text-xs font-bold hover:scale-105 shadow-lg"
            title={`📸 Save 3D preview (${screenshotBg} background)`}
          >
            📸
          </button>
        </div>
        
        {/* 🔍 Zoom controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => setZoom(z => Math.max(3, z - 1))}
            className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Zoom in"
          >
            🔍+
          </button>
          <button
            onClick={() => setZoom(z => Math.min(10, z + 1))}
            className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Zoom out"
          >
            🔍−
          </button>
          <div className="mt-2 text-xs text-center text-white/80">⏩</div>
          <button
            onClick={() => setAnimSpeed(s => Math.max(0.25, s - 0.25))}
            className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Slower"
          >
            🐢
          </button>
          <div className="text-xs text-center text-white font-bold">{animSpeed}x</div>
          <button
            onClick={() => setAnimSpeed(s => Math.min(3, s + 0.25))}
            className="px-2 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Faster"
          >
            🐇
          </button>
        </div>
        
        {/* 🎥 Camera angle buttons */}
        <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => setCameraAngle('front')}
            className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Front view"
          >
            👤
          </button>
          <button
            onClick={() => setCameraAngle('side')}
            className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Side view"
          >
            👈
          </button>
          <button
            onClick={() => setCameraAngle('back')}
            className="px-1.5 py-1 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold hover:scale-105 shadow"
            title="Back view"
          >
            🔙
          </button>
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              showParticles ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-gray-700'
            }`}
            title={showParticles ? 'Hide particles' : 'Show particles'}
          >
            ✨
          </button>
        </div>
        
        {/* 🕺 Pose buttons */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => setPose('walk')}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              pose === 'walk' ? 'bg-green-400 text-green-900' : 'bg-white/90 text-gray-800'
            }`}
            title="Walking pose"
          >
            🚶
          </button>
          <button
            onClick={() => setPose('idle')}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              pose === 'idle' ? 'bg-blue-400 text-blue-900' : 'bg-white/90 text-gray-800'
            }`}
            title="Idle pose"
          >
            🧍
          </button>
          <button
            onClick={() => setPose('wave')}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              pose === 'wave' ? 'bg-pink-400 text-pink-900' : 'bg-white/90 text-gray-800'
            }`}
            title="Waving pose"
          >
            👋
          </button>
          <button
            onClick={() => setPose('dance')}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              pose === 'dance' ? 'bg-purple-400 text-purple-900' : 'bg-white/90 text-gray-800'
            }`}
            title="Dance! 💃"
          >
            💃
          </button>
          <button
            onClick={() => setPose('floss')}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              pose === 'floss' ? 'bg-orange-400 text-orange-900' : 'bg-white/90 text-gray-800'
            }`}
            title="Floss! 🕺"
          >
            🕺
          </button>
          <button
            onClick={() => setPose('dab')}
            className={`px-1.5 py-1 rounded text-xs font-bold hover:scale-105 shadow ${
              pose === 'dab' ? 'bg-cyan-400 text-cyan-900' : 'bg-white/90 text-gray-800'
            }`}
            title="Dab! 😎"
          >
            😎
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-1">🖱️ Drag • Scroll zoom • Double-click reset</p>
    </div>
  );
}
