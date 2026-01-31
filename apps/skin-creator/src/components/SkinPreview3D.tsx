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
  const rotationRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(200, 280);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create character group
    const character = new THREE.Group();
    characterRef.current = character;

    // Materials will be updated when skin loads
    const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xc4a57b });

    // Head (8x8x8 in Minecraft scale, we use 0.5 units)
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeometry, defaultMaterial.clone());
    head.position.y = 1.75;
    head.name = 'head';
    character.add(head);

    // Body (8x12x4)
    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.75, 0.25);
    const body = new THREE.Mesh(bodyGeometry, defaultMaterial.clone());
    body.position.y = 1.125;
    body.name = 'body';
    character.add(body);

    // Right Arm
    const armGeometry = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const rightArm = new THREE.Mesh(armGeometry, defaultMaterial.clone());
    rightArm.position.set(-0.375, 1.125, 0);
    rightArm.name = 'rightArm';
    character.add(rightArm);

    // Left Arm
    const leftArm = new THREE.Mesh(armGeometry, defaultMaterial.clone());
    leftArm.position.set(0.375, 1.125, 0);
    leftArm.name = 'leftArm';
    character.add(leftArm);

    // Right Leg
    const legGeometry = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const rightLeg = new THREE.Mesh(legGeometry, defaultMaterial.clone());
    rightLeg.position.set(-0.125, 0.375, 0);
    rightLeg.name = 'rightLeg';
    character.add(rightLeg);

    // Left Leg
    const leftLeg = new THREE.Mesh(legGeometry, defaultMaterial.clone());
    leftLeg.position.set(0.125, 0.375, 0);
    leftLeg.name = 'leftLeg';
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

    // Animation loop with interactive rotation
    const animate = () => {
      requestAnimationFrame(animate);
      if (autoRotateRef.current) {
        rotationRef.current.y += 0.01;
      }
      character.rotation.y = rotationRef.current.y;
      character.rotation.x = rotationRef.current.x;
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
        const material = child.material as THREE.MeshLambertMaterial;
        // For now, just update the color based on skin
        // Full UV mapping would require more complex setup
      }
    });
  }, [skinCanvas]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="rounded-xl overflow-hidden mx-auto cursor-grab active:cursor-grabbing"
        style={{ width: 200, height: 280 }}
      />
      <p className="text-xs text-gray-400 text-center mt-1">🖱️ Drag to rotate</p>
    </div>
  );
}
