// --- UI Toggle ---
const modelBadge = document.getElementById('model-badge');
if (modelBadge) {
    modelBadge.textContent = `${MODEL_NAME} Enabled`;
}

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') {
        uiVisible = !uiVisible;
        const ui = document.getElementById('ui-layer');
        const cam = document.getElementById('cam-preview');
        if (uiVisible) {
            ui.classList.remove('ui-hidden');
            cam.classList.remove('ui-hidden');
        } else {
            ui.classList.add('ui-hidden');
            cam.classList.add('ui-hidden');
        }
    }
});

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;
camera.position.y = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- Particle System Setup ---
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const getTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return new THREE.Texture(canvas);
};
const tex = getTexture();
tex.needsUpdate = true;

const material = new THREE.PointsMaterial({
    size: PARTICLE_SIZE,
    map: tex,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// --- Animation Loop ---
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    const positionAttribute = geometry.attributes.position;
    const colorAttribute = geometry.attributes.color;

    // Rotation Logic
    let rotationSpeed = 0.001;
    if (handDetected) {
        // Interactive rotation
        rotationSpeed = (handPosition.x - 0.5) * 0.05;
        particles.rotation.y += rotationSpeed;
        particles.rotation.x += (handPosition.y - 0.5) * 0.05;
    } else {
        // Idle rotation
        particles.rotation.y += 0.002;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3; const iy = i * 3 + 1; const iz = i * 3 + 2;
        let tx = targetPositions[ix]; let ty = targetPositions[iy]; let tz = targetPositions[iz];
        let px = positions[ix]; let py = positions[iy]; let pz = positions[iz];

        if (mode === 'fireworks') {
            if (isPinching && handDetected) {
                // Gravity Well
                const hx = (1 - handPosition.x - 0.5) * 15;
                const hy = -(handPosition.y - 0.5) * 10;
                const hz = 0;
                velocities[ix] += (hx - px) * 0.005; velocities[iy] += (hy - py) * 0.005; velocities[iz] += (hz - pz) * 0.005;
                velocities[ix] *= 0.90; velocities[iy] *= 0.90; velocities[iz] *= 0.90;
            } else {
                // Explode
                velocities[ix] += (Math.random() - 0.5) * 0.02; velocities[iy] += (Math.random() - 0.5) * 0.02; velocities[iz] += (Math.random() - 0.5) * 0.02;
                velocities[iy] -= 0.002;
                if (Math.abs(px) > 20 || Math.abs(py) > 20 || Math.abs(pz) > 20) {
                    px = 0; py = 0; pz = 0;
                    velocities[ix] = (Math.random() - 0.5) * 0.5; velocities[iy] = (Math.random() - 0.5) * 0.5; velocities[iz] = (Math.random() - 0.5) * 0.5;
                }
            }
            px += velocities[ix]; py += velocities[iy]; pz += velocities[iz];

        } else {
            // Global Shockwave Physics
            px += velocities[ix];
            py += velocities[iy];
            pz += velocities[iz];
            velocities[ix] *= 0.92; velocities[iy] *= 0.92; velocities[iz] *= 0.92;

            // Shape Morphing
            const noiseAmplitude = 0.05;
            const nx = Math.sin(time + px) * noiseAmplitude;
            const ny = Math.cos(time + py) * noiseAmplitude;
            const nz = Math.sin(time + pz) * noiseAmplitude;

            let targetX = tx + nx; let targetY = ty + ny; let targetZ = tz + nz;

            if (handDetected) {
                const hx = (1 - handPosition.x - 0.5) * 12;
                const hy = -(handPosition.y - 0.5) * 8;
                const hz = 2;
                const dx = px - hx; const dy = py - hy; const dz = pz - hz;
                const distSq = dx * dx + dy * dy + dz * dz;

                if (isPinching) {
                    if (distSq < 20) { targetX = hx; targetY = hy; targetZ = hz; }
                } else {
                    if (distSq < 5) {
                        const force = (5 - distSq) * 0.5;
                        targetX += (dx / Math.sqrt(distSq)) * force; targetY += (dy / Math.sqrt(distSq)) * force; targetZ += (dz / Math.sqrt(distSq)) * force;
                    }
                }
            }
            px += (targetX - px) * TRANSITION_SPEED;
            py += (targetY - py) * TRANSITION_SPEED;
            pz += (targetZ - pz) * TRANSITION_SPEED;
        }
        positions[ix] = px; positions[iy] = py; positions[iz] = pz;
    }
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
