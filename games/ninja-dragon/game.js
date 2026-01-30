import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// 🐉 NINJA DRAGON - Web Game
// ============================================

let scene, camera, renderer, controls;
let ninja, dragon, enemies = [];
let isRidingDragon = false;
let gameStarted = false;

// Game State
const state = {
  health: 100,
  dragonPower: 100,
  combo: 0,
  comboTimer: null,
  isAttacking: false,
  isDashing: false,
  velocity: new THREE.Vector3(),
  onGround: true
};

// Input State
const keys = {
  w: false, a: false, s: false, d: false,
  space: false, shift: false, e: false, q: false
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0a2e);
  scene.fog = new THREE.Fog(0x1a0a2e, 50, 200);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 20);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true;
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Check for WebXR
  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      if (supported) {
        document.getElementById('vr-button').style.display = 'block';
      }
    });
  }

  // Controls (for development)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enabled = false; // Disable in gameplay

  // Lights
  setupLights();
  
  // Environment
  createEnvironment();
  
  // Characters
  createNinja();
  createDragon();
  spawnEnemies(5);

  // Event Listeners
  setupEventListeners();

  // Start render loop
  renderer.setAnimationLoop(animate);
}

// ============================================
// LIGHTS
// ============================================

function setupLights() {
  // Ambient
  const ambient = new THREE.AmbientLight(0x4444aa, 0.4);
  scene.add(ambient);

  // Main directional (sun/moon)
  const sun = new THREE.DirectionalLight(0xffaa44, 1);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 500;
  sun.shadow.camera.left = -100;
  sun.shadow.camera.right = 100;
  sun.shadow.camera.top = 100;
  sun.shadow.camera.bottom = -100;
  scene.add(sun);

  // Hemisphere (sky/ground)
  const hemi = new THREE.HemisphereLight(0x6644ff, 0x224422, 0.6);
  scene.add(hemi);

  // Point lights for atmosphere
  const torch1 = new THREE.PointLight(0xff4400, 2, 30);
  torch1.position.set(-20, 5, -20);
  scene.add(torch1);

  const torch2 = new THREE.PointLight(0xff4400, 2, 30);
  torch2.position.set(20, 5, -20);
  scene.add(torch2);
}

// ============================================
// ENVIRONMENT
// ============================================

function createEnvironment() {
  // Ground - Japanese-style arena
  const groundGeo = new THREE.CircleGeometry(100, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2a3a2a,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Center platform
  const platformGeo = new THREE.CylinderGeometry(15, 15, 1, 32);
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x3a4a5a,
    roughness: 0.3,
    metalness: 0.5
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = 0.5;
  platform.receiveShadow = true;
  scene.add(platform);

  // Dojo pillars
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const pillarGeo = new THREE.CylinderGeometry(1, 1.2, 12, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 0.5
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(
      Math.cos(angle) * 25,
      6,
      Math.sin(angle) * 25
    );
    pillar.castShadow = true;
    scene.add(pillar);

    // Lantern on pillar
    const lanternGeo = new THREE.BoxGeometry(2, 3, 2);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.5
    });
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.set(
      Math.cos(angle) * 25,
      13,
      Math.sin(angle) * 25
    );
    scene.add(lantern);
  }

  // Mountains in background
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 80 + Math.random() * 40;
    const height = 30 + Math.random() * 40;
    
    const mountainGeo = new THREE.ConeGeometry(15 + Math.random() * 10, height, 8);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.3, 0.2 + Math.random() * 0.1),
      flatShading: true
    });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.set(
      Math.cos(angle) * distance,
      height / 2 - 5,
      Math.sin(angle) * distance
    );
    scene.add(mountain);
  }

  // Floating islands (for dragon flight)
  for (let i = 0; i < 5; i++) {
    const islandGeo = new THREE.DodecahedronGeometry(5 + Math.random() * 5, 1);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a3a,
      flatShading: true
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(
      (Math.random() - 0.5) * 100,
      20 + Math.random() * 30,
      (Math.random() - 0.5) * 100
    );
    island.userData.floatOffset = Math.random() * Math.PI * 2;
    island.userData.floatSpeed = 0.5 + Math.random() * 0.5;
    scene.add(island);
  }

  // Cherry blossom particles
  createParticles();
}

