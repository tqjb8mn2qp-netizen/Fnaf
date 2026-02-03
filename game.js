// External Nights - First Person Horror Game

// Warning and Loading Screen Management
let warningDismissed = false;
let loadingComplete = false;

// Handle Loading and Warning Screen
document.addEventListener('DOMContentLoaded', function() {
    const warningScreen = document.getElementById('warningScreen');
    const loadingScreen = document.getElementById('loadingScreen');
    const mainMenu = document.getElementById('mainMenu');
    const warningContinueBtn = document.getElementById('warningContinueBtn');
    
    // Show loading screen first
    console.log('Page loaded, showing loading screen');
    loadingScreen.style.display = 'flex';
    warningScreen.style.display = 'none';
    
    // Start simulated loading immediately
    simulateLoading();
    
    // Warning continue button click handler
    if (warningContinueBtn) {
        warningContinueBtn.addEventListener('click', function() {
            console.log('Warning dismissed');
            warningDismissed = true;
            warningScreen.classList.remove('active');
            
            // Fade out and remove warning screen permanently
            setTimeout(() => {
                warningScreen.style.display = 'none';
                warningScreen.remove(); // Remove from DOM completely
                mainMenu.style.display = 'flex';
                
                // Make game canvas and HUD visible
                document.body.classList.add('game-ready');
                
                // Try to play menu music after warning dismissed
                const menuMusic = document.getElementById('menuMusic');
                if (menuMusic) {
                    menuMusic.play().catch(err => {
                        console.log('Menu music blocked, will play on interaction');
                    });
                }
            }, 500);
        });
        
        // Also add touch event for better mobile support
        warningContinueBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            if (!warningDismissed) {
                warningContinueBtn.click();
            }
        });
    }
});

// Simulate loading progress
function simulateLoading() {
    const loadingBar = document.getElementById('loadingBar');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingScreen = document.getElementById('loadingScreen');
    const warningScreen = document.getElementById('warningScreen');
    
    let progress = 0;
    
    const interval = setInterval(() => {
        // Slower progress: Random between 2-6% (was 3-15%)
        progress += Math.random() * 4 + 2;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Update final progress
            if (loadingBar) loadingBar.style.width = progress + '%';
            if (loadingProgress) loadingProgress.textContent = Math.floor(progress) + '%';
            
            // Loading complete - show warning screen after a pause
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    warningScreen.style.display = 'flex';
                    warningScreen.classList.add('active');
                    loadingComplete = true;
                }, 500);
            }, 1000); // Increased pause at 100%
        } else {
            // Update progress display
            if (loadingBar) loadingBar.style.width = progress + '%';
            if (loadingProgress) loadingProgress.textContent = Math.floor(progress) + '%';
        }
    }, 250); // Slower interval: 250ms (was 150ms)
}

// Game State
let gameState = {
    playing: false,
    paused: false,
    night: 1,
    time: 0, // 0-360 (0 = 12 AM, 360 = 6 AM)
    timeSpeed: 2.0, // Game minutes per real second (EASIER: Time passes 4x faster!)
    dead: false,
    won: false
};

// Three.js Core
let scene, camera, renderer;
let clock = new THREE.Clock();

// Player
let player = {
    height: 1.7,
    speed: 0.12, // EASIER: Faster movement
    sprintSpeed: 0.22, // EASIER: Much faster sprint
    crouchSpeed: 0.06, // EASIER: Faster crouch
    crouchHeight: 1.0,
    isCrouching: false,
    isSprinting: false,
    velocity: new THREE.Vector3(),
    canMove: true,
    hiding: false,
    noiseLevel: 0, // 0-100, higher = more noticeable to enemies
    mesh: null, // Player character mesh
    position: new THREE.Vector3(0, 0, 0) // Player actual position
};

// Camera (First-person)
let cameraRotation = { yaw: 0, pitch: 0 }; // First-person rotation

// Controls
let keys = {};
let mouse = { locked: false };
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;

// Mobile Controls
let isMobile = false;
let touchControls = {
    move: { x: 0, y: 0, active: false, touchId: null },
    look: { x: 0, y: 0, active: false, touchId: null }
};

// Flashlight
let flashlight = {
    on: false,
    battery: 100,
    drainRate: 0.5, // % per second when on (EASIER: 4x slower drain!)
    intensity: 4, // Much brighter flashlight
    distance: 40, // Much longer range
    angle: Math.PI / 4, // Much wider beam
    light: null
};

// Environment
let rooms = [];
let doors = [];
let hidingSpots = [];
let interactables = [];
let collisionWalls = []; // For wall collision detection
let fnafMapModel = null; // The loaded FNAF map GLB model

// Animatronics (Enemies)
let animatronics = [];

// Raycaster for interactions
let raycaster = new THREE.Raycaster();
raycaster.far = 3;

// Play menu click sound effect
function playMenuClickSound() {
    const clickSound = document.getElementById('menuClickSound');
    if (clickSound) {
        // Reset to start if already playing
        clickSound.currentTime = 0;
        clickSound.volume = 0.5; // Set volume to 50%
        clickSound.play().catch(err => {
            console.log('Click sound play failed:', err);
        });
    }
}

