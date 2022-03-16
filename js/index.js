// ----------------------------------
// BOILERPLATE CODE
// ----------------------------------

// set up scene
const scene = new THREE.Scene();

// set up renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // background (color, alpha)
document.body.appendChild(renderer. domElement);

// set up camera
const camera = new THREE.PerspectiveCamera(
   75, // FOV
   window.innerWidth / window.innerHeight, // aspect ratio
   0.1, // near plane
   1000 // far plane
);

// set up orbit controls (optional, and broken)
// const controls = new OrbitControls(camera, renderer.domElement);

// set up texture loader
const textureLoader = new THREE.TextureLoader();

// textures
const testTile = textureLoader.load('./textures/testTile.jpg');
const testTileNormal = textureLoader.load('./textures/testTileNormal.jpg');
const bumpyNormal = textureLoader.load('./textures/bumpyNormal.jpg');
// ----------------------------------
// ENVOIROMENT SETUP
// ----------------------------------

// set camera offset
const cameraOffset = {x: 0, y: 5, z: 10}; // {x: 0, y: 2, z: 10};
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z); // change location of the camera

// set up lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xf7f7f7, 0.5);
dirLight.position.set(20, 0, 20);
scene.add(dirLight);

// set up shading (WIP)

// ----------------------------------
// MAIN MODELS
// ----------------------------------

// floor plane
const mapWidth = 50;
const mapHeight = 50;

const plane = new THREE.Mesh(
   new THREE.PlaneBufferGeometry(mapWidth, mapHeight),
   new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      normalMap: bumpyNormal
   })
);
plane.rotation.x = -(Math.PI / 2);
scene.add(plane);

// player model
const player = new PlayerModel(1, {
   cameraOffset: {
      x: cameraOffset.x,
      y: cameraOffset.y,
      z: cameraOffset.z
   }
});
scene.add(player.group);

// tree models
// const trees = [];
// for (let i = 0; i < 10; i++) {
//    generateTree(
//       getRandFloat(0.5,2),
//       {
//          x: getRandFloat(-25,25),
//          z: getRandFloat(-25,25)
//       }
//    );
// }

// ----------------------------------
// HELPER MODELS
// ----------------------------------

// look into emissive and emissiveIntensity for lambert

// debuugging
const debug = document.querySelector('#debug');

// test model
const testModel = new TestModel(2, 0.5);
testModel.tp(0, 2, 0);
scene.add(testModel.group);

// normal test model
const testModel2 = new THREE.Mesh(
   new THREE.BoxGeometry(1, 1, 1),
   new THREE.MeshNormalMaterial()
);
testModel2.position.set (-4, 1, 0);
scene.add(testModel2);

// test plane (texturing)
const testPlane = new THREE.Mesh(
   new THREE.PlaneBufferGeometry(4,4),
   new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      map: testTile,
      normalMap: testTileNormal
   })
);
testPlane.position.set(4, 2, 0);
scene.add(testPlane);

// grid
const gridHelper = new THREE.GridHelper(50, 50); // size, divisions
scene.add(gridHelper);

// arrows
const arrowHelper = new ArrowHelperModel();
scene.add(arrowHelper.group);

// ----------------------------------
// RENDER LOOP
// ----------------------------------

let running = true;
function render() {
   // render loop
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	
	// orbit control (comment out if orbit controls wont be in use)
   // controls.update();
	
	// debugging
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
	
	// rotate testPiece
   testModel.spin('x', 0.01);
   testModel.spin('y', 0.01);
   testModel.spin('z', 0.01);
   
   // rotate testPlane
   testPlane.rotation.x += 0.01;
   
   // update player information
   player.update();
   
   // movement handler
   Object.keys(player.movementFlag).forEach((key) => {
      if (player.movementFlag[key]) {
         player.movementHandler(key);
      }
   });
   
   // collision handler (WORK ON)
}

// begin rendering
render();

// ----------------------------------
// UTILITY FUNCTIONS & EVENT LISTENERS
// ----------------------------------

// get random number
function getRandFloat(min, max) {
  return (Math.random() * (max - min)) + min;
}

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
