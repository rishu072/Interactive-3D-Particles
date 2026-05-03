// --- Configuration ---
const MODEL_NAME = 'GPT-5.1-Codex-Max';
const PARTICLE_COUNT = 8000;
const PARTICLE_SIZE = 0.12;
const TRANSITION_SPEED = 0.04; // Slightly faster for responsiveness

// --- Global State ---
let mode = 'sphere';
let isPinching = false;
let wasPinching = false;
let handPosition = { x: 0, y: 0, z: 0 };
let handDetected = false;
let uiVisible = true;

let targetMode = 'sphere';
let modeHoldFrames = 0;
const MODE_HOLD_THRESHOLD = 15; // Require gesture to be held for 15 frames

const modelBadge = document.getElementById('model-badge');
if (modelBadge) {
    modelBadge.textContent = `${MODEL_NAME} Enabled`;
}

// --- UI Toggle ---
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

// --- Particle System ---
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    colors[i * 3] = 1;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 1;

    velocities[i * 3] = 0; velocities[i * 3 + 1] = 0; velocities[i * 3 + 2] = 0;
}

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

// --- Shape Generators ---

function setShapeSphere() {
    mode = 'sphere';
    const radius = 3.5;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        targetPositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
        targetPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        targetPositions[i * 3 + 2] = radius * Math.cos(phi);
        // Blue/Cyan
        colors[i * 3] = 0.1; colors[i * 3 + 1] = 0.6 + Math.random() * 0.4; colors[i * 3 + 2] = 1.0;
    }
}

function setShapePyramid() {
    mode = 'pyramid';
    const height = 5.0;
    const baseSize = 4.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Random height level
        const y = Math.random() * height;
        // At this y, the square slice has width w
        const progress = 1 - (y / height);
        const w = baseSize * progress;

        const x = (Math.random() - 0.5) * 2 * w;
        const z = (Math.random() - 0.5) * 2 * w;

        targetPositions[i * 3] = x;
        targetPositions[i * 3 + 1] = y - (height / 2); // Center y
        targetPositions[i * 3 + 2] = z;

        // Gold/Yellow
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; colors[i * 3 + 2] = 0.0;
    }
}

function setShapeGalaxy() {
    mode = 'galaxy';
    const arms = 5;
    const armWidth = 0.8;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const percent = i / PARTICLE_COUNT;
        const r = percent * 6; // Radius
        const spinAngle = r * 2.5;
        const armAngle = (Math.floor(Math.random() * arms) * 2 * Math.PI) / arms;

        const angle = spinAngle + armAngle + (Math.random() - 0.5) * armWidth / r * 5; // Spread

        targetPositions[i * 3] = r * Math.cos(angle);
        targetPositions[i * 3 + 1] = (Math.random() - 0.5) * (0.2 + (r * 0.1)); // Thickness increases with radius
        targetPositions[i * 3 + 2] = r * Math.sin(angle);

        // Purple/Pink/Blue
        colors[i * 3] = 0.5 + Math.random() * 0.5;
        colors[i * 3 + 1] = 0.1;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }
}

function setShapeCube() {
    mode = 'cube';
    const size = 2.0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const face = Math.floor(Math.random() * 6);
        let x, y, z;
        const u = (Math.random() - 0.5) * 2 * size;
        const v = (Math.random() - 0.5) * 2 * size;
        switch (face) {
            case 0: x = size; y = u; z = v; break;
            case 1: x = -size; y = u; z = v; break;
            case 2: y = size; x = u; z = v; break;
            case 3: y = -size; x = u; z = v; break;
            case 4: z = size; x = u; y = v; break;
            case 5: z = -size; x = u; y = v; break;
        }
        targetPositions[i * 3] = x; targetPositions[i * 3 + 1] = y; targetPositions[i * 3 + 2] = z;
        // Matrix Green
        colors[i * 3] = 0.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }
}