// Initialize Game
function init() {
    // Detect mobile device
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    
    if (isMobile) {
        document.getElementById('mobileInstructions').style.display = 'block';
        document.getElementById('desktopInstructions').style.display = 'none';
    }

    // Scene with nighttime atmosphere
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black night sky
    scene.fog = new THREE.Fog(0x000011, 10, 60); // Less dense fog for better visibility

    // Camera (First-person)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, player.height, 0);

    // Create player character mesh (visible in third-person)
    createPlayerCharacter();

    // Renderer - Optimized for performance
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('gameCanvas'),
        antialias: false, // Disable antialiasing for better performance
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio for performance
    renderer.shadowMap.enabled = true; // Enable shadows for nighttime
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Nighttime lighting - increased visibility
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5); // Brighter ambient for visibility
    scene.add(ambientLight);

    // Moonlight (stronger for better visibility)
    const moonLight = new THREE.DirectionalLight(0x8888cc, 0.6);
    moonLight.position.set(50, 100, 50);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    scene.add(moonLight);

    // Flashlight (essential for nighttime navigation)
    flashlight.light = new THREE.SpotLight(0xffffaa, flashlight.intensity, flashlight.distance, flashlight.angle, 0.5, 2);
    flashlight.light.position.copy(camera.position);
    flashlight.light.target.position.set(0, 0, -1);
    flashlight.light.castShadow = true;
    scene.add(flashlight.light);
    scene.add(flashlight.light.target);

    // Load the new FNAF Help Wanted map
    loadNewFNAFMap();
    
    // Note: Night time exploration with new map model

    // Event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('wheel', onMouseWheel);
    window.addEventListener('resize', onWindowResize);

    // Button event listeners (works better on iPad than onclick)
    const startButton = document.getElementById('startGameButton');
    if (startButton) {
        console.log('Start button found, adding listeners');
        startButton.addEventListener('click', function(e) {
            console.log('Start button clicked! Showing mode selection...');
            e.preventDefault();
            e.stopPropagation();
            
            // Play menu click sound
            playMenuClickSound();
            
            // Show mode selection instead of starting game
            console.log('Calling showModeSelection()');
            showModeSelection();
        });
        startButton.addEventListener('touchend', function(e) {
            console.log('Start button touched! Showing mode selection...');
            e.preventDefault();
            e.stopPropagation();
            
            // Play menu click sound
            playMenuClickSound();
            
            // Show mode selection instead of starting game
            console.log('Calling showModeSelection()');
            showModeSelection();
        });
    } else {
        console.error('Start button not found!');
    }
    
    // Solo mode button
    const soloModeButton = document.getElementById('soloModeButton');
    if (soloModeButton) {
        soloModeButton.addEventListener('click', function() {
            playMenuClickSound();
            document.getElementById('modeSelection').style.display = 'none';
            startGame();
        });
    }
    
    // Multiplayer mode button (disabled - coming soon, no sound)
    const multiplayerModeButton = document.getElementById('multiplayerModeButton');
    if (multiplayerModeButton) {
        multiplayerModeButton.addEventListener('click', function() {
            alert('Multiplayer Mode - Coming Soon!\n\nStay tuned for updates!');
        });
    }
    
    // Return button (no sound - just goes back)
    const returnButton = document.getElementById('returnButton');
    if (returnButton) {
        returnButton.addEventListener('click', function() {
            document.getElementById('modeSelection').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'flex';
        });
    }
    
    // Other menu buttons (placeholders - no sound)
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            alert('Settings - Coming Soon!');
        });
    }
    
    const creditsButton = document.getElementById('creditsButton');
    if (creditsButton) {
        creditsButton.addEventListener('click', () => {
            alert('Credits:\nGame by: Your Name\nInspired by Five Nights at Freddy\'s\nBuilt with Three.js');
        });
    }
    
    const storeButton = document.getElementById('storeButton');
    if (storeButton) {
        storeButton.addEventListener('click', () => {
            alert('Store - Coming Soon!');
        });
    }
    
    const achievementsButton = document.getElementById('achievementsButton');
    if (achievementsButton) {
        achievementsButton.addEventListener('click', () => {
            alert('Achievements - Coming Soon!');
        });
    }

    const restartButtons = document.querySelectorAll('#gameOver .menu-button, #victory .menu-button');
    restartButtons.forEach(btn => {
        if (btn.textContent.includes('TRY AGAIN') || btn.textContent.includes('NEXT NIGHT')) {
            btn.addEventListener('click', restartGame);
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                restartGame();
            });
        }
    });

    // Mobile touch controls
    if (isMobile) {
        initMobileControls();
    }

    console.log('Game initialized! isMobile:', isMobile);

    // Start menu music immediately
    const menuMusic = document.getElementById('menuMusic');
    if (menuMusic) {
        menuMusic.volume = 0.3; // Set volume to 30%
        
        // Try to play immediately
        const playPromise = menuMusic.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Menu music started automatically');
                })
                .catch(err => {
                    console.log('Autoplay blocked. Music will start on first user interaction.');
                    
                    // Add one-time click/touch listener to start music on any user interaction
                    const startMusicOnInteraction = () => {
                        menuMusic.play()
                            .then(() => console.log('Menu music started after user interaction'))
                            .catch(e => console.log('Music play failed:', e));
                        
                        // Remove listeners after first successful play
                        document.removeEventListener('click', startMusicOnInteraction);
                        document.removeEventListener('touchstart', startMusicOnInteraction);
                        document.removeEventListener('keydown', startMusicOnInteraction);
                    };
                    
                    document.addEventListener('click', startMusicOnInteraction);
                    document.addEventListener('touchstart', startMusicOnInteraction);
                    document.addEventListener('keydown', startMusicOnInteraction);
                });
        }
    }

    // Start animation loop
    animate();
}

// Load new FNAF Help Wanted map
function loadNewFNAFMap() {
    const loader = new THREE.GLTFLoader();
    
    console.log('Loading FNAF Help Wanted map model...');
    
    loader.load(
        'fnaf_1_hw_map.glb',
        function (gltf) {
            console.log('FNAF HW map loaded successfully!');
            fnafMapModel = gltf.scene;
            
            // Clear collision walls array
            collisionWalls = [];
            
            // Enable shadows and collision for map meshes
            let meshCount = 0;
            fnafMapModel.traverse((child) => {
                if (child.isMesh) {
                    meshCount++;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Add all meshes to collision detection
                    collisionWalls.push(child);
                }
            });
            
            console.log(`Loaded ${meshCount} meshes with collision`);
            
            // Add the map to the scene
            scene.add(fnafMapModel);
            
            console.log('FNAF HW map added to scene!');
        },
        function (xhr) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log('Loading model: ' + percentComplete.toFixed(2) + '% loaded');
        },
        function (error) {
            console.error('Error loading FNAF HW map:', error);
            alert('Failed to load FNAF HW map! Check console for details.');
            // Fallback: create a simple floor
            const floorGeometry = new THREE.PlaneGeometry(100, 100);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.9
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);
        }
    );
}

