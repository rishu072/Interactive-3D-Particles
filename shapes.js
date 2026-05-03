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
