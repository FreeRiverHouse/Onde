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

    // Animation loop
    let rotation = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      rotation += 0.01;
      character.rotation.y = rotation;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
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
    <div 
      ref={containerRef} 
      className="rounded-xl overflow-hidden mx-auto"
      style={{ width: 200, height: 280 }}
    />
  );
}