// OLD MAP LOADING FUNCTIONS - DISABLED
/*
// Load FNAF Map GLB Model
function loadFNAFMap() {
    const loader = new THREE.GLTFLoader();
    
    console.log('Loading FNAF map model...');
    
    loader.load(
        'fnaf_1_map.glb',
        function (gltf) {
            console.log('FNAF map loaded successfully!');
            fnafMapModel = gltf.scene;
            
            // Optimize shadows - only enable for important meshes
            let meshCount = 0;
            fnafMapModel.traverse((child) => {
                if (child.isMesh) {
                    meshCount++;
                    // Only enable shadows on smaller objects (< 100 meshes)
                    if (meshCount < 100) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                    
                    // Optimize materials
                    if (child.material) {
                        child.material.flatShading = true;
                    }
                    
                    // Add collision for walls/objects if needed
                    if (child.name.toLowerCase().includes('wall') || 
                        child.name.toLowerCase().includes('collision')) {
                        collisionWalls.push(child);
                    }
                }
            });
            
            console.log(`Optimized ${meshCount} meshes`);
            
            // Add the map to the scene
            scene.add(fnafMapModel);
            
            console.log('Map added to scene. Creating game elements...');
            
            // Now create doors, hiding spots, and animatronics
            createDoors();
            createHidingSpots();
            createAnimatronics();
            
            console.log('Game setup complete!');
        },
        function (xhr) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log('Loading model: ' + percentComplete.toFixed(2) + '% loaded');
        },
        function (error) {
            console.error('Error loading FNAF map:', error);
            alert('Failed to load FNAF map! Check console for details.');
            // Fallback: create basic environment
            createEnvironment();
            createDoors();
            createHidingSpots();
            createAnimatronics();
        }
    );
}

function createEnvironment() {
    // Load FNAF 1 Map GLB Model
    const loader = new THREE.GLTFLoader();
    
    console.log('Loading FNAF 1 map model...');
    
    loader.load(
        'fnaf_1_map.glb',
        function (gltf) {
            console.log('FNAF 1 map loaded successfully!');
            const model = gltf.scene;
            
            // Enable shadows for all meshes in the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Add walls to collision detection
                    collisionWalls.push(child);
                }
            });
            
            // Add the model to the scene
            scene.add(model);
            
            // Optional: Scale or position the model if needed
            // model.scale.set(1, 1, 1);
            // model.position.set(0, 0, 0);
            
            console.log('FNAF 1 map added to scene with collision detection');
        },
        function (xhr) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
            console.log(`Loading FNAF 1 map: ${percent}% loaded`);
        },
        function (error) {
            console.error('Error loading FNAF 1 map:', error);
            console.log('Creating fallback basic floor...');
            
            // Fallback: Create a simple floor if GLB fails to load
            const floorGeometry = new THREE.PlaneGeometry(60, 60);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                roughness: 0.9,
                metalness: 0.1
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);
        }
    );
}
*/

// END OF DISABLED MAP LOADING FUNCTIONS