function setShapeHelix() {
    mode = 'helix';
    const radius = 1.8; const height = 9.0; const twists = 4.0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const strand = Math.random() > 0.5 ? 0 : Math.PI;
        const t = (i / PARTICLE_COUNT) * Math.PI * 2 * twists;
        const y = ((i / PARTICLE_COUNT) - 0.5) * height;
        targetPositions[i * 3] = radius * Math.cos(t + strand);
        targetPositions[i * 3 + 1] = y;
        targetPositions[i * 3 + 2] = radius * Math.sin(t + strand);
        if (Math.random() > 0.95) {
            targetPositions[i * 3] *= Math.random(); targetPositions[i * 3 + 2] *= Math.random();
        }
        // Orange
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.4 + Math.random() * 0.3; colors[i * 3 + 2] = 0.1;
    }
}

function setShapeHeart() {
    mode = 'heart';
    const scale = 0.15;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let t = Math.random() * Math.PI * 2;
        let r = Math.random();
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        let z = (Math.random() - 0.5) * 5 * r;
        x *= scale * 1.5; y *= scale * 1.5;
        x += (Math.random() - 0.5) * 0.2; y += (Math.random() - 0.5) * 0.2;
        targetPositions[i * 3] = x; targetPositions[i * 3 + 1] = y + 1; targetPositions[i * 3 + 2] = z;
        // Red
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.3 + Math.random() * 0.4;
    }
}

function setShapeFlower() {
    mode = 'flower';
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        const r = 2 + Math.sin(5 * u) * Math.sin(5 * v);
        targetPositions[i * 3] = r * Math.sin(v) * Math.cos(u);
        targetPositions[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
        targetPositions[i * 3 + 2] = r * Math.cos(v) * 0.5;
        const mix = Math.random();
        colors[i * 3] = mix > 0.5 ? 0.8 : 0.2; colors[i * 3 + 1] = mix > 0.5 ? 0.2 : 0.9; colors[i * 3 + 2] = 0.8;
    }
}

function setShapeSaturn() {
    mode = 'saturn';
    const split = Math.floor(PARTICLE_COUNT * 0.7);
    const radius = 2.0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < split) {
            const phi = Math.acos(-1 + (2 * i) / split);
            const theta = Math.sqrt(split * Math.PI) * phi;
            targetPositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
            targetPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            targetPositions[i * 3 + 2] = radius * Math.cos(phi);
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.2;
        } else {
            const angle = Math.random() * Math.PI * 2;
            const dist = 3.5 + Math.random() * 2.0;
            targetPositions[i * 3] = Math.cos(angle) * dist;
            targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
            targetPositions[i * 3 + 2] = Math.sin(angle) * dist;
            const x = targetPositions[i * 3]; const y = targetPositions[i * 3 + 1]; const z = targetPositions[i * 3 + 2];
            const tilt = 0.4;
            targetPositions[i * 3] = x;
            targetPositions[i * 3 + 1] = y * Math.cos(tilt) - z * Math.sin(tilt);
            targetPositions[i * 3 + 2] = y * Math.sin(tilt) + z * Math.cos(tilt);
            colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.9;
        }
    }
}

function setShapeTornado() {
    mode = 'tornado';
    const height = 10.0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const y = (i / PARTICLE_COUNT) * height - (height / 2);
        const radius = 0.5 + (y + height / 2) * 0.4;
        const angle = i * 0.5;
        targetPositions[i * 3] = radius * Math.cos(angle);
        targetPositions[i * 3 + 1] = y;
        targetPositions[i * 3 + 2] = radius * Math.sin(angle);
        // Cyan/Green
        colors[i * 3] = 0.0; colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }
}

function setShapeBlackhole() {
    mode = 'blackhole';
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        // concentrate near center, but not too close (event horizon)
        const dist = 1.5 + Math.pow(Math.random(), 3) * 6.0;
        targetPositions[i * 3] = Math.cos(angle) * dist;
        targetPositions[i * 3 + 1] = (Math.random() - 0.5) * (1.0 / dist); // flatter at edges
        targetPositions[i * 3 + 2] = Math.sin(angle) * dist;
        // Orange/Red/Black
        const heat = Math.max(0, 1.0 - (dist - 1.5) / 3.0);
        colors[i * 3] = heat + 0.2; colors[i * 3 + 1] = heat * 0.5; colors[i * 3 + 2] = heat * 0.1;
    }
}

