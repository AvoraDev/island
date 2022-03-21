// ----------------------------------
// BOILERPLATE CODE
// ----------------------------------

// set up scene
const scene = new THREE.Scene();

// set up renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0); // background (color, alpha)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer. domElement);

// set up camera
const camera = new THREE.PerspectiveCamera(
   75, // FOV
   window.innerWidth / window.innerHeight, // aspect ratio
   0.1, // near plane
   100 // far plane
);

// set up texture loader
const textureLoader = new THREE.TextureLoader();

// textures
const testTile = textureLoader.load('./textures/testTile.jpg');
const testTileNormal = textureLoader.load('./textures/testTileNormal.jpg');

// ----------------------------------
// ENVIRONMERNT SETUP
// ----------------------------------

// set camera offset
const cameraOffset = {x: 0, y: 1, z: 5}; // {x: 0, y: 2, z: 10};
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z); // change location of the camera

// set up lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xf7f7f7, 0.5, 100, 2);
dirLight.position.set(2, 0, 2);
dirLight.castShadows = true;
scene.add(dirLight);

const helper = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add(helper);

// ----------------------------------
// MAIN MODELS
// ----------------------------------

// floor plane
const mapWidth = 80;
const mapHeight = 80;

const plane = new THREE.Mesh(
   new THREE.PlaneBufferGeometry(mapWidth, mapHeight),
   new THREE.MeshStandardMaterial({color: 0x00ff00})
);
plane.rotation.x = -(Math.PI / 2);
plane.recieveShadow = true;
scene.add(plane);

// player model
const player = new PlayerModel(0.5, {
   cameraOffset: {
      x: cameraOffset.x,
      y: cameraOffset.y,
      z: cameraOffset.z
   }
});
scene.add(player.group);

// tree models
// parameters for generateForest: amount, minSize, maxSize, minPos, maxPos
ENVIRONMENT.generateForest(50, 0.5, 1.5, -25, 25);

/* (uncomment for debugging)
// ----------------------------------
// HELPER MODELS
// ----------------------------------

// debuug menu
const debug = document.querySelector('#debug');

// grid
const gridHelper = new THREE.GridHelper(50, 50); // size, divisions
scene.add(gridHelper);

// arrows
const arrowHelper = new ArrowHelperModel();
scene.add(arrowHelper.group);

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

// test model manipulation (c + p this into the render function to use)
   // debugging
   updateDebug();
	
	// rotate test l-piece
   testModel.spin('x', 0.01);
   testModel.spin('y', 0.01);
   testModel.spin('z', 0.01);
   
   // rotate test cube
   testModel2.spin('y', 0.01);
   
   // rotate test plane
   testModel3.spin('x', 0.01);
*/

// ----------------------------------
// RENDER LOOP
// ----------------------------------

let running = true;
function render() {
   // render loop
	requestAnimationFrame(render);
	renderer.render(scene, camera);
   
   // update player information
   player.update();
   
   // movement handler
   Object.keys(player.movementFlag).forEach((key) => {
      if (player.movementFlag[key]) {
         player.movementHandler(key);
      }
   });
   
   // collision detection (WORK ON)
}

// begin rendering
render();

// ----------------------------------
// UTILITY FUNCTIONS
// ----------------------------------

// remove trees (KeyU; WIP)
// function removeForest() {
//    for (let i = 0; i < trees.length; i++)  {
//       scene.remove(`t${i}`);
//       trees.splice(i, 1);
//    }
// }

// debug menu
function updateDebug() {
	debug.innerHTML = (`
	   x-pos: ${player.group.position.x} <br>
	   y-pos: ${player.group.position.y} <br>
	   z-pos: ${player.group.position.z} <br>
	   y-rotation: ${player.group.rotation.y} <br>
	   <br>
	   cam-x: ${camera.position.x} <br>
	   cam-y: ${camera.position.y} <br>
	   cam-z: ${camera.position.z} <br>
	   <br>
	   cFC-x: ${player.cameraFollowCordinate.x} <br>
	   cFC-y: ${player.cameraFollowCordinate.y} <br>
	   cFC-z: ${player.cameraFollowCordinate.z} <br>
	`);
}

// get random number
function getRandFloat(min, max) {
  return (Math.random() * (max - min)) + min;
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
         
      case 'Space':
         player.movementFlag.jump = true;
         break;
         
      case 'KeyU':
         // removeForest();
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
         
      case 'Space':
         player.movementFlag.jump = false;
         break;
   }
});
