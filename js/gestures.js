// --- MediaPipe Hand Tracking Setup ---
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

        // ==========================================
        // GESTURE RECOGNITION LOGIC
        // ==========================================
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

        // Apply Debouncing
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

        // Pinch UI update
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

// Initialize MediaPipe Hands
const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // Faster performance!
    minDetectionConfidence: 0.75,
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