function setShapeSolarSystem() {
    mode = 'solarsystem';
    const sunCount = 2000;
    const ringCount = Math.floor((PARTICLE_COUNT - sunCount) / 3);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        if (i < sunCount) {
            // Sun
            const phi = Math.acos(-1 + (2 * i) / sunCount);
            const theta = Math.sqrt(sunCount * Math.PI) * phi;
            const r = 1.8;
            targetPositions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
            targetPositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            targetPositions[i * 3 + 2] = r * Math.cos(phi);
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.6 + Math.random() * 0.4; colors[i * 3 + 2] = 0.0;
        } else {
            // Planets
            const pIdx = i - sunCount;
            const ringNum = Math.floor(pIdx / ringCount);
            const dist = 4.0 + ringNum * 3.0; 
            const angle = Math.random() * Math.PI * 2;
            
            targetPositions[i * 3] = Math.cos(angle) * dist;
            targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
            targetPositions[i * 3 + 2] = Math.sin(angle) * dist;
            
            if (ringNum === 0) { colors[i * 3] = 0.1; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 1.0; } // Earth
            else if (ringNum === 1) { colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.1; } // Mars
            else { colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0; } // Neptune
        }
    }
}

function triggerShockwave() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3; const iy = i * 3 + 1; const iz = i * 3 + 2;
        const px = positions[ix]; const py = positions[iy]; const pz = positions[iz];
        const dist = Math.sqrt(px*px + py*py + pz*pz) || 1;
        const force = 3.5; 
        velocities[ix] += (px / dist) * force * (Math.random() * 0.5 + 0.5);
        velocities[iy] += (py / dist) * force * (Math.random() * 0.5 + 0.5);
        velocities[iz] += (pz / dist) * force * (Math.random() * 0.5 + 0.5);
    }
}

function setModeFireworks() {
    mode = 'fireworks';
    document.getElementById('current-mode').textContent = "Mode: Fireworks";
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        colors[i * 3] = Math.random(); colors[i * 3 + 1] = Math.random(); colors[i * 3 + 2] = Math.random();
    }
}

setShapeSphere();

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

// --- MediaPipe Hand Tracking ---
const videoElement = document.getElementById('input-video');
const previewElement = document.getElementById('cam-preview');
const loadingElement = document.getElementById('loading');
const modeLabel = document.getElementById('current-mode');

