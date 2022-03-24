// ----------------------------------
// BOILERPLATE CODE
// ----------------------------------

// set up scene
const scene = new THREE.Scene();

// set up renderer
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer. domElement);

// set up camera
const camera = new THREE.PerspectiveCamera(
   75, // FOV
   window.innerWidth / window.innerHeight, // aspect ratio
   0.1, // near plane
   100 // far plane
);

// ----------------------------------
// ENVIRONMENT SETUP
// ----------------------------------

// set camera offset
// camera offset is the distance the camera will remain rate at
// while following the player
const cameraOffset = {x: 0, y: 3, z: 8};
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);

// set up lighting
// ambient lights the entire scene evenly
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

// directional is a normal light source
const directionalLight = new THREE.DirectionalLight(0xfffaaa, 0.5);
directionalLight.position.set(150, 150, 150);
directionalLight.castShadow = true;
scene.add(directionalLight);

/*
set up shadows (make sure to enable shadows for all meshes)
default camera parameters:
   left & bottom: -5
   right & top: 5
   near: 0.5
   far: 500
default map resolution: 512 x 512
the larger the camera area or map resolution,
the more expensive it is to process
*/
const shadowCamArea = 25;
const shadowCamRes = 1500;
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   directionalLight.shadow.camera.left = -shadowCamArea;
   directionalLight.shadow.camera.right = shadowCamArea;
   directionalLight.shadow.camera.top = shadowCamArea;
   directionalLight.shadow.camera.bottom = -shadowCamArea;
   directionalLight.shadow.camera.near = 200;
   directionalLight.shadow.camera.far = 300;
   directionalLight.shadow.camera.updateProjectionMatrix();
   directionalLight.shadow.mapSize =
      new THREE.Vector2(shadowCamRes, shadowCamRes);

// set up fog
scene.fog = new THREE.Fog(
   0xFFFFFF, // color
   0, // near
   80 // far
);

// load textures
const textureLoader = new THREE.TextureLoader();
const grass = textureLoader.load('./textures/grass.png');
   grass.wrapS = THREE.RepeatWrapping;
   grass.wrapT = THREE.RepeatWrapping;
   grass.repeat.set(2, 2);
/* test or unused textures
const testTile = textureLoader.load('./textures/testTile.jpg');
   testTile.wrapS = THREE.RepeatWrapping;
   testTile.wrapT = THREE.RepeatWrapping;
   testTile.repeat.set( 4, 4 );
const testTileNormal = textureLoader.load('./textures/testTileNormal.jpg');
   testTileNormal.wrapS = THREE.RepeatWrapping;
   testTileNormal.wrapT = THREE.RepeatWrapping;
   testTileNormal.repeat.set( 4, 4 );
const bumpNormal = textureLoader.load('./textures/bumpNormal.jpg');
   bumpNormal.wrapS = THREE.RepeatWrapping;
   bumpNormal.wrapT = THREE.RepeatWrapping;
   bumpNormal.repeat.set( 4, 4 );
*/

// ----------------------------------
// SCENE MODELS
// ----------------------------------

// TODO - add flower, grass, clouds, animals, and wind

// ground
const groundArea = 30;
const ground = new THREE.Mesh(
   // new THREE.PlaneBufferGeometry(groundWidth, groundHeight),
   new THREE.CircleGeometry(groundArea, 100),
   new THREE.MeshLambertMaterial({
      map: grass // grass texture for ground
      // color: 0x42aa50
   })
);
ground.rotation.x = -(Math.PI / 2);
ground.receiveShadow = true;
scene.add(ground);

// ocean
const ocean = new THREE.Mesh(
   // new THREE.PlaneBufferGeometry(groundArea * 4, groundArea * 4),
   new THREE.CircleGeometry(groundArea * 2, 100),
   new THREE.MeshLambertMaterial({
      // map: grass // grass texture for ground
      color: 0x555eff
   })
);
ocean.rotation.x = -(Math.PI / 2);
ocean.position.y -= 0.1;
ocean.receiveShadow = true;
scene.add(ocean);

// 'praise the sun!'
const sun = new THREE.Mesh(
   new THREE.SphereGeometry(2, 10, 10),
   new THREE.MeshBasicMaterial({color: 0xffee00})
);
sun.position.set(15, 15, 15);
scene.add(sun);

