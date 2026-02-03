# First Person Game 🎮

A 3D first-person game built with Three.js that allows you to explore a virtual environment. Now with **full mobile/tablet support** including touch controls!

## Features

- **First-person perspective** with smooth mouse look controls
- **WASD movement** with running (Shift) and jumping (Space)
- **Mobile/Tablet touch controls** with virtual joysticks
- **3D environment** with buildings, trees, and rocks
- **Realistic lighting** with shadows
- **Physics** including gravity and ground collision
- **Real-time stats** showing position, speed, and FPS

## Controls

### Desktop Controls
- **W/A/S/D** - Move forward/left/backward/right
- **Mouse** - Look around (after clicking "Start")
- **Space** - Jump
- **Shift** - Run (move faster)
- **ESC** - Unlock mouse cursor

### Mobile/Tablet Controls (iPad, iPhone, Android)
- **Left Joystick** - Move around in all directions
- **Right Joystick** - Look around (camera control)
- **↑ Button** - Jump
- **⚡ Button** - Run (hold while moving for speed boost)

## How to Play

### On Desktop:
1. Open `index.html` in a web browser
2. Click the "Click to Start" button
3. Use your mouse to look around
4. Use WASD keys to move
5. Press Space to jump
6. Press Shift while moving to run
7. Press ESC to unlock your mouse

### On Mobile/Tablet:
1. Open `index.html` in a mobile browser
2. Tap the "Click to Start" button
3. Use the **left virtual joystick** to move
4. Use the **right virtual joystick** to look around
5. Tap the **↑ button** to jump
6. Hold the **⚡ button** while moving to run

## Technical Details

- Built with **Three.js** (3D rendering library)
- Pure vanilla JavaScript
- Responsive design with mobile/tablet support
- Virtual joystick controls for touch devices
- Shadow mapping for realistic lighting
- First-person camera controller
- Collision detection with ground
- Touch event handling for mobile devices

## File Structure

```
/home/user/webapp/
├── index.html    # Main HTML file with UI
├── game.js       # Game logic and Three.js implementation
└── README.md     # This file
```

## Browser Compatibility

Works best in modern browsers that support:
- WebGL
- Pointer Lock API (desktop)
- Touch Events (mobile/tablet)
- ES6 JavaScript

Recommended browsers: 
- **Desktop**: Chrome, Firefox, Edge, Safari (latest versions)
- **Mobile/Tablet**: Safari (iOS/iPadOS), Chrome (Android), Edge (Android)

## Credits

Created with Three.js - https://threejs.org/