function createParticles() {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = Math.random() * 50;
    positions[i + 2] = (Math.random() - 0.5) * 100;

    colors[i] = 1;
    colors[i + 1] = 0.7 + Math.random() * 0.3;
    colors[i + 2] = 0.8 + Math.random() * 0.2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const particles = new THREE.Points(geometry, material);
  particles.userData.isParticles = true;
  scene.add(particles);
}

// ============================================
// NINJA CHARACTER
// ============================================

function createNinja() {
  ninja = new THREE.Group();
  ninja.userData = {
    isNinja: true,
    attackCooldown: 0
  };

  // Body
  const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.7
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.5;
  body.castShadow = true;
  ninja.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.5
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.8;
  head.castShadow = true;
  ninja.add(head);

  // Eyes (glowing)
  const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x00ffaa,
    emissive: 0x00ffaa,
    emissiveIntensity: 1
  });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.15, 2.85, 0.35);
  ninja.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.15, 2.85, 0.35);
  ninja.add(rightEye);

  // Sword
  const swordGroup = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(0.05, 1.5, 0.15);
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.1
  });
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 0.75;
  swordGroup.add(blade);

  const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = -0.15;
  swordGroup.add(handle);

  swordGroup.position.set(0.8, 1.5, 0);
  swordGroup.rotation.z = -0.3;
  ninja.add(swordGroup);
  ninja.userData.sword = swordGroup;

  scene.add(ninja);
}

// ============================================
// DRAGON
// ============================================

function createDragon() {
  dragon = new THREE.Group();
  dragon.userData = {
    isDragon: true,
    fireReady: true,
    fireCooldown: 0
  };

  // Body
  const bodyGeo = new THREE.CapsuleGeometry(2, 6, 16, 32);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x2a4a6a,
    roughness: 0.4,
    metalness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  dragon.add(body);

  // Head
  const headGeo = new THREE.ConeGeometry(1.5, 4, 8);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(5, 0.5, 0);
  head.rotation.z = -Math.PI / 2;
  head.castShadow = true;
  dragon.add(head);

  // Eyes
  const dragonEyeGeo = new THREE.SphereGeometry(0.3, 8, 8);
  const dragonEyeMat = new THREE.MeshStandardMaterial({
    color: 0xff4400,
    emissive: 0xff4400,
    emissiveIntensity: 0.8
  });
  const leftDragonEye = new THREE.Mesh(dragonEyeGeo, dragonEyeMat);
  leftDragonEye.position.set(4, 1.2, 1);
  dragon.add(leftDragonEye);
  
  const rightDragonEye = new THREE.Mesh(dragonEyeGeo, dragonEyeMat);
  rightDragonEye.position.set(4, 1.2, -1);
  dragon.add(rightDragonEye);

  // Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0, 8);
  wingShape.lineTo(6, 5);
  wingShape.lineTo(8, 2);
  wingShape.lineTo(5, 0);
  wingShape.lineTo(0, 0);

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x3a5a8a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(0, 2, 2);
  leftWing.rotation.x = Math.PI / 6;
  leftWing.castShadow = true;
  dragon.add(leftWing);
  dragon.userData.leftWing = leftWing;

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0, 2, -2);
  rightWing.rotation.x = -Math.PI / 6;
  rightWing.rotation.y = Math.PI;
  rightWing.castShadow = true;
  dragon.add(rightWing);
  dragon.userData.rightWing = rightWing;

  // Tail
  const tailGeo = new THREE.ConeGeometry(1, 6, 8);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.position.set(-6, 0, 0);
  tail.rotation.z = Math.PI / 2;
  tail.castShadow = true;
  dragon.add(tail);

  // Spikes
  for (let i = 0; i < 6; i++) {
    const spikeGeo = new THREE.ConeGeometry(0.3, 1.5, 6);
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0x1a3a5a });
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.position.set(-3 + i * 1.2, 2.5, 0);
    spike.rotation.x = Math.PI;
    dragon.add(spike);
  }

  dragon.position.set(15, 3, 0);
  dragon.scale.set(0.8, 0.8, 0.8);
  scene.add(dragon);
}

// ============================================
// ENEMIES
// ============================================

function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    const enemy = createEnemy();
    const angle = (i / count) * Math.PI * 2;
    const radius = 10 + Math.random() * 10;
    enemy.position.set(
      Math.cos(angle) * radius,
      1.5,
      Math.sin(angle) * radius
    );
    enemies.push(enemy);
    scene.add(enemy);
  }
}