/*
// OLD MAP CREATION FUNCTIONS - COMMENTED OUT BECAUSE WE NOW LOAD GLB MODEL
// These functions are kept here for reference but are no longer used

function createCheckeredFloor() {
    // Create checkered pattern on floor
    const tileSize = 2;
    const tiles = 30;
    
    for (let x = -tiles/2; x < tiles/2; x++) {
        for (let z = -tiles/2; z < tiles/2; z++) {
            const isWhite = (x + z) % 2 === 0;
            const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
            const tileMaterial = new THREE.MeshStandardMaterial({
                color: isWhite ? 0x4a4a4a : 0x1a1a1a,
                roughness: 0.9,
                metalness: 0.1
            });
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(x * tileSize, 0.01, z * tileSize);
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }
}

function createFNAFOffice() {
    // Office is 8x8 centered at origin
    const wallHeight = 3;
    const wallThickness = 0.2;
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });

    // Back wall (South)
    createWall(0, wallHeight/2, -4, 8, wallHeight, wallThickness, wallMaterial);
    
    // Left wall (with doorway)
    createWall(-4, wallHeight/2, -2, wallThickness, wallHeight, 4, wallMaterial);
    createWall(-4, wallHeight/2, 2, wallThickness, wallHeight, 4, wallMaterial);
    
    // Right wall (with doorway)
    createWall(4, wallHeight/2, -2, wallThickness, wallHeight, 4, wallMaterial);
    createWall(4, wallHeight/2, 2, wallThickness, wallHeight, 4, wallMaterial);
    
    // Front partial walls
    createWall(-2.5, wallHeight/2, 4, 3, wallHeight, wallThickness, wallMaterial);
    createWall(2.5, wallHeight/2, 4, 3, wallHeight, wallThickness, wallMaterial);
}

function createLeftHallway() {
    const wallHeight = 3;
    const wallThickness = 0.2;
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });

    // Left hallway from office
    createWall(-8, wallHeight/2, 0, wallThickness, wallHeight, 10, wallMaterial);
    createWall(-12, wallHeight/2, 0, wallThickness, wallHeight, 10, wallMaterial);
    createWall(-10, wallHeight/2, 5, 4, wallHeight, wallThickness, wallMaterial);
    createWall(-10, wallHeight/2, -5, 4, wallHeight, wallThickness, wallMaterial);
}

function createRightHallway() {
    const wallHeight = 3;
    const wallThickness = 0.2;
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });

    // Right hallway from office
    createWall(8, wallHeight/2, 0, wallThickness, wallHeight, 10, wallMaterial);
    createWall(12, wallHeight/2, 0, wallThickness, wallHeight, 10, wallMaterial);
    createWall(10, wallHeight/2, 5, 4, wallHeight, wallThickness, wallMaterial);
    createWall(10, wallHeight/2, -5, 4, wallHeight, wallThickness, wallMaterial);
}

function createMainHallway() {
    const wallHeight = 3;
    const wallThickness = 0.2;
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });

    // Main hallway going forward from office
    createWall(-3, wallHeight/2, 12, wallThickness, wallHeight, 16, wallMaterial);
    createWall(3, wallHeight/2, 12, wallThickness, wallHeight, 16, wallMaterial);
    createWall(0, wallHeight/2, 20, 6, wallHeight, wallThickness, wallMaterial);
}

function createSideRooms() {
    const wallHeight = 3;
    const wallThickness = 0.2;
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });

    // Left side room
    createRoom(-18, 0, 8, 8, 'Supply Closet');
    
    // Right side room
    createRoom(18, 0, 8, 8, 'Parts & Service');
    
    // Back rooms
    createRoom(-10, -12, 6, 6, 'Restrooms');
    createRoom(10, -12, 6, 6, 'Kitchen');
}

function addFNAFProps() {
    // Desk in office center (larger, more detailed)
    const deskGeometry = new THREE.BoxGeometry(4, 0.8, 2.5);
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 0.4, -1.5);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);
    collisionWalls.push(desk);

    // Multiple monitors on desk (5 monitors like FNAF)
    const monitorPositions = [
        { x: -1.5, z: -1.5 },
        { x: -0.7, z: -1.5 },
        { x: 0, z: -1.8 }, // Center back
        { x: 0.7, z: -1.5 },
        { x: 1.5, z: -1.5 }
    ];

    monitorPositions.forEach(pos => {
        const monitorGeometry = new THREE.BoxGeometry(0.5, 0.45, 0.08);
        const monitorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a0a0a,
            emissive: 0x222222,
            emissiveIntensity: 0.5
        });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(pos.x, 1.15, pos.z);
        monitor.castShadow = true;
        scene.add(monitor);

        // Screen glow
        const screenGeometry = new THREE.PlaneGeometry(0.4, 0.35);
        const screenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x003333,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(pos.x, 1.15, pos.z + 0.05);
        scene.add(screen);
    });

    // Desk fan (center)
    const fanGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.4, 12);
    const fanMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const fan = new THREE.Mesh(fanGeometry, fanMaterial);
    fan.position.set(0, 1.05, -1);
    fan.castShadow = true;
    scene.add(fan);

    // Cupcake on desk (right side)
    const cupcakeGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.25, 16);
    const cupcakeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff69b4
    });
    const cupcake = new THREE.Mesh(cupcakeGeometry, cupcakeMaterial);
    cupcake.position.set(1.8, 1.05, -1.2);
    cupcake.castShadow = true;
    scene.add(cupcake);

    // Cupcake eyes
    const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(1.75, 1.15, -1);
    scene.add(leftEye);
    const rightEye = leftEye.clone();
    rightEye.position.set(1.85, 1.15, -1);
    scene.add(rightEye);

    // Office chair (right side)
    const chairGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.6, 16);
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0xff1493 }); // Pink like FNAF
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(2.5, 0.3, 1);
    chair.castShadow = true;
    scene.add(chair);

    // CELEBRATE! Poster on back wall
    const posterGeometry = new THREE.PlaneGeometry(2, 1.5);
    const posterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff8800,
        emissive: 0xff4400,
        emissiveIntensity: 0.2
    });
    const poster = new THREE.Mesh(posterGeometry, posterMaterial);
    poster.position.set(0, 2, -3.9);
    scene.add(poster);

    // Add "CELEBRATE!" text effect (using colored plane)
    const textPlane = new THREE.PlaneGeometry(1.8, 0.3);
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const celebrateText = new THREE.Mesh(textPlane, textMaterial);
    celebrateText.position.set(0, 2.5, -3.85);
    scene.add(celebrateText);

    // LEFT DOOR & LIGHT buttons
    addDoorControls(-3.9, 0, 1.5, 'left');
    
    // RIGHT DOOR & LIGHT buttons
    addDoorControls(3.9, 0, 1.5, 'right');

    // Papers on bulletin board (right wall)
    for (let i = 0; i < 6; i++) {
        const paperGeometry = new THREE.PlaneGeometry(0.3, 0.4);
        const paperMaterial = new THREE.MeshStandardMaterial({ 
            color: [0xffffaa, 0xaaffaa, 0xaaaaff, 0xffaaaa][i % 4]
        });
        const paper = new THREE.Mesh(paperGeometry, paperMaterial);
        const row = Math.floor(i / 3);
        const col = i % 3;
        paper.position.set(3.85, 2 - row * 0.5, -2 + col * 0.5);
        paper.rotation.y = -Math.PI / 2;
        scene.add(paper);
    }
}

function addDoorControls(x, y, z, side) {
    // Door button panel background
    const panelGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.6);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(x, z, y);
    panel.castShadow = true;
    scene.add(panel);

    // DOOR button (top)
    const doorButtonGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.25);
    const doorButtonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff3300,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
    });
    const doorButton = new THREE.Mesh(doorButtonGeometry, doorButtonMaterial);
    doorButton.position.set(x, z + 0.35, y);
    scene.add(doorButton);

    // DOOR label
    const doorLabelGeometry = new THREE.PlaneGeometry(0.2, 0.08);
    const doorLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const doorLabel = new THREE.Mesh(doorLabelGeometry, doorLabelMaterial);
    doorLabel.position.set(x + (side === 'left' ? 0.06 : -0.06), z + 0.35, y);
    doorLabel.rotation.y = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
    scene.add(doorLabel);

    // LIGHT button (bottom)
    const lightButtonGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.25);
    const lightButtonMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff8800,
        emissive: 0xff6600,
        emissiveIntensity: 0.3
    });
    const lightButton = new THREE.Mesh(lightButtonGeometry, lightButtonMaterial);
    lightButton.position.set(x, z - 0.35, y);
    scene.add(lightButton);

    // LIGHT label
    const lightLabel = doorLabel.clone();
    lightLabel.position.set(x + (side === 'left' ? 0.06 : -0.06), z - 0.35, y);
    scene.add(lightLabel);
}

// END OF OLD MAP CREATION FUNCTIONS - COMMENTED OUT
*/

function createRoom(x, z, width, depth, name) {
    const wallHeight = 3;
    const wallThickness = 0.2;
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });

    const room = { name, x, z, width, depth, walls: [] };

    // North wall
    const northWall = createWall(x, wallHeight/2, z + depth/2, width, wallHeight, wallThickness, wallMaterial);
    room.walls.push(northWall);

    // South wall  
    const southWall = createWall(x, wallHeight/2, z - depth/2, width, wallHeight, wallThickness, wallMaterial);
    room.walls.push(southWall);

    // East wall
    const eastWall = createWall(x + width/2, wallHeight/2, z, wallThickness, wallHeight, depth, wallMaterial);
    room.walls.push(eastWall);

    // West wall
    const westWall = createWall(x - width/2, wallHeight/2, z, wallThickness, wallHeight, depth, wallMaterial);
    room.walls.push(westWall);

    rooms.push(room);
}

function createHallway(x, z, width, depth, name) {
    createRoom(x, z, width, depth, name);
}

function createWall(x, y, z, width, height, depth, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    
    // Add to collision array
    collisionWalls.push(wall);
    
    return wall;
}

