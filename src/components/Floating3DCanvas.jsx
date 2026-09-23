import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Floating3DCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 90;

    // 1. Scene, Camera, WebGL Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Realistic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffd700, 1.5, 10);
    pointLight.position.set(-3, 2, 3);
    scene.add(pointLight);

    // 3. Create Floating 3D Objects Group
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    const floatingItems = [];

    // Helper: Create 3D Roasted Coffee Bean
    const createCoffeeBean = (x, y, z, scale = 1) => {
      const beanGroup = new THREE.Group();

      // Ellipsoid body
      const beanGeo = new THREE.SphereGeometry(0.35, 32, 32);
      beanGeo.scale(1.2, 0.75, 0.6);
      
      const beanMat = new THREE.MeshStandardMaterial({
        color: 0x3e2723,
        roughness: 0.25,
        metalness: 0.2,
      });
      const beanMesh = new THREE.Mesh(beanGeo, beanMat);
      beanMesh.castShadow = true;
      beanGroup.add(beanMesh);

      // Center seam groove indent
      const seamGeo = new THREE.TorusGeometry(0.22, 0.03, 12, 24, Math.PI);
      const seamMat = new THREE.MeshBasicMaterial({ color: 0x1b0000 });
      const seamMesh = new THREE.Mesh(seamGeo, seamMat);
      seamMesh.rotation.x = Math.PI / 2;
      seamMesh.rotation.z = Math.PI / 6;
      beanGroup.add(seamMesh);

      beanGroup.position.set(x, y, z);
      beanGroup.scale.set(scale, scale, scale);
      return beanGroup;
    };

    // Helper: Create 3D Crisp Cookie / Biscuit
    const createCookie = (x, y, z, scale = 1) => {
      const cookieGroup = new THREE.Group();

      // Golden biscuit disc
      const cookieGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 32);
      const cookieMat = new THREE.MeshStandardMaterial({
        color: 0xc68a4c,
        roughness: 0.6,
        metalness: 0.1,
      });
      const cookieMesh = new THREE.Mesh(cookieGeo, cookieMat);
      cookieMesh.rotation.x = Math.PI / 3;
      cookieMesh.castShadow = true;
      cookieGroup.add(cookieMesh);

      // Chocolate Chips on Cookie Surface
      const chipMat = new THREE.MeshStandardMaterial({ color: 0x241206, roughness: 0.3 });
      const chipPositions = [
        [-0.15, 0.07, 0.15],
        [0.18, 0.07, -0.1],
        [-0.05, 0.07, -0.2],
        [0.2, 0.07, 0.15],
      ];

      chipPositions.forEach(([cx, cy, cz]) => {
        const chipGeo = new THREE.SphereGeometry(0.06, 12, 12);
        chipGeo.scale(1, 0.4, 1);
        const chipMesh = new THREE.Mesh(chipGeo, chipMat);
        chipMesh.position.set(cx, cy, cz);
        cookieGroup.add(chipMesh);
      });

      cookieGroup.position.set(x, y, z);
      cookieGroup.scale.set(scale, scale, scale);
      return cookieGroup;
    };

    // Helper: Create 3D Creamy Ice Cream Cone
    const createIceCreamCone = (x, y, z, scale = 1) => {
      const iceCreamGroup = new THREE.Group();

      // Waffle Cone
      const coneGeo = new THREE.ConeGeometry(0.32, 0.8, 24);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xd49b4b, roughness: 0.5 });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.rotation.z = Math.PI;
      coneMesh.position.y = -0.3;
      coneMesh.castShadow = true;
      iceCreamGroup.add(coneMesh);

      // Ice Cream Scoop
      const scoopGeo = new THREE.SphereGeometry(0.34, 24, 24);
      const scoopMat = new THREE.MeshStandardMaterial({
        color: 0xfff5e6, // Creamy Vanilla
        roughness: 0.2,
        metalness: 0.05,
      });
      const scoopMesh = new THREE.Mesh(scoopGeo, scoopMat);
      scoopMesh.position.y = 0.18;
      scoopMesh.castShadow = true;
      iceCreamGroup.add(scoopMesh);

      // Strawberry Top Swirl
      const topGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.1 });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 0.42;
      iceCreamGroup.add(topMesh);

      iceCreamGroup.position.set(x, y, z);
      iceCreamGroup.scale.set(scale, scale, scale);
      return iceCreamGroup;
    };

    // 4. Instantiate 3D Treats in Arun Ad Floating Formation
    const cookie1 = createCookie(-2.2, 0.2, 0, 1.1);
    const coffeeBean1 = createCoffeeBean(-0.8, -0.3, 0.4, 1.2);
    const iceCream = createIceCreamCone(0.7, 0.1, 0.2, 1.15);
    const coffeeBean2 = createCoffeeBean(2.1, 0.35, -0.2, 1.0);

    floatingItems.push(
      { mesh: cookie1, speedY: 0.003, speedRotX: 0.008, speedRotY: 0.012, initialY: 0.2 },
      { mesh: coffeeBean1, speedY: 0.004, speedRotX: 0.015, speedRotY: 0.02, initialY: -0.3 },
      { mesh: iceCream, speedY: 0.0025, speedRotX: 0.005, speedRotY: 0.01, initialY: 0.1 },
      { mesh: coffeeBean2, speedY: 0.0035, speedRotX: 0.018, speedRotY: 0.014, initialY: 0.35 }
    );

    floatingItems.forEach(item => floatingGroup.add(item.mesh));

    // 5. Arun Ad Style Physics Floating Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      floatingItems.forEach((item, idx) => {
        // Floating sine wave up and down
        item.mesh.position.y = item.initialY + Math.sin(elapsedTime * 2 + idx * 1.5) * 0.22;
        
        // Continuous 3D tumbling rotation
        item.mesh.rotation.x += item.speedRotX;
        item.mesh.rotation.y += item.speedRotY;
        item.mesh.rotation.z += item.speedRotX * 0.5;
      });

      // Subtle group tilt
      floatingGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-[210px] h-[75px] relative shrink-0 select-none pointer-events-auto overflow-hidden"
      title="Interactive 3D Floating Café Treats (Three.js WebGL)"
    />
  );
}