function createEnemy() {
  const enemy = new THREE.Group();
  enemy.userData = {
    isEnemy: true,
    health: 3,
    attackTimer: 0,
    stunned: false
  };

  // Body
  const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x4a1a1a,
    roughness: 0.6
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  enemy.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x3a1a1a,
    roughness: 0.5
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.1;
  head.castShadow = true;
  enemy.add(head);

  // Evil eyes
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1
  });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 1.15, 0.3);
  enemy.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 1.15, 0.3);
  enemy.add(rightEye);

  return enemy;
}

// ============================================
// INPUT HANDLING
// ============================================

function setupEventListeners() {
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('click', onMouseClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e) {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = true;
  
  // Mount/dismount dragon
  if (key === 'e' && gameStarted) {
    toggleDragonMount();
  }
  
  // Dragon fire
  if (key === 'q' && isRidingDragon && dragon.userData.fireReady) {
    dragonFire();
  }
}

function onKeyUp(e) {
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = false;
}

function onMouseClick() {
  if (gameStarted && !isRidingDragon) {
    ninjaAttack();
  }
}

// ============================================
// GAME MECHANICS
// ============================================

function toggleDragonMount() {
  if (!isRidingDragon) {
    // Check distance to dragon
    const dist = ninja.position.distanceTo(dragon.position);
    if (dist < 8) {
      isRidingDragon = true;
      ninja.visible = false;
    }
  } else {
    isRidingDragon = false;
    ninja.visible = true;
    ninja.position.copy(dragon.position);
    ninja.position.y = 1.5;
  }
}

function ninjaAttack() {
  if (state.isAttacking) return;
  state.isAttacking = true;

  // Animate sword
  const sword = ninja.userData.sword;
  const originalRot = sword.rotation.z;
  
  // Slash animation
  const slashDuration = 200;
  const startTime = Date.now();
  
  function animateSlash() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / slashDuration, 1);
    
    if (progress < 0.5) {
      sword.rotation.z = originalRot + progress * 2 * Math.PI;
    } else {
      sword.rotation.z = originalRot + (1 - (progress - 0.5) * 2) * Math.PI;
    }
    
    if (progress < 1) {
      requestAnimationFrame(animateSlash);
    } else {
      sword.rotation.z = originalRot;
      state.isAttacking = false;
    }
  }
  animateSlash();

  // Check for enemy hits
  enemies.forEach(enemy => {
    if (!enemy.userData.stunned) {
      const dist = ninja.position.distanceTo(enemy.position);
      if (dist < 3) {
        hitEnemy(enemy);
      }
    }
  });
}

function hitEnemy(enemy) {
  enemy.userData.health--;
  enemy.userData.stunned = true;
  
  // Knockback
  const dir = new THREE.Vector3()
    .subVectors(enemy.position, ninja.position)
    .normalize();
  enemy.position.add(dir.multiplyScalar(2));
  
  // Flash red
  enemy.traverse(child => {
    if (child.isMesh && child.material) {
      child.material.emissive = new THREE.Color(0xff0000);
      child.material.emissiveIntensity = 1;
      setTimeout(() => {
        child.material.emissive = new THREE.Color(0x000000);
        child.material.emissiveIntensity = 0;
        enemy.userData.stunned = false;
      }, 300);
    }
  });
  
  // Combo
  state.combo++;
  updateCombo();
  
  if (enemy.userData.health <= 0) {
    destroyEnemy(enemy);
  }
}

function destroyEnemy(enemy) {
  // Explosion particles
  for (let i = 0; i < 20; i++) {
    const particleGeo = new THREE.SphereGeometry(0.1, 4, 4);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.copy(enemy.position);
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 0.3,
      (Math.random() - 0.5) * 0.5
    );
    particle.userData.lifetime = 1;
    scene.add(particle);
    
    // Animate particle
    function animateParticle() {
      particle.position.add(particle.userData.velocity);
      particle.userData.velocity.y -= 0.01;
      particle.userData.lifetime -= 0.02;
      particle.material.opacity = particle.userData.lifetime;
      
      if (particle.userData.lifetime > 0) {
        requestAnimationFrame(animateParticle);
      } else {
        scene.remove(particle);
      }
    }
    animateParticle();
  }
  
  scene.remove(enemy);
  enemies = enemies.filter(e => e !== enemy);
  
  // Respawn
  setTimeout(() => {
    const newEnemy = createEnemy();
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    newEnemy.position.set(
      Math.cos(angle) * radius,
      1.5,
      Math.sin(angle) * radius
    );
    enemies.push(newEnemy);
    scene.add(newEnemy);
  }, 3000);
}