function createDoors() {
    // Left door (office to left hallway)
    createDoor(-4, 0, 'Left Door');
    
    // Right door (office to right hallway)
    createDoor(4, 0, 'Right Door');
    
    // Main hallway doors
    createDoor(-3, 8, 'Left Hallway Door');
    createDoor(3, 8, 'Right Hallway Door');
}

function createDoor(x, z, name) {
    const doorGeometry = new THREE.BoxGeometry(0.2, 2.5, 1.5);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a2a1a,
        roughness: 0.7
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(x, 1.25, z);
    door.castShadow = true;
    door.receiveShadow = true;
    scene.add(door);

    const doorObj = {
        name,
        mesh: door,
        closed: false,
        locked: false,
        position: new THREE.Vector3(x, 1.25, z)
    };

    doors.push(doorObj);
    interactables.push(doorObj);
}

function createHidingSpots() {
    // Locker in storage
    const lockerGeometry = new THREE.BoxGeometry(1, 2, 0.8);
    const lockerMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 });
    const locker = new THREE.Mesh(lockerGeometry, lockerMaterial);
    locker.position.set(-5, 1, 15);
    locker.castShadow = true;
    locker.receiveShadow = true;
    scene.add(locker);

    hidingSpots.push({
        name: 'Storage Locker',
        mesh: locker,
        position: new THREE.Vector3(-5, 1, 15),
        hidePosition: new THREE.Vector3(-5, player.height, 14.5)
    });
    interactables.push(hidingSpots[hidingSpots.length - 1]);

    // Under desk in office
    hidingSpots.push({
        name: 'Under Desk',
        mesh: null,
        position: new THREE.Vector3(0, 0.4, 0),
        hidePosition: new THREE.Vector3(0, 0.5, 0.2)
    });
    interactables.push(hidingSpots[hidingSpots.length - 1]);
}

function createPlayerCharacter() {
    // Create player character (simple humanoid)
    const playerGroup = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.0, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2255ff,
        roughness: 0.7,
        metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    playerGroup.add(body);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 1.55;
    head.castShadow = true;
    playerGroup.add(head);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.4, 0.8, 0);
    leftArm.castShadow = true;
    playerGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.4, 0.8, 0);
    rightArm.castShadow = true;
    playerGroup.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.15, 0.15, 0);
    leftLeg.castShadow = true;
    playerGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.15, 0.15, 0);
    rightLeg.castShadow = true;
    playerGroup.add(rightLeg);
    
    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);
    
    player.mesh = playerGroup;
    player.position.copy(playerGroup.position);
}

// ANIMATRONICS DISABLED - No enemies in the game
/*
function createAnimatronics() {
    // Create 3 animatronics
    const animatronicNames = ['Unit-A', 'Unit-B', 'Unit-C'];
    const startPositions = [
        new THREE.Vector3(18, 1, 0),    // Security room
        new THREE.Vector3(-3, 1, 16),   // Storage
        new THREE.Vector3(-15, 1, 4)    // Break room
    ];

    animatronicNames.forEach((name, index) => {
        const geometry = new THREE.BoxGeometry(0.8, 1.8, 0.6);
        const material = new THREE.MeshStandardMaterial({
            color: index === 0 ? 0x4a4a4a : (index === 1 ? 0x6a4a3a : 0x3a4a5a),
            roughness: 0.6,
            metalness: 0.4,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(startPositions[index]);
        mesh.castShadow = true;
        scene.add(mesh);

        // Add glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 0.3, 0.35);
        mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 0.3, 0.35);
        mesh.add(rightEye);

        const animatronic = {
            name,
            mesh,
            position: startPositions[index].clone(),
            speed: 0.01 + (index * 0.005) * gameState.night, // EASIER: Half speed!
            aggressive: 0.3 + (index * 0.2), // EASIER: Much less aggressive!
            moveTimer: Math.random() * 10, // EASIER: Longer idle time
            moveDelay: 8 + Math.random() * 10, // EASIER: Much longer delays!
            target: null,
            state: 'idle', // idle, moving, hunting, attacking
            canSeePlayer: false,
            lastKnownPlayerPos: null
        };

        animatronics.push(animatronic);
    });
}
*/

// Input Handlers
function onKeyDown(event) {
    keys[event.code] = true;

    if (event.code === 'Escape') {
        if (gameState.playing) {
            togglePause();
        }
    }

    if (!gameState.playing) return;

    if (event.code === 'KeyF') {
        toggleFlashlight();
    }

    if (event.code === 'KeyE') {
        interact();
    }

    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        player.isSprinting = true;
    }

    if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        player.isCrouching = true;
    }
}

function onKeyUp(event) {
    keys[event.code] = false;

    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        player.isSprinting = false;
    }

    if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        player.isCrouching = false;
    }
}

// Mobile Controls Functions
function initMobileControls() {
    const moveJoystick = document.getElementById('moveJoystick');
    const lookJoystick = document.getElementById('lookJoystick');
    const flashlightButton = document.getElementById('flashlightButton');
    const interactButton = document.getElementById('interactButton');
    const sprintButton = document.getElementById('sprintButton');

    // Movement Joystick
    moveJoystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchControls.move.touchId = touch.identifier;
        touchControls.move.active = true;
        updateJoystick(touch, moveJoystick, 'move');
    });

    moveJoystick.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = Array.from(e.touches).find(t => t.identifier === touchControls.move.touchId);
        if (touch && touchControls.move.active) {
            updateJoystick(touch, moveJoystick, 'move');
        }
    });

    moveJoystick.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.move.active = false;
        touchControls.move.x = 0;
        touchControls.move.y = 0;
        resetJoystick('moveStick');
    });

    // Look Joystick
    lookJoystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchControls.look.touchId = touch.identifier;
        touchControls.look.active = true;
        updateJoystick(touch, lookJoystick, 'look');
    });

    lookJoystick.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = Array.from(e.touches).find(t => t.identifier === touchControls.look.touchId);
        if (touch && touchControls.look.active) {
            updateJoystick(touch, lookJoystick, 'look');
        }
    });

    lookJoystick.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchControls.look.active = false;
        touchControls.look.x = 0;
        touchControls.look.y = 0;
        resetJoystick('lookStick');
    });

    // Flashlight Button
    flashlightButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleFlashlight();
        flashlightButton.style.background = 'rgba(255, 255, 0, 0.6)';
    });

    flashlightButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        flashlightButton.style.background = 'rgba(255, 0, 0, 0.3)';
    });

    // Interact Button
    interactButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        interact();
        interactButton.style.background = 'rgba(0, 255, 0, 0.6)';
    });

    interactButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        interactButton.style.background = 'rgba(255, 0, 0, 0.3)';
    });

    // Sprint Button
    sprintButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        player.isSprinting = true;
        sprintButton.style.background = 'rgba(255, 255, 0, 0.6)';
    });

    sprintButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        player.isSprinting = false;
        sprintButton.style.background = 'rgba(255, 0, 0, 0.3)';
    });
}

