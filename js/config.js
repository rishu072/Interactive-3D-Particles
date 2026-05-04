// --- Configuration & Global State ---
const MODEL_NAME = 'GPT-5.1-Codex-Max';
const PARTICLE_COUNT = 8000;
const PARTICLE_SIZE = 0.12;
const TRANSITION_SPEED = 0.04; // Slightly faster for responsiveness

let mode = 'sphere';
let isPinching = false;
let wasPinching = false;
let handPosition = { x: 0, y: 0, z: 0 };
let handDetected = false;
let uiVisible = true;

let targetMode = 'sphere';
let modeHoldFrames = 0;
const MODE_HOLD_THRESHOLD = 15; // Require gesture to be held for 15 frames

// --- Shared Particle Arrays ---
// These arrays hold the 3D data for all particles and are shared across all files
const positions = new Float32Array(PARTICLE_COUNT * 3);
const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);

// Initialize initial random positions
for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    colors[i * 3] = 1;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 1;

    velocities[i * 3] = 0; velocities[i * 3 + 1] = 0; velocities[i * 3 + 2] = 0;
}