function dragonFire() {
  dragon.userData.fireReady = false;
  state.dragonPower -= 20;
  updateUI();
  
  // Create fire breath
  const fireGroup = new THREE.Group();
  
  for (let i = 0; i < 50; i++) {
    const fireGeo = new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 8, 8);
    const fireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1, 0.5),
      transparent: true,
      opacity: 0.8
    });
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.position.set(
      6 + i * 0.5,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    fire.userData.offset = i;
    fireGroup.add(fire);
  }
  
  dragon.add(fireGroup);
  
  // Animate fire
  let fireTime = 0;
  function animateFire() {
    fireTime += 0.1;
    
    fireGroup.children.forEach((fire, i) => {
      fire.scale.setScalar(1 + Math.sin(fireTime + i * 0.2) * 0.3);
      fire.material.opacity = Math.max(0, 0.8 - fireTime * 0.1);
    });
    
    // Check for enemy hits
    enemies.forEach(enemy => {
      const worldPos = new THREE.Vector3();
      fireGroup.children[0].getWorldPosition(worldPos);
      const dist = worldPos.distanceTo(enemy.position);
      if (dist < 10) {
        hitEnemy(enemy);
      }
    });
    
    if (fireTime < 8) {
      requestAnimationFrame(animateFire);
    } else {
      dragon.remove(fireGroup);
    }
  }
  animateFire();
  
  // Cooldown
  setTimeout(() => {
    dragon.userData.fireReady = true;
    state.dragonPower = Math.min(100, state.dragonPower + 20);
    updateUI();
  }, 3000);
}

function updateCombo() {
  const display = document.getElementById('combo-display');
  display.textContent = `COMBO x${state.combo}`;
  display.classList.add('visible');
  
  clearTimeout(state.comboTimer);
  state.comboTimer = setTimeout(() => {
    state.combo = 0;
    display.classList.remove('visible');
  }, 2000);
}

function updateUI() {
  document.getElementById('health-fill').style.width = `${state.health}%`;
  document.getElementById('dragon-fill').style.width = `${state.dragonPower}%`;
}

// ============================================
// GAME LOOP
// ============================================