function updateJoystick(touch, joystickElement, type) {
    const rect = joystickElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2;
    
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;
    
    if (distance > maxDistance) {
        normalizedX = (deltaX / distance);
        normalizedY = (deltaY / distance);
    }
    
    touchControls[type].x = normalizedX;
    touchControls[type].y = normalizedY;
    
    // Update visual position
    const stickId = type === 'move' ? 'moveStick' : 'lookStick';
    const stick = document.getElementById(stickId);
    const moveX = Math.min(normalizedX * maxDistance, maxDistance);
    const moveY = Math.min(normalizedY * maxDistance, maxDistance);
    stick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
}

function resetJoystick(stickId) {
    const stick = document.getElementById(stickId);
    stick.style.transform = 'translate(-50%, -50%)';
}

function onMouseMove(event) {
    if (!mouse.locked || !gameState.playing) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // First-person: Rotate camera directly
    cameraRotation.yaw -= movementX * 0.002; // Horizontal rotation
    cameraRotation.pitch -= movementY * 0.002; // Vertical rotation
    
    // Clamp vertical angle to prevent flipping
    cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.pitch));
}

function onMouseWheel(event) {
    // First-person mode doesn't need zoom
    // You can add zoom functionality here if needed later
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Game Control Functions
function showModeSelection() {
    console.log('showModeSelection() called');
    console.log('Hiding main menu...');
    document.getElementById('mainMenu').style.display = 'none';
    console.log('Showing mode selection...');
    document.getElementById('modeSelection').style.display = 'flex';
    console.log('Mode selection should now be visible');
}

function startGame() {
    console.log('Start button clicked!');
    
    // Stop menu music
    const menuMusic = document.getElementById('menuMusic');
    if (menuMusic) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }
    
    // Make sure player mesh exists
    if (!player.mesh) {
        console.error('Player mesh not created yet!');
        createPlayerCharacter();
    }
    
    document.getElementById('mainMenu').style.display = 'none';
    
    // For desktop, lock pointer; for mobile, show controls
    if (!isMobile) {
        document.body.requestPointerLock();
    } else {
        document.getElementById('mobileControls').classList.add('active');
    }
    
    mouse.locked = true;
    gameState.playing = true;
    gameState.time = 0;
    gameState.dead = false;
    gameState.won = false;
    
    // Reset player (spawn at your chosen position)
    player.position.set(0.1, 0.5, 1.0);  // Your exact position from screenshot
    if (player.mesh) {
        player.mesh.position.copy(player.position);
        player.mesh.rotation.y = 0;  // Face forward
        player.mesh.visible = false; // Hide in first-person
    }
    
    // Reset camera rotation 
    cameraRotation.yaw = 0;  // Face forward
    cameraRotation.pitch = 0;
    
    flashlight.battery = 100;
    player.hiding = false;
    player.canMove = true;  // Make sure player can move!
    
    console.log('Game started! Player position:', player.position);
    
    // Reset animatronics - DISABLED (no enemies)
    /*
    animatronics.forEach((anim, index) => {
        const startPositions = [
            new THREE.Vector3(18, 1, 0),
            new THREE.Vector3(-3, 1, 16),
            new THREE.Vector3(-15, 1, 4)
        ];
        if (anim.mesh && startPositions[index]) {
            anim.mesh.position.copy(startPositions[index]);
            anim.position.copy(startPositions[index]);
            anim.state = 'idle';
        }
    });
    */
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

function nextNight() {
    gameState.night++;
    document.getElementById('night').textContent = `Night ${gameState.night}`;
    document.getElementById('victory').style.display = 'none';
    
    // Make enemies faster and more aggressive - DISABLED (no enemies)
    /*
    animatronics.forEach((anim, index) => {
        anim.speed = 0.02 + (index * 0.01) * gameState.night;
        anim.aggressive = 1 + (index * 0.5) * gameState.night;
    });
    */
    
    startGame();
}

function returnToMenu() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    
    // Restart menu music
    const menuMusic = document.getElementById('menuMusic');
    if (menuMusic) {
        menuMusic.currentTime = 0;
        menuMusic.play().catch(err => console.log('Menu music play failed:', err));
    }
    
    gameState.playing = false;
    gameState.night = 1;
    document.exitPointerLock();
    mouse.locked = false;
}

function togglePause() {
    gameState.paused = !gameState.paused;
    if (gameState.paused) {
        document.exitPointerLock();
        mouse.locked = false;
    } else {
        document.body.requestPointerLock();
        mouse.locked = true;
    }
}

function toggleFlashlight() {
    if (flashlight.battery <= 0) return;
    
    flashlight.on = !flashlight.on;
    flashlight.light.intensity = flashlight.on ? flashlight.intensity : 0;
    
    // Turning on flashlight makes noise
    if (flashlight.on) {
        player.noiseLevel += 10;
    }
}

function interact() {
    console.log('Interact pressed! Checking for nearby objects...');
    
    // Check for nearby interactables using player position
    for (let interactable of interactables) {
        const distance = player.position.distanceTo(interactable.position);
        console.log(`Distance to ${interactable.name}: ${distance.toFixed(2)}`);
        
        if (distance < 3) {
            console.log(`Interacting with: ${interactable.name}`);
            
            // Check if it's a door
            if (doors.includes(interactable)) {
                toggleDoor(interactable);
                return;
            }
            // Check if it's a hiding spot
            else if (hidingSpots.includes(interactable)) {
                toggleHiding(interactable);
                return;
            }
        }
    }
    
    console.log('No interactable objects nearby');
}

