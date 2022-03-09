// ----------------------------------
// BOILERPLATE CODE
// ----------------------------------
// set up scene
const scene = new THREE.Scene();

// set up camera
const camera = new THREE.PerspectiveCamera(
   75, // FOV
   window.innerWidth / window.innerHeight, // aspect ratio
   0.1, // near plane
   1000 // far plane
);

// set up renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } ); //decide if you want to have antialiasing
   renderer.setSize( window.innerWidth, window.innerHeight );
   document.body.appendChild( renderer.domElement );

// set up lighting (WIP)
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
   scene.add( ambientLight );

const dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
   dirLight.position.set( 100, -300, 400 );
   scene.add( dirLight );

// set perspective
const controls = new OrbitControls(camera, renderer.domElement); // causing isssues joriejiorekljrje
// camera.up.set( 0, 0, 1 ); //set z to up
camera.position.set( 0, 5, 10 ); // change location of the camera
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) ); // look at the center of the scene
controls.update();


// box thing
const box = test();
scene.add( box );

/* line
const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } )
const points2 = [];
points2.push( new THREE.Vector3( 0, 0, 0 ) );
points2.push( new THREE.Vector3( 0, 2, 0 ) );
points2.push( new THREE.Vector3( 2, 2, 0 ) );
const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
const line = new THREE.Line( geometry2, material2 );
scene.add( line );
*/

// grid (to visualize z-x plane)
const gridHelper = new THREE.GridHelper( 50, 50 ); // size, divisions
scene.add( gridHelper );

// ----------------------------------
// RENDER LOOP
// ----------------------------------
let running = true;
function render() {
	requestAnimationFrame(render);
	
	// rotate cube
   // cube.rotation.y += 0.01;
   
   //rotate camera(i give up)
   // camera.position.z += Math.sin(camera.position.z/ 360 * Math.PI);
   // camera.position.x += Math.cos(camera.position.x/ 360 * Math.PI);
   // camera.lookAt(new THREE.Vector3(0,0,0));
   
	renderer.render(scene, camera);
}

//begin rendering
render();

function test() {
   const brr = new THREE.Group();
   
   // cube
   const geometry = new THREE.BoxGeometry();
   const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
   const cube = new THREE.Mesh(geometry, material);
   brr.add( cube );
   
   const geometry2 = new THREE.BoxGeometry();
   const material2 = new THREE.MeshBasicMaterial({color: 0xf0ff00});
   const cube2 = new THREE.Mesh(geometry2, material2);
   cube2.position.set(0,1,0);
   brr.add( cube2 );
   
   const meshh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshLambertMaterial( { color: 0xffffff } )
   );
   meshh.position.set( 1, 0, 0 );
   brr.add( meshh );
   
   return brr;
}

// figure this out
addEventListener('keydown', (event) => {
   if (event.code === 'Space') {
      if (running)  {
         cancelAnimationFrame(render);
         running = false;
      } else {
         render();
      }
   } else if (event.code === 'ArrowLeft') {
      cube.position.x += 0.01;
   }
});