// trees
// TODO - make the spawning area look less square
ENVIRONMENT.generateForest(
   100, // amount
   0.5, 1.5, // minimum and maximum size
   -20, 20 // minimum and maximum position
);

// rocks
// TODO - make the spawning area look less square
ENVIRONMENT.generateRockArea(
   150, // amount
   [0x555555, 0xaaaaaa, 0xcccccc, 0xAAAAAA], // possible colors
   0.05, 0.2, // minimum and maximum size
   -20, 20 // minimum and maximum position
);

// player
// TODO - add outline around player when obscured by objects
const player = new PlayerModel(0.5,
   { // colors
      body: 0x5bbaee,
      eyes: 0x000000
   },
   { // camera offset
      x: cameraOffset.x,
      y: cameraOffset.y,
      z: cameraOffset.z
   }
);
scene.add(player.group);

// camera fall
// TODO - add a start menu and opener with
// three.js and GSAP logos
player.cameraFall(50, 5);


// ----------------------------------
// HELPER MODELS
// ----------------------------------

// grid
const gridHelper = new THREE.GridHelper(100, 100); // size, divisions
gridHelper.position.y = 0.01;
gridHelper.visible = false;
scene.add(gridHelper);

// arrows
const arrowHelper = new ArrowHelperModel(5);
arrowHelper.group.visible = false;
scene.add(arrowHelper.group);

// shadow render camera
const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
shadowHelper.visible = false;
scene.add(shadowHelper);

/*
// ----------------------------------
// TEST MODELS
// ----------------------------------

// l-piece test model
const testModel = new TestModel(2, 0.5);
testModel.tp(0, 2, 0);
scene.add(testModel.group);

// normal-map test model
const testModel2 = new TestModel(1, 1);
testModel2.tp(-4, 1, 0);
scene.add(testModel2.group);

// plane test model
const testModel3 = new TestModel(3, 4, new THREE.MeshStandardMaterial({
   side: THREE.DoubleSide,
   map: testTile,
   normalMap: testTileNormal
}));
testModel3.tp(4, 2, 0);
scene.add(testModel3.group);
*/

// ----------------------------------
// RENDER SCENE
// ----------------------------------

let debugMenu = false;
let running = false;
function init() {
   running = true;
   render();
}

function render() {
   // render loop
   if (running === true) {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
   }
   
   // debugging
   updateDebug();
   
   // revolving light and sun
   // TODO - make sun start at a set position rather than using Date.now()
   const time = Date.now() * 0.00001;
   const x = Math.sin(time) * 200;
   const z = Math.cos(time) * 200;
      directionalLight.position.x = x;
      directionalLight.position.z = z;
      sun.position.x = x / 4;
      sun.position.z = z / 4;
   
   // update player information
   player.update();
}

// begin rendering
init();

// ----------------------------------
// UTILITY FUNCTIONS
// ----------------------------------

// debug menu
function updateDebug() {
   if (debugMenu === true) {
      /* loop version, costly
      let t = ``;
      
      Object.keys(player).forEach((key) => {
         t += `${key}: ${player[key]} <br>`;
         if (typeof player[key] === 'object') {
            Object.keys(player[key]).forEach((key2) => {
               t += `> ${key2}: ${player[key][key2]}`
            })
         }
      });
      */
      
      debug.innerHTML = // t;
      (`
         HELPERS: <br>
         grid: ',' <br>
         axis arrows: '.' <br>
         shadow camera: '/' <br>
         <br>
         PLAYER: <br>
         x-pos: ${player.group.position.x} <br>
         y-pos: ${player.group.position.y} <br>
         z-pos: ${player.group.position.z} <br>
         y-rotation: ${player.group.rotation.y} <br>
         <br>
         CAMERA:  <br>
         cam-x: ${camera.position.x} <br>
         cam-y: ${camera.position.y} <br>
         cam-z: ${camera.position.z} <br>
         <br>
         (cFC - cameraFollowCordinate) <br>
         cFC-x: ${player.cameraFollowCordinate.x} <br>
         cFC-y: ${player.cameraFollowCordinate.y} <br>
         cFC-z: ${player.cameraFollowCordinate.z} <br>
         <br>
         (cTD.f - cameraTweenDuration.follow) <br>
         cTD.f-x: ${player.cameraTweenDuration.follow.x} <br>
         cTD.f-y: ${player.cameraTweenDuration.follow.y} <br>
         cTD.f.z: ${player.cameraTweenDuration.follow.z} <br>
         <br>
         LIGHT: <br>
         directionalLight.position: <br>
         x: ${directionalLight.position.x.toFixed(2)} <br>
         y: ${directionalLight.position.y.toFixed(2)} <br>
         z: ${directionalLight.position.z.toFixed(2)} <br>
         <br>
         SUN: <br>
         x-pos: ${sun.position.x.toFixed(2)} <br>
         y-pos: ${sun.position.y.toFixed(2)} <br>
         z-pos: ${sun.position.z.toFixed(2)} <br>
         <br>
         TREES: <br>
         Amount: ${ENVIRONMENT.trees.length} <br>
         <br>
         ROCKS: <br>
         Amount: ${ENVIRONMENT.rocks.length} <br>
      `);
   }
   
   // move arrowHelper with player when visible
   if (arrowHelper.group.visible === true) {
      arrowHelper.group.position.set(
         player.group.position.x,
         player.group.position.y,
         player.group.position.z
      );
   }
}