function toggleDoor(door) {
    door.closed = !door.closed;
    
    if (door.closed) {
        door.mesh.material.color.setHex(0x8B4513);
        showMessage(`${door.name} closed`);
    } else {
        door.mesh.material.color.setHex(0x3a2a1a);
        showMessage(`${door.name} opened`);
    }
    
    player.noiseLevel += 15;
}

function toggleHiding(spot) {
    player.hiding = !player.hiding;
    
    if (player.hiding) {
        player.position.copy(spot.hidePosition);
        if (player.mesh) {
            player.mesh.position.copy(player.position);
        }
        player.canMove = false;
        showMessage(`Hiding in ${spot.name}. Press E to leave.`);
    } else {
        player.canMove = true;
        showMessage(`Left ${spot.name}`);
    }
}

function showMessage(text, duration = 2000) {
    const interaction = document.getElementById('interaction');
    interaction.textContent = text;
    interaction.style.display = 'block';
    
    setTimeout(() => {
        interaction.style.display = 'none';
    }, duration);
}

function showWarning(text) {
    const warning = document.getElementById('warning');
    warning.textContent = text;
    warning.style.display = 'block';
    
    setTimeout(() => {
        warning.style.display = 'none';
    }, 3000);
}

// Update Functions
function updatePlayer(delta) {
    if (!player.canMove || player.hiding) return;

    const moveSpeed = player.isCrouching ? player.crouchSpeed : 
                     (player.isSprinting ? player.sprintSpeed : player.speed);
    
    const direction = new THREE.Vector3();
    
    // Desktop controls
    if (keys['KeyW']) direction.z -= 1;
    if (keys['KeyS']) direction.z += 1;
    if (keys['KeyA']) direction.x -= 1;
    if (keys['KeyD']) direction.x += 1;

    // Mobile controls - movement joystick
    if (isMobile && touchControls.move.active) {
        direction.x += touchControls.move.x;
        direction.z += touchControls.move.y;
    }

    if (direction.length() > 0) {
        direction.normalize();
        
        // First-person: Movement is relative to camera yaw (horizontal rotation only)
        const cameraQuat = new THREE.Quaternion();
        cameraQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.yaw);
        direction.applyQuaternion(cameraQuat);
        direction.y = 0;
        direction.normalize();

        // Calculate new position
        const newPosition = new THREE.Vector3(
            player.position.x + direction.x * moveSpeed,
            player.position.y,
            player.position.z + direction.z * moveSpeed
        );

        // Check for collision before moving (DISABLED for free navigation)
        if (true) { // Collision disabled - walk freely
            // No collision - safe to move!
            player.position.copy(newPosition);
            
            // In first-person, player mesh faces where camera looks
            if (player.mesh) {
                player.mesh.rotation.y = cameraRotation.yaw;
            }
        }

        // Update noise level based on movement
        if (player.isSprinting) {
            player.noiseLevel += 5 * delta;
        } else if (player.isCrouching) {
            player.noiseLevel += 0.5 * delta;
        } else {
            player.noiseLevel += 2 * delta;
        }
    }

    // Mobile controls - look joystick (rotate camera)
    if (isMobile && touchControls.look.active) {
        cameraRotation.yaw -= touchControls.look.x * 0.05;
        cameraRotation.pitch -= touchControls.look.y * 0.05;
        cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.pitch));
    }

    // Decay noise level over time
    player.noiseLevel = Math.max(0, player.noiseLevel - 10 * delta);

    // Keep player in bounds
    player.position.x = Math.clamp(player.position.x, -24, 24);
    player.position.z = Math.clamp(player.position.z, -24, 24);

    // Update player mesh position (hide in first-person)
    if (player.mesh) {
        player.mesh.position.copy(player.position);
        player.mesh.visible = false; // Hide player mesh in first-person view
    }

    // Update camera position (First-person)
    updateCamera();

    // Check for nearby interactables
    checkNearbyInteractables();
    
    // Update position debug display
    const posDebug = document.getElementById('positionDebug');
    if (posDebug) {
        posDebug.textContent = `Position: (${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)})`;
    }
}

function updateCamera() {
    // First-person: Camera is at player's eye level
    const eyeHeight = player.isCrouching ? player.crouchHeight : player.height;
    camera.position.set(player.position.x, player.position.y + eyeHeight, player.position.z);
    
    // Apply rotation (yaw and pitch)
    camera.rotation.order = 'YXZ';
    camera.rotation.y = cameraRotation.yaw;
    camera.rotation.x = cameraRotation.pitch;

    // Update flashlight to point where camera is looking
    if (flashlight.on) {
        flashlight.light.position.copy(camera.position);
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        flashlight.light.target.position.copy(camera.position).add(direction.multiplyScalar(5));
    }
}

function checkCollision(newPosition) {
    // Create a bounding box for the player at the new position
    const playerRadius = 0.4; // Player collision radius
    const playerBox = new THREE.Box3(
        new THREE.Vector3(newPosition.x - playerRadius, 0, newPosition.z - playerRadius),
        new THREE.Vector3(newPosition.x + playerRadius, player.height, newPosition.z + playerRadius)
    );

    // Check collision with all walls
    for (let wall of collisionWalls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (playerBox.intersectsBox(wallBox)) {
            return true; // Collision detected!
        }
    }

    return false; // No collision
}

function checkNearbyInteractables() {
    let nearbyFound = false;
    
    for (let interactable of interactables) {
        const distance = player.position.distanceTo(interactable.position);
        
        if (distance < 2.5) {
            const name = interactable.name || 'Object';
            document.getElementById('interaction').textContent = `Press E to interact with ${name}`;
            document.getElementById('interaction').style.display = 'block';
            nearbyFound = true;
            break;
        }
    }
    
    if (!nearbyFound) {
        document.getElementById('interaction').style.display = 'none';
    }
}

