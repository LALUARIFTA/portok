import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry,
  BufferAttribute, PointsMaterial, AdditiveBlending, Points,
  TorusGeometry, OctahedronGeometry, IcosahedronGeometry,
  MeshBasicMaterial, Mesh
} from 'three';

export function initThreeJSBackground(selector = '#hero') {
  // Mobile Performance Optimization: Skip 3D rendering on mobile completely
  if (window.innerWidth <= 768) return;

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

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    // OPTIMIZATION: Disable antialias (not needed for tiny particles) and use high-performance
    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // OPTIMIZATION: Cap pixel ratio to 1.5 (down from 2) to save GPU fill rate on retina displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Particles
    const particlesGeometry = new BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new BufferAttribute(posArray, 3));

    // Custom texture for particles
    const material = new PointsMaterial({
      size: 0.15,
      color: 0x9333ea,
      transparent: true,
      opacity: 0.6,
      blending: AdditiveBlending
    });

    const particlesMesh = new Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Floating geometric shapes
    const shapes = [];
    const geometries = [
      new TorusGeometry(2, 0.4, 12, 48),
      new OctahedronGeometry(2, 0),
      new IcosahedronGeometry(2, 0)
    ];

    const shapeMaterial = new MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    for (let i = 0; i < 3; i++) {
      const mesh = new Mesh(geometries[i], shapeMaterial);
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
    }, { passive: true });

    // Animation loop
    const startTime = performance.now();
    let isVisible = true;
    let animationFrameId;

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          animate(); // Resume animation
        } else if (animationFrameId) {
          cancelAnimationFrame(animationFrameId); // OPTIMIZATION: Stop loop completely when off-screen
        }
      });
    }, { threshold: 0 });
    intersectionObserver.observe(container);

    function animate() {
      if (!isVisible) return;

      const elapsedTime = (performance.now() - startTime) / 1000;

      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      shapes.forEach(shape => {
        shape.mesh.rotation.x += shape.rx;
        shape.mesh.rotation.y += shape.ry;
        shape.mesh.position.y += Math.sin(elapsedTime * 1.5 + shape.mesh.position.x) * 0.005;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

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
