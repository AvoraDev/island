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

// load textures
const textureLoader = new THREE.TextureLoader();
const testTile = textureLoader.load('./textures/testTile.jpg');
const testTileNormal = textureLoader.load('./textures/testTileNormal.jpg');
const bumpNormal = textureLoader.load('./textures/bumpNormal.jpg');
testTile.wrapS = THREE.RepeatWrapping;
testTile.wrapT = THREE.RepeatWrapping;
testTile.repeat.set( 4, 4 );
testTileNormal.wrapS = THREE.RepeatWrapping;
testTileNormal.wrapT = THREE.RepeatWrapping;
testTileNormal.repeat.set( 4, 4 );

// ----------------------------------
// ENVIRONMENT SETUP
// ----------------------------------

// set camera offset
const cameraOffset = {x: 0, y: 1, z: 5}; // {x: 0, y: 2, z: 10};
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z); // change location of the camera

// set up lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xf7f7f7, 0.5);
directionalLight.position.set(150, 150, 150);
directionalLight.castShadow = true;
scene.add(directionalLight);

// set up shadows (make sure to enable shadows for all meshes)
const shadowCamArea = 25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.shadow.camera.left = -shadowCamArea;
directionalLight.shadow.camera.right = shadowCamArea;
directionalLight.shadow.camera.top = shadowCamArea;
directionalLight.shadow.camera.bottom = -shadowCamArea;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 400;

// default is 512 x 512; the larger the size, the more expensive it is to process
directionalLight.shadow.mapSize = new THREE.Vector2(1500, 1500);

const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);

// ----------------------------------
// MAIN MODELS
// ----------------------------------

// floor plane
const mapWidth = 50;
const mapHeight = 50;

const plane = new THREE.Mesh(
   new THREE.PlaneBufferGeometry(mapWidth, mapHeight),
   new THREE.MeshStandardMaterial({
      //  color: 0x4aaa50,
      	map: testTile,
	normalMap: testTileNormal
   })
);
plane.rotation.x = -(Math.PI / 2);
plane.receiveShadow = true;
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

// rock models
ENVIRONMENT.generateRockArea(
   100, // amount
   [0xaaaaaa, 0xcccccc, 0xAAAAAA], // colors
   0.05, 0.25, // minimum and maximum size
   -25, 25 // minimum and maximum position
);

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
   
   // test
   const time = Date.now() * 0.0001;
   directionalLight.position.x = Math.sin(time) * 200;
   directionalLight.position.z = Math.cos(time) * 200;
   
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

// get random float
function getRandFloat(min, max) {
  return (Math.random() * (max - min)) + min;
}

// get random interger
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