function updateFlashlight(delta) {
    // Update flashlight position and direction
    flashlight.light.position.copy(camera.position);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    flashlight.light.target.position.copy(camera.position).add(direction);

    // Drain battery
    if (flashlight.on && flashlight.battery > 0) {
        flashlight.battery -= flashlight.drainRate * delta;
        flashlight.battery = Math.max(0, flashlight.battery);
        
        if (flashlight.battery <= 0) {
            flashlight.on = false;
            flashlight.light.intensity = 0;
            showWarning('⚠️ FLASHLIGHT BATTERY DEAD!');
        }
    }

    // Update UI
    document.getElementById('batteryPercent').textContent = Math.floor(flashlight.battery);
    document.getElementById('flashlightFill').style.width = `${flashlight.battery}%`;
    
    // Change color based on battery level
    if (flashlight.battery < 20) {
        document.getElementById('flashlightFill').style.background = 'linear-gradient(90deg, #ff0000, #ff4400)';
    } else if (flashlight.battery < 50) {
        document.getElementById('flashlightFill').style.background = 'linear-gradient(90deg, #ffaa00, #ff6600)';
    } else {
        document.getElementById('flashlightFill').style.background = 'linear-gradient(90deg, #ffff00, #ff8800)';
    }
}

function updateTime(delta) {
    gameState.time += gameState.timeSpeed * delta;
    
    // Convert time to hours (0 = 12 AM, 360 = 6 AM)
    const hour = Math.floor((gameState.time / 60)) % 6;
    const displayHour = hour === 0 ? 12 : hour;
    const period = 'AM';
    
    document.getElementById('time').textContent = `${displayHour} ${period}`;
    
    // Check if survived until 6 AM
    if (gameState.time >= 360) {
        winNight();
    }
}

// ANIMATRONIC FUNCTIONS DISABLED - No enemies in game
/*
function updateAnimatronics(delta) {
    animatronics.forEach(anim => {
        // Update move timer
        anim.moveTimer -= delta;
        
        // Check if can see player
        anim.canSeePlayer = canAnimatronicSeePlayer(anim);
        
        if (anim.canSeePlayer && !player.hiding) {
            anim.state = 'hunting';
            anim.lastKnownPlayerPos = player.position.clone();
        }

        // State machine
        switch(anim.state) {
            case 'idle':
                if (anim.moveTimer <= 0) {
                    anim.state = 'moving';
                    anim.moveTimer = anim.moveDelay;
                }
                break;

            case 'moving':
                // Random patrol movement
                if (!anim.target) {
                    // Pick random position
                    anim.target = new THREE.Vector3(
                        -20 + Math.random() * 40,
                        1,
                        -20 + Math.random() * 40
                    );
                }
                
                moveTowards(anim, anim.target, anim.speed);
                
                if (anim.mesh.position.distanceTo(anim.target) < 1) {
                    anim.target = null;
                    anim.state = 'idle';
                    anim.moveTimer = anim.moveDelay + Math.random() * 3;
                }
                break;

            case 'hunting':
                if (player.hiding) {
                    // Lost track of player
                    anim.state = 'idle';
                    anim.moveTimer = 5; // EASIER: Longer recovery time
                } else if (anim.lastKnownPlayerPos) {
                    moveTowards(anim, anim.lastKnownPlayerPos, anim.speed * 1.2); // EASIER: Only 20% faster when hunting
                    
                    // Check if reached player
                    if (anim.mesh.position.distanceTo(player.position) < 1.5) { // EASIER: Need to be closer to kill
                        killPlayer(anim);
                    }
                    
                    // Check if reached last known position
                    if (anim.mesh.position.distanceTo(anim.lastKnownPlayerPos) < 2) { // EASIER: Give up sooner
                        anim.state = 'idle';
                        anim.moveTimer = 8; // EASIER: Much longer idle after hunting
                    }
                }
                break;
        }

        // Check proximity to player (EASIER: Closer warning distance)
        const distToPlayer = anim.mesh.position.distanceTo(player.position);
        if (distToPlayer < 10 && distToPlayer > 5) { // EASIER: Only warn when they're closer
            showWarning('⚠️ SOMETHING IS NEARBY...');
        }
    });
}

function canAnimatronicSeePlayer(anim) {
    if (player.hiding) return false;
    
    const distToPlayer = anim.mesh.position.distanceTo(player.position);
    
    // Too far to see (EASIER: Reduced detection range)
    if (distToPlayer > 12) return false;
    
    // Can see if player has flashlight on (EASIER: Shorter range)
    if (flashlight.on && distToPlayer < 10) {
        return true;
    }
    
    // Can detect if player makes noise (EASIER: Need more noise and closer)
    if (player.noiseLevel > 60 && distToPlayer < 8) {
        return true;
    }
    
    // Check if player is in front
    const dirToPlayer = new THREE.Vector3()
        .subVectors(player.position, anim.mesh.position)
        .normalize();
    
    const animDir = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(anim.mesh.quaternion);
    
    const dot = animDir.dot(dirToPlayer);
    
    // In field of view and close enough (EASIER: Narrower FOV and closer range)
    if (dot > 0.7 && distToPlayer < 6) {
        return true;
    }
    
    return false;
}

function moveTowards(anim, target, speed) {
    const direction = new THREE.Vector3()
        .subVectors(target, anim.mesh.position)
        .normalize();
    
    anim.mesh.position.add(direction.multiplyScalar(speed));
    
    // Make animatronic look at target
    anim.mesh.lookAt(target);
}

function killPlayer(anim) {
    if (gameState.dead) return;
    
    gameState.dead = true;
    gameState.playing = false;
    
    // Jump scare!
    showJumpScare(anim);
    
    setTimeout(() => {
        document.getElementById('deathMessage').textContent = `${anim.name} got you at ${document.getElementById('time').textContent}`;
        document.getElementById('gameOver').style.display = 'flex';
    }, 2000);
}

function showJumpScare(anim) {
    const jumpScare = document.getElementById('jumpScare');
    const jumpScareText = document.getElementById('jumpScareText');
    jumpScareText.textContent = anim.name.toUpperCase();
    jumpScare.style.display = 'flex';
    
    // Hide after 1.5 seconds
    setTimeout(() => {
        jumpScare.style.display = 'none';
    }, 1500);
}
*/
// END OF DISABLED ANIMATRONIC FUNCTIONS

function winNight() {
    gameState.won = true;
    gameState.playing = false;
    document.getElementById('victory').style.display = 'flex';
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (gameState.playing && !gameState.paused) {
        updatePlayer(delta);
        updateFlashlight(delta);
        updateTime(delta);
        // updateAnimatronics(delta); // DISABLED - No enemies
    }

    renderer.render(scene, camera);
}

// Helper function
Math.clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
};

// Start the game
init();
