'use client';

import { useEffect, useRef } from 'react';
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
    const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xc4a57b });

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

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // Animation loop with interactive rotation and walking
    let walkTime = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      walkTime += 0.05;
      
      if (autoRotateRef.current) {
        rotationRef.current.y += 0.01;
      }
      character.rotation.y = rotationRef.current.y;
      character.rotation.x = rotationRef.current.x;
      
      // Walking animation - swing arms and legs
      const swing = Math.sin(walkTime) * 0.3;
      const rightArmMesh = character.getObjectByName('rightArm');
      const leftArmMesh = character.getObjectByName('leftArm');
      const rightLegMesh = character.getObjectByName('rightLeg');
      const leftLegMesh = character.getObjectByName('leftLeg');
      
      if (rightArmMesh) rightArmMesh.rotation.x = swing;
      if (leftArmMesh) leftArmMesh.rotation.x = -swing;
      if (rightLegMesh) rightLegMesh.rotation.x = -swing;
      if (leftLegMesh) leftLegMesh.rotation.x = swing;
      
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
      </div>
      
      <p className="text-xs text-gray-400 text-center mt-1">🖱️ Drag to rotate</p>
    </div>
  );
}
