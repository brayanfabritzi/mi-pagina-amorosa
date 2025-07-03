import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// === CÁMARA Y ESCENA ===
const camera = new THREE.PerspectiveCamera(
  35, // Aumenté el campo de visión
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 11;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true // Mejor calidad
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// === LUCES MEJORADAS ===
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

// Añadir luz adicional para mejor visibilidad
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-500, 500, 500);
scene.add(fillLight);

// === VARIABLES DEL MODELO ===
let bee;
let mixer;
let currentSection = null;
let isAnimating = false;

// === POSICIONES POR SECCIÓN MEJORADAS ===
const sectionConfigs = {
  'banner': {
    position: { x: 0, y: -1.5, z: 0 },
    rotation: { x: 0, y: 1.5, z: 0 },
    camera: { z: 10, fov: 35 }
  },
  'intro': {
    position: { x: 1, y: -1, z: -5 },
    rotation: { x: 0.5, y: -0.5, z: 0 },
    camera: { z: 15, fov: 45 }
  },
  'description': {
    position: { x: -1, y: -1, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 },
    camera: { z: 13, fov: 40 }
  },
  'contact': {
    position: { x: 0.8, y: -3, z: 0 },
    rotation: { x: 0.3, y: -0.5, z: 0 },
    camera: { z: 15, fov: 35 }
  }
};

// === CARGAR MODELO ===
const loader = new GLTFLoader();
loader.load('ghost_boy.glb',
  (gltf) => {
    bee = gltf.scene;
    bee.scale.set(0.8, 0.8, 0.8); // Escala ajustable
    scene.add(bee);

    mixer = new THREE.AnimationMixer(bee);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();

    // Configuración inicial
    updateModelPosition('banner');
    setupScroll();
  },
  undefined,
  (error) => {
    console.error('Error al cargar el modelo:', error);
  }
);

// === ANIMACIÓN A SECCIÓN ===
const updateModelPosition = (sectionId) => {
  if (!bee || isAnimating || !sectionConfigs[sectionId]) return;

  currentSection = sectionId;
  isAnimating = true;

  const config = sectionConfigs[sectionId];

  // Animación del modelo
  gsap.to(bee.position, {
    x: config.position.x,
    y: config.position.y,
    z: config.position.z,
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => { isAnimating = false; }
  });

  gsap.to(bee.rotation, {
    x: config.rotation.x,
    y: config.rotation.y,
    z: config.rotation.z,
    duration: 1.2,
    ease: 'power2.inOut'
  });

  // Animación de cámara
  gsap.to(camera.position, {
    z: config.camera.z,
    duration: 1.2,
    ease: 'power2.inOut'
  });

  gsap.to(camera, {
    fov: config.camera.fov,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: () => camera.updateProjectionMatrix()
  });
};

// === DETECCIÓN DE SCROLL MEJORADA ===
const setupScroll = () => {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Detección inicial
  updateActiveSection();
};

const updateActiveSection = () => {
  if (!bee || isAnimating) return;

  const sections = document.querySelectorAll('.section');
  const viewportHeight = window.innerHeight;
  const scrollPosition = window.scrollY + (viewportHeight / 2);

  let activeSection = null;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionBottom = sectionTop + rect.height;

    if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
      activeSection = section.id;
    }
  });

  if (activeSection && activeSection !== currentSection) {
    updateModelPosition(activeSection);
  }
};

// === RENDER LOOP MEJORADO ===
const animate = () => {
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(0.016); // 60fps
  }

  renderer.render(scene, camera);
};
animate();

// === AJUSTES AL REDIMENSIONAR ===
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);
