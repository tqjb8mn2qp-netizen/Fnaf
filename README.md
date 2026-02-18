# Shadows of Freddy's 🎮👻

A first-person FNAF-inspired horror survival game built with Three.js and featuring the actual FNAF 1 map model. Survive the night while being hunted by mysterious animatronic entities.

## 🎯 Game Overview

You're trapped in the FNAF 1 location from 12 AM to 6 AM. Three animatronic units (Unit-A, Unit-B, and Unit-C) are hunting you. Use your wits, stealth, and limited resources to survive until dawn.

## ✨ Features

- **First-Person View** - True FPS camera with mouse look controls
- **Authentic FNAF 1 Map** - Full 3D model of the original FNAF location (23MB GLB)
- **Mouse Look Controls** - Move your mouse to look around (like any FPS game)
- **Stealth Mechanics** - Crouch, hide, and manage your noise level
- **Flashlight System** - Limited battery that drains as you use it
- **Intelligent AI** - Animatronics hunt by sight, sound, and proximity
- **Interactive Environment** - Open/close doors, hide in spots
- **Time Progression** - Survive from 12 AM to 6 AM
- **Night System** - Increasing difficulty with each night
- **Jump Scares** - Heart-pounding encounters when caught

## 🎮 Controls

### Movement
- **W/A/S/D** - Move forward/left/backward/right (relative to where you're looking)
- **Mouse** - Look around (move mouse to rotate camera)
- **Click** - Lock mouse cursor for looking around
- **Shift** - Sprint (faster but makes more noise)
- **Ctrl** - Crouch (slower but quieter)

### Actions
- **F** - Toggle flashlight (drains battery)
- **E** - Interact with doors and hiding spots
- **ESC** - Pause game

### Tips
- 🔦 Use flashlight sparingly - battery is limited!
- 🚶 Crouching makes you harder to detect
- 🏃 Sprinting makes loud noise that attracts enemies
- 🚪 Close doors to slow down animatronics
- 🫣 Hide when enemies are near
- 🖱️ Move your mouse to look around (true first-person!)

## 🎭 Gameplay Mechanics

### Animatronics
Three hostile units patrol the facility:
- **Unit-A** (Gray) - Moderate speed, patrols security areas
- **Unit-B** (Brown) - Slow but persistent, guards storage
- **Unit-C** (Blue) - Fast and aggressive, roams break room

### Detection System
Animatronics can detect you through:
- **Sight** - They can see you in their field of view
- **Light** - Using flashlight makes you visible from farther away
- **Sound** - Sprinting, opening doors, and toggling flashlight create noise

### Survival Strategy
1. **Manage Resources** - Conserve flashlight battery
2. **Stay Quiet** - Crouch when enemies are near
3. **Use Hiding Spots** - Under desk or in lockers
4. **Monitor Time** - Track your progress to 6 AM
5. **Learn Patterns** - Enemies have patrol routes

## 🏢 FNAF 1 Map

The game features the authentic FNAF 1 location including:
- **Office** (Starting location)
- **Left & Right Hallways**
- **Show Stage**
- **Dining Area**
- **Kitchen**
- **Backstage**
- **Supply Closet**
- **Restrooms**
- **East & West Halls**
- **Pirate Cove**

All rooms are fully explorable in first-person with mouse look controls!

## 🎬 How to Play

1. Open `index.html` in a modern web browser
2. Click "START NIGHT 1" button
3. Click to lock your mouse cursor
4. Survive from 12 AM to 6 AM
5. Complete nights to increase difficulty

## ⚠️ Warnings

- 🔴 Running out of flashlight battery leaves you in darkness
- 🔴 Animatronics move faster each night
- 🔴 Making too much noise attracts attention
- 🔴 Getting caught results in a jump scare
- 🔴 Hiding doesn't work if they already saw you

## 🛠️ Technical Details

- Built with **Three.js** (r128)
- **GLTFLoader** for 3D model loading
- **First-person camera** with mouse look controls
- Pure vanilla JavaScript
- Real-time 3D rendering with dynamic shadows
- AI pathfinding and state machine
- Dynamic lighting system
- Proximity-based warning system
- Authentic FNAF 1 map (23MB GLB model)

## 📁 File Structure

```
/home/user/webapp/
├── index.html              # Main game HTML with UI
├── game.js                 # Game logic and mechanics
├── fnaf_1_map.glb         # FNAF 1 3D map model (23MB)
├── first-person-game.html  # Previous game (backup)
├── first-person-game.js    # Previous game logic (backup)
└── README.md              # This file
```

## 🌐 Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome (recommended)
- Firefox
- Edge
- Safari (latest versions)

Requires:
- WebGL support
- Pointer Lock API
- ES6 JavaScript

## 🎮 Previous Game

The original first-person exploration game has been backed up as:
- `first-person-game.html`
- `first-person-game.js`

To play the original game, simply rename these files back to `index.html` and `game.js`.

## 🎯 Future Enhancements

Potential features for future updates:
- Security camera system
- More rooms and areas
- Additional animatronic types
- Power system for doors
- Audio cues and sound effects
- Mobile/touch controls
- Save system for night progression

## 🏆 Credits

Inspired by Five Nights at Freddy's by Scott Cawthon
Created with Three.js - https://threejs.org/

---

**Good luck surviving the night!** 👻
