(() => {
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function canUseWebGL() {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch {
      return false;
    }
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function init() {
    const mount = document.querySelector("[data-hero-3d]");
    if (!mount) return;

    if (!canUseWebGL() || typeof THREE === "undefined") {
      mount.setAttribute("data-3d", "off");
      return;
    }

    mount.setAttribute("data-3d", "on");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);

    const dpr = clamp(window.devicePixelRatio || 1, 1, 1.75);
    renderer.setPixelRatio(dpr);

    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0.8, 6.8);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0x8b5cf6, 1.1);
    key.position.set(4, 3, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x0ea5e9, 1.0);
    rim.position.set(-5, 1, -2);
    scene.add(rim);

    const sphereGeo = new THREE.IcosahedronGeometry(1.55, 5);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.22,
      roughness: 0.14,
      metalness: 0.35,
      transparent: true,
      opacity: 0.86,
      transmission: 0.52,
      thickness: 1.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08
    });

    const core = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(core);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(sphereGeo),
      new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.42 })
    );
    wire.scale.setScalar(1.02);
    group.add(wire);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.05, 12, 220),
      new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.35 })
    );
    halo.rotation.x = Math.PI / 2.6;
    group.add(halo);

    const grid = new THREE.GridHelper(26, 26, 0x0ea5e9, 0x8b5cf6);
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    grid.position.y = -2.4;
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 18 * Math.random() + 2;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 10;
      starPositions[i * 3 + 0] = Math.cos(theta) * r;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = Math.sin(theta) * r;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    let mouseX = 0;
    let mouseY = 0;
    const onPointer = (e) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseX = nx;
      mouseY = ny;
    };

    mount.addEventListener("pointermove", onPointer, { passive: true });

    function resize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let running = true;
    const onVis = () => {
      running = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVis);

    const clock = new THREE.Clock();

    function animate() {
      if (running) {
        const t = clock.getElapsedTime();

        const targetRotY = mouseX * 0.55;
        const targetRotX = mouseY * 0.25;

        group.rotation.y += (targetRotY - group.rotation.y) * 0.06;
        group.rotation.x += (targetRotX - group.rotation.x) * 0.06;

        core.rotation.y += 0.0035;
        core.rotation.x += 0.002;
        wire.rotation.y -= 0.0028;

        halo.rotation.z = t * 0.35;
        halo.rotation.y = t * 0.12;

        stars.rotation.y = t * 0.02;

        renderer.render(scene, camera);
      }

      if (!prefersReducedMotion) {
        requestAnimationFrame(animate);
      }
    }

    if (!prefersReducedMotion) {
      animate();
    } else {
      renderer.render(scene, camera);
    }

    window.addEventListener(
      "unload",
      () => {
        document.removeEventListener("visibilitychange", onVis);
        ro.disconnect();
        mount.removeEventListener("pointermove", onPointer);

        starGeo.dispose();
        starMat.dispose();
        sphereGeo.dispose();
        sphereMat.dispose();

        renderer.dispose();
      },
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
