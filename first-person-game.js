// Game variables
let scene, camera, renderer;
let player = {
    height: 1.8,
    speed: 0.1,
    runSpeed: 0.2,
    jumpSpeed: 0.3,
    velocity: new THREE.Vector3(),
    canJump: false,
    isRunning: false
};

let keys = {};
let mouse = { x: 0, y: 0, locked: false };
let objects = [];
let gravity = -0.015;
let ground;

// Mobile controls
let isMobile = false;
let touchControls = {
    move: { x: 0, y: 0, active: false, touchId: null },
    look: { x: 0, y: 0, active: false, touchId: null }
};

// Camera rotation
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;

// FPS counter
let frameCount = 0;
let lastTime = performance.now();

// Initialize the game
function init() {
    // Detect mobile device
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    
    if (isMobile) {
        document.getElementById('mobileInstructions').style.display = 'block';
        document.getElementById('desktopControls').style.display = 'none';
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 0, 100);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, player.height, 5);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('gameCanvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        roughness: 0.8,
        metalness: 0.2
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    objects.push(ground);

    // Create some buildings/obstacles
    createBuildings();

    // Create decorative objects
    createTrees();
    createRocks();

    // Event listeners
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.getElementById('startButton').addEventListener('click', lockPointer);

    // Mobile touch controls
    if (isMobile) {
        initMobileControls();
    }

    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();
}

function createBuildings() {
    const buildingPositions = [
        { x: -10, z: -10, w: 4, h: 8, d: 4, color: 0x808080 },
        { x: 15, z: -15, w: 6, h: 12, d: 6, color: 0x606060 },
        { x: -20, z: 10, w: 5, h: 10, d: 5, color: 0x707070 },
        { x: 20, z: 15, w: 4, h: 6, d: 4, color: 0x909090 },
        { x: 0, z: -25, w: 8, h: 15, d: 8, color: 0x505050 },
        { x: 30, z: 0, w: 5, h: 9, d: 5, color: 0x656565 }
    ];

    buildingPositions.forEach(pos => {
        const geometry = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
        const material = new THREE.MeshStandardMaterial({
            color: pos.color,
            roughness: 0.7,
            metalness: 0.3
        });
        const building = new THREE.Mesh(geometry, material);
        building.position.set(pos.x, pos.h / 2, pos.z);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        objects.push(building);

        // Add windows
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const windowGeometry = new THREE.PlaneGeometry(0.3, 0.4);
                const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(
                    pos.x + pos.w / 2 + 0.01,
                    i * (pos.h / 4) + 2,
                    pos.z - pos.d / 3 + j * (pos.d / 3)
                );
                windowMesh.rotation.y = Math.PI / 2;
                scene.add(windowMesh);
            }
        }
    });
}

function createTrees() {
    const treePositions = [
        { x: 8, z: 8 },
        { x: -15, z: 5 },
        { x: 12, z: -5 },
        { x: -8, z: -20 },
        { x: 25, z: 10 }
    ];

    treePositions.forEach(pos => {
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(pos.x, 1.5, pos.z);
        trunk.castShadow = true;
        scene.add(trunk);
        objects.push(trunk);

        // Tree foliage
        const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(pos.x, 4.5, pos.z);
        foliage.castShadow = true;
        scene.add(foliage);
    });
}

function createRocks() {
    const rockPositions = [
        { x: 5, z: 12 },
        { x: -12, z: -8 },
        { x: 18, z: 5 },
        { x: -25, z: 15 }
    ];

    rockPositions.forEach(pos => {
        const geometry = new THREE.DodecahedronGeometry(0.8, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 1,
            metalness: 0
        });
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(pos.x, 0.4, pos.z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        scene.add(rock);
        objects.push(rock);
    });
}

function initMobileControls() {
    const mobileControls = document.getElementById('mobileControls');
    const moveJoystick = document.getElementById('moveJoystick');
    const lookJoystick = document.getElementById('lookJoystick');
    const jumpButton = document.getElementById('jumpButton');
    const runButton = document.getElementById('runButton');

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

    // Jump Button
    jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['Space'] = true;
        jumpButton.style.background = 'rgba(255, 255, 255, 0.5)';
    });

    jumpButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['Space'] = false;
        jumpButton.style.background = 'rgba(255, 255, 255, 0.3)';
    });

    // Run Button
    runButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        player.isRunning = true;
        runButton.style.background = 'rgba(255, 255, 255, 0.5)';
    });

    runButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        player.isRunning = false;
        runButton.style.background = 'rgba(255, 255, 255, 0.3)';
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
        normalizedX = (deltaX / distance) * 1;
        normalizedY = (deltaY / distance) * 1;
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

function lockPointer() {
    if (!isMobile) {
        document.body.requestPointerLock();
    }
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('stats').classList.add('active');
    
    if (isMobile) {
        document.getElementById('mobileControls').classList.add('active');
    }
    
    mouse.locked = true;
}

function onKeyDown(event) {
    keys[event.code] = true;
    
    if (event.code === 'Escape') {
        document.exitPointerLock();
        document.getElementById('instructions').classList.remove('hidden');
        document.getElementById('stats').classList.remove('active');
        mouse.locked = false;
    }

    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        player.isRunning = true;
    }
}

function onKeyUp(event) {
    keys[event.code] = false;
    
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        player.isRunning = false;
    }
}

function onMouseMove(event) {
    if (!mouse.locked) return;

    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;

    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    camera.quaternion.setFromEuler(euler);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updatePlayer() {
    // Apply gravity
    player.velocity.y += gravity;

    // Movement
    const currentSpeed = player.isRunning ? player.runSpeed : player.speed;
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

    // Normalize direction and apply camera rotation
    if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(camera.quaternion);
        direction.y = 0;
        direction.normalize();

        camera.position.x += direction.x * currentSpeed;
        camera.position.z += direction.z * currentSpeed;
    }

    // Mobile controls - look joystick
    if (isMobile && touchControls.look.active) {
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= touchControls.look.x * 0.05;
        euler.x -= touchControls.look.y * 0.05;
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
        camera.quaternion.setFromEuler(euler);
    }

    // Jump
    if (keys['Space'] && player.canJump) {
        player.velocity.y = player.jumpSpeed;
        player.canJump = false;
    }

    // Update vertical position
    camera.position.y += player.velocity.y;

    // Ground collision
    if (camera.position.y <= player.height) {
        camera.position.y = player.height;
        player.velocity.y = 0;
        player.canJump = true;
    }

    // Boundary check
    const boundary = 48;
    camera.position.x = Math.max(-boundary, Math.min(boundary, camera.position.x));
    camera.position.z = Math.max(-boundary, Math.min(boundary, camera.position.z));

    // Update stats
    updateStats();
}

function updateStats() {
    const posX = camera.position.x.toFixed(1);
    const posY = camera.position.y.toFixed(1);
    const posZ = camera.position.z.toFixed(1);
    document.getElementById('position').textContent = `${posX}, ${posY}, ${posZ}`;
    
    const speed = player.velocity.length().toFixed(2);
    document.getElementById('speed').textContent = speed;
}

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
        document.getElementById('fps').textContent = frameCount;
        frameCount = 0;
        lastTime = currentTime;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Always update player if game has started (mobile or desktop)
    if (mouse.locked) {
        updatePlayer();
    }

    updateFPS();
    renderer.render(scene, camera);
}

// Start the game
init();
