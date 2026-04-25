import * as THREE from 'three';

export function initThreeJSBackground(selector = '#hero') {
  const containers = document.querySelectorAll(selector);
  
  containers.forEach(container => {
    if (!container) return;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'three-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0'; // Behind everything but above background color
    canvas.style.pointerEvents = 'none'; // Don't block clicks
    container.insertBefore(canvas, container.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300; // Reduced count for multiple instances
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Custom texture for particles
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x9333ea, // Tailwind purple-600 to match accent
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Floating geometric shapes
    const shapes = [];
    const geometries = [
      new THREE.TorusGeometry(2, 0.4, 12, 48),
      new THREE.OctahedronGeometry(2, 0),
      new THREE.IcosahedronGeometry(2, 0)
    ];
    
    const shapeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    for(let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(geometries[i], shapeMaterial);
      mesh.position.x = (Math.random() - 0.5) * 40;
      mesh.position.y = (Math.random() - 0.5) * 40;
      mesh.position.z = (Math.random() - 0.5) * 20 - 10;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      scene.add(mesh);
      shapes.push({
        mesh,
        rx: (Math.random() - 0.5) * 0.01,
        ry: (Math.random() - 0.5) * 0.01
      });
    }

    // Handle Resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
      const rect = container.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const elapsedTime = clock.getElapsedTime();
        
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;
        
        shapes.forEach(shape => {
          shape.mesh.rotation.x += shape.rx;
          shape.mesh.rotation.y += shape.ry;
          shape.mesh.position.y += Math.sin(elapsedTime * 1.5 + shape.mesh.position.x) * 0.005;
        });

        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    }

    animate();
    
    // Update theme color when theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const isDark = document.body.getAttribute('data-theme') === 'dark';
          const color = isDark ? 0xc084fc : 0x7e22ce;
          material.color.setHex(color);
          shapeMaterial.color.setHex(color);
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Set initial color
    const isDark = document.body.getAttribute('data-theme') === 'dark' || !document.body.hasAttribute('data-theme');
    const color = isDark ? 0xc084fc : 0x7e22ce;
    material.color.setHex(color);
    shapeMaterial.color.setHex(color);
  });
}