function onResults(results) {
    loadingElement.style.display = 'none';
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handDetected = true;
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Increased smoothing for less jitter
        handPosition.x = handPosition.x * 0.95 + indexTip.x * 0.05;
        handPosition.y = handPosition.y * 0.95 + indexTip.y * 0.05;
        handPosition.z = indexTip.z;

        const distance = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
        
        wasPinching = isPinching;
        isPinching = distance < 0.05;
        
        // Trigger Power Explosion on release
        if (wasPinching && !isPinching) {
            triggerShockwave();
        }

        // Finger Analysis
        const isFingerUp = (tipIdx, pipIdx) => landmarks[tipIdx].y < landmarks[pipIdx].y;

        const indexUp = isFingerUp(8, 6);
        const middleUp = isFingerUp(12, 10);
        const ringUp = isFingerUp(16, 14);
        const pinkyUp = isFingerUp(20, 18);
        
        // Better thumb detection: Measure distance from wrist instead of Y-axis
        const thumbDist = Math.hypot(landmarks[4].x - landmarks[0].x, landmarks[4].y - landmarks[0].y);
        const indexBaseDist = Math.hypot(landmarks[5].x - landmarks[0].x, landmarks[5].y - landmarks[0].y);
        const thumbUp = thumbDist > indexBaseDist * 1.2; 

        const fingerCount = [indexUp, middleUp, ringUp, pinkyUp, thumbUp].filter(Boolean).length;

        // Gesture Logic with Debouncing
        let detectedMode = mode;
        
        // HIDDEN GESTURE 1: "Spiderman" (Thumb, Index, Pinky up)
        if (thumbUp && indexUp && pinkyUp && !middleUp && !ringUp) {
            detectedMode = 'tornado';
        }
        // HIDDEN GESTURE 2: "Shaka" / Call Me (Thumb, Pinky up)
        else if (thumbUp && pinkyUp && !indexUp && !middleUp && !ringUp) {
            detectedMode = 'blackhole';
        }
        // HIDDEN GESTURE 3: "Middle Finger" -> Solar System
        else if (!indexUp && middleUp && !ringUp && !pinkyUp) {
            detectedMode = 'solarsystem';
        }
        else if (indexUp && pinkyUp && !middleUp && !ringUp && !thumbUp) {
            detectedMode = 'cube';
        }
        else if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
            detectedMode = 'galaxy'; // Thumbs Up
        }
        else if (indexUp && thumbUp && !middleUp && !ringUp && !pinkyUp) {
            detectedMode = 'pyramid'; // "L" Shape
        }
        else if (fingerCount === 0) {
            detectedMode = 'helix';
        }
        else if (fingerCount === 1 && !thumbUp) { 
            detectedMode = 'sphere';
        }
        else if (fingerCount === 2) {
            detectedMode = 'heart';
        }
        else if (fingerCount === 3) {
            detectedMode = 'flower';
        }
        else if (fingerCount === 4) {
            detectedMode = 'saturn';
        }
        else if (fingerCount === 5) {
            detectedMode = 'fireworks';
        }

        if (detectedMode === targetMode) {
            modeHoldFrames++;
            if (modeHoldFrames >= MODE_HOLD_THRESHOLD && mode !== targetMode) {
                if (targetMode === 'cube') { setShapeCube(); modeLabel.textContent = "Mode: Cube"; }
                else if (targetMode === 'galaxy') { setShapeGalaxy(); modeLabel.textContent = "Mode: Spiral Galaxy"; }
                else if (targetMode === 'pyramid') { setShapePyramid(); modeLabel.textContent = "Mode: Pyramid"; }
                else if (targetMode === 'helix') { setShapeHelix(); modeLabel.textContent = "Mode: DNA Helix"; }
                else if (targetMode === 'sphere') { setShapeSphere(); modeLabel.textContent = "Mode: Sphere"; }
                else if (targetMode === 'heart') { setShapeHeart(); modeLabel.textContent = "Mode: Heart"; }
                else if (targetMode === 'flower') { setShapeFlower(); modeLabel.textContent = "Mode: Flower"; }
                else if (targetMode === 'saturn') { setShapeSaturn(); modeLabel.textContent = "Mode: Saturn"; }
                else if (targetMode === 'tornado') { setShapeTornado(); modeLabel.textContent = "Mode: Tornado (Secret!)"; }
                else if (targetMode === 'blackhole') { setShapeBlackhole(); modeLabel.textContent = "Mode: Black Hole (Secret!)"; }
                else if (targetMode === 'solarsystem') { setShapeSolarSystem(); modeLabel.textContent = "Mode: Solar System (Secret!)"; }
                else if (targetMode === 'fireworks') { setModeFireworks(); modeLabel.textContent = "Mode: Fireworks"; }
            }
        } else {
            targetMode = detectedMode;
            modeHoldFrames = 0; // Reset counter if gesture changes
        }

        if (isPinching) {
            if (!modeLabel.textContent.includes("(Pinching)")) {
                modeLabel.textContent += " (Pinching)";
            }
        } else {
            modeLabel.textContent = modeLabel.textContent.replace(" (Pinching)", "");
        }

    } else {
        handDetected = false;
    }
}

const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // Faster performance!
    minDetectionConfidence: 0.75, // Improved Confidence
    minTrackingConfidence: 0.75
});

hands.onResults(onResults);

const cameraUtils = new Camera(videoElement, {
    onFrame: async () => { await hands.send({ image: videoElement }); },
    width: 640, height: 480
});

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    videoElement.srcObject = stream;
    previewElement.srcObject = stream;
    cameraUtils.start();
}).catch(err => {
    console.error("Camera error:", err);
    loadingElement.innerHTML = "Error accessing camera.<br>Please allow permissions and refresh.";
});
