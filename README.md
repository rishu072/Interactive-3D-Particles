# ✨ Gesture Controlled 3D Particles

Welcome to the **Gesture Controlled 3D Particles** project! This is an interactive web-based experience where you control thousands of 3D particles in real-time using nothing but your hands and a webcam.

Built with **Three.js** for stunning 3D graphics and **Google MediaPipe** for lightning-fast AI hand tracking.

---

## 🚀 How to Play

You don't need to install any software to play!

1. Simply open the `index.html` file in any modern web browser (Chrome, Firefox, Edge, Safari).
2. When the browser asks, **allow Camera permissions**. (Your video is processed securely and entirely locally on your machine—nothing is sent to the internet).
3. Step back slightly so the camera can clearly see your hand.
4. **Press 'H'** on your keyboard to toggle the UI instructions and camera preview on or off!

---

## 🎮 The Controls (Hand Signs)

Hold up your hand and form these shapes to magically morph the 3D particles. *(Note: Hold a gesture for half a second to lock it in!)*

| Hand Sign | Particle Shape |
| :--- | :--- |
| **✊ Fist (0 Fingers)** | DNA Helix 🧬 |
| **☝️ 1 Finger (Index)** | Sphere 🔵 |
| **✌️ 2 Fingers (Peace)** | Heart ❤️ |
| **🤟 3 Fingers** | Flower 🌸 |
| **🖐️ 4 Fingers** | Saturn 🪐 |
| **✋ 5 Fingers (Open Hand)** | Fireworks 🎆 |
| **👍 Thumbs Up** | Spiral Galaxy 🌌 |
| **👆+👍 "L" Shape** | Golden Pyramid 🔺 |
| **🤘 Rock On (Index & Pinky)** | Matrix Cube 🧊 |

### 💥 Special Powers

*   **Gravity Well:** Form a **🤏 Pinch** with your thumb and index finger. All particles will be aggressively sucked toward your hand. Move your hand around to drag the particles!
*   **Supernova Shockwave:** While pinching, suddenly **Release the Pinch** (open your hand) to unleash a massive shockwave that blows all the particles away!

---

## 🤫 Secret Hidden Gestures (Easter Eggs)

There are 3 undocumented, secret gestures hidden in the code. Try them out!

*   🕷️ **"Spiderman" (Thumb, Index, Pinky extended):** Summons a massive spinning **Tornado**.
*   🤙 **"Shaka / Call Me" (Thumb & Pinky extended):** Collapses the universe into a dense **Black Hole**.
*   🖕 **Middle Finger (Only Middle extended):** Spawns a working **Solar System** with a central Sun and orbiting planets!

---

## 🛠️ Architecture & Tech Stack

This project is built using modular, vanilla web technologies for maximum performance without the need for complex build tools.

*   **`js/main.js`**: Core Three.js setup, scene rendering, physics, and the animation loop.
*   **`js/gestures.js`**: MediaPipe AI configuration and gesture-recognition math (including debounce logic).
*   **`js/shapes.js`**: The mathematical formulas used to generate every single 3D shape and color palette.
*   **`js/config.js`**: Global configurations (like `PARTICLE_COUNT = 8000`), speeds, and shared physics arrays.

Enjoy shaping the universe with your bare hands! 🌌