function debugToggle() {
   if (debugMenu) {
      debugDiv.style.background = 'rgba(150, 150, 150, 0.8)';
   } else {
      debugDiv.style.background = 'none';
      debug.innerHTML = '';
   }
}

// get random float
function getRandFloat(min, max, dec = 16) {
   if (dec <= 0 || dec > 16) {
      return 0;
   } else if (dec === 16) {
      return (Math.random() * (max - min)) + min;
   } else {
      return parseFloat(((Math.random() * (max - min)) + min).toFixed(dec));
   }
}

// get random interger (max is non-inclusive)
function getRandInt(min, max) {
   return Math.floor((Math.random() * (max - min)) + min);
}

// ----------------------------------
// EVENT LISTENERS
// ----------------------------------

// fix camera on resize
addEventListener('resize', () => {
   camera.aspect = window.innerWidth / window.innerHeight;
   renderer.setSize(window.innerWidth, window.innerHeight);
   camera.updateProjectionMatrix();
});

// movement handlers
addEventListener('keydown', (event) => {
   switch (event.code) {
      // WASD and arrow keys are used for movement, space for jump
      case 'KeyW':
         player.movementFlag.up = true;
         break;
         
      case 'KeyS':
         player.movementFlag.down = true;
         break;
         
      case 'KeyA':
         player.movementFlag.left = true;
         break;
         
      case 'KeyD':
         player.movementFlag.right = true;
         break;
         
      case 'ArrowUp':
         player.movementFlag.up = true;
         break;
         
      case 'ArrowDown':
         player.movementFlag.down = true;
         break;
         
      case 'ArrowLeft':
         player.movementFlag.left = true;
         break;
         
      case 'ArrowRight':
         player.movementFlag.right = true;
         break;
         
      case 'Space':
         player.movementFlag.jump = true;
         break;
         
      case 'ControlRight':
         debugMenu = !debugMenu;
         debugToggle();
         break;
         
      case 'Comma':
         gridHelper.visible = !gridHelper.visible;
         break;
         
      case 'Period':
         arrowHelper.group.visible = !arrowHelper.group.visible;
         break;
         
      case 'Slash':
         shadowHelper.visible = !shadowHelper.visible;
         break;
   }
});
addEventListener('keyup', (event) => {
   switch (event.code) {
      case 'KeyW':
         player.movementFlag.up = false;
         break;
         
      case 'KeyS':
         player.movementFlag.down = false;
         break;
         
      case 'KeyA':
         player.movementFlag.left = false;
         break;
         
      case 'KeyD':
         player.movementFlag.right = false;
         break;
         
      case 'ArrowUp':
         player.movementFlag.up = false;
         break;
         
      case 'ArrowDown':
         player.movementFlag.down = false;
         break;
         
      case 'ArrowLeft':
         player.movementFlag.left = false;
         break;
         
      case 'ArrowRight':
         player.movementFlag.right = false;
         break;
         
      case 'Space':
         player.movementFlag.jump = false;
         break;
   }
});