function animate() {
  if (!gameStarted) return;

  const delta = 0.016; // ~60fps
  
  // Character movement
  if (isRidingDragon) {
    updateDragonMovement(delta);
  } else {
    updateNinjaMovement(delta);
  }
  
  // Update enemies
  updateEnemies(delta);
  
  // Update floating islands
  scene.traverse(obj => {
    if (obj.userData.floatOffset !== undefined) {
      obj.position.y += Math.sin(Date.now() * 0.001 * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.02;
    }
    
    // Update particles
    if (obj.userData.isParticles) {
      const positions = obj.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.02;
        if (positions[i + 1] < 0) positions[i + 1] = 50;
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      }
      obj.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  // Animate dragon wings
  if (dragon) {
    const wingFlap = Math.sin(Date.now() * 0.003) * 0.3;
    dragon.userData.leftWing.rotation.x = Math.PI / 6 + wingFlap;
    dragon.userData.rightWing.rotation.x = -Math.PI / 6 - wingFlap;
  }
  
  // Camera follow
  updateCamera();
  
  controls.update();
  renderer.render(scene, camera);
}

function updateNinjaMovement(delta) {
  const speed = keys.shift ? 0.4 : 0.2;
  const moveDir = new THREE.Vector3();
  
  if (keys.w) moveDir.z -= 1;
  if (keys.s) moveDir.z += 1;
  if (keys.a) moveDir.x -= 1;
  if (keys.d) moveDir.x += 1;
  
  if (moveDir.length() > 0) {
    moveDir.normalize().multiplyScalar(speed);
    ninja.position.add(moveDir);
    
    // Face movement direction
    const angle = Math.atan2(moveDir.x, moveDir.z);
    ninja.rotation.y = angle;
  }
  
  // Jump
  if (keys.space && state.onGround) {
    state.velocity.y = 0.3;
    state.onGround = false;
  }
  
  // Apply gravity
  state.velocity.y -= 0.015;
  ninja.position.y += state.velocity.y;
  
  if (ninja.position.y < 1.5) {
    ninja.position.y = 1.5;
    state.velocity.y = 0;
    state.onGround = true;
  }
  
  // Dash effect
  if (keys.shift && !state.isDashing) {
    state.isDashing = true;
    // Create dash trail
    const trail = ninja.clone();
    trail.traverse(child => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.5;
      }
    });
    scene.add(trail);
    
    let trailOpacity = 0.5;
    function fadeTrail() {
      trailOpacity -= 0.05;
      trail.traverse(child => {
        if (child.isMesh) child.material.opacity = trailOpacity;
      });
      if (trailOpacity > 0) {
        requestAnimationFrame(fadeTrail);
      } else {
        scene.remove(trail);
      }
    }
    fadeTrail();
    
    setTimeout(() => state.isDashing = false, 100);
  }
}

function updateDragonMovement(delta) {
  const speed = 0.5;
  const moveDir = new THREE.Vector3();
  
  if (keys.w) moveDir.z -= 1;
  if (keys.s) moveDir.z += 1;
  if (keys.a) moveDir.x -= 1;
  if (keys.d) moveDir.x += 1;
  if (keys.space) moveDir.y += 1;
  if (keys.shift) moveDir.y -= 1;
  
  if (moveDir.length() > 0) {
    moveDir.normalize().multiplyScalar(speed);
    dragon.position.add(moveDir);
    
    // Bank into turns
    const bankAngle = -moveDir.x * 0.3;
    dragon.rotation.z = THREE.MathUtils.lerp(dragon.rotation.z, bankAngle, 0.1);
    
    // Pitch based on vertical movement
    const pitchAngle = moveDir.y * 0.2;
    dragon.rotation.x = THREE.MathUtils.lerp(dragon.rotation.x, pitchAngle, 0.1);
  } else {
    // Return to neutral
    dragon.rotation.z = THREE.MathUtils.lerp(dragon.rotation.z, 0, 0.05);
    dragon.rotation.x = THREE.MathUtils.lerp(dragon.rotation.x, 0, 0.05);
  }
  
  // Keep dragon above ground
  if (dragon.position.y < 3) dragon.position.y = 3;
  if (dragon.position.y > 50) dragon.position.y = 50;
}

function updateEnemies(delta) {
  enemies.forEach(enemy => {
    if (enemy.userData.stunned) return;
    
    // Move towards player
    const target = isRidingDragon ? dragon.position : ninja.position;
    const dir = new THREE.Vector3()
      .subVectors(target, enemy.position)
      .normalize();
    
    const speed = 0.03;
    enemy.position.add(dir.multiplyScalar(speed));
    
    // Face player
    const angle = Math.atan2(dir.x, dir.z);
    enemy.rotation.y = angle;
    
    // Attack player if close
    const dist = enemy.position.distanceTo(ninja.position);
    if (dist < 2 && !isRidingDragon) {
      enemy.userData.attackTimer += delta;
      if (enemy.userData.attackTimer > 1) {
        state.health -= 10;
        updateUI();
        enemy.userData.attackTimer = 0;
        
        // Screen flash
        document.body.style.background = '#ff0000';
        setTimeout(() => document.body.style.background = '', 100);
      }
    }
  });
}

function updateCamera() {
  const target = isRidingDragon ? dragon : ninja;
  
  // Third person follow camera
  const idealOffset = new THREE.Vector3(0, 8, 15);
  if (isRidingDragon) {
    idealOffset.set(0, 10, 25);
  }
  
  const idealPosition = target.position.clone().add(idealOffset);
  camera.position.lerp(idealPosition, 0.05);
  
  const lookAt = target.position.clone();
  lookAt.y += 2;
  camera.lookAt(lookAt);
}

// ============================================
// VR SUPPORT
// ============================================

window.enterVR = async function() {
  if (navigator.xr) {
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });
      renderer.xr.setSession(session);
    } catch (e) {
      console.error('VR session failed:', e);
    }
  }
};

// ============================================
// START GAME
// ============================================

window.startGame = function() {
  document.getElementById('title-screen').style.display = 'none';
  gameStarted = true;
};

// Initialize on load
init();
