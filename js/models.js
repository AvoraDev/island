// ----------------------------------
// MAIN MODELS
// ----------------------------------

class PlayerModel {
   constructor(size, cameraInfo) {
      // model info
      this.group = new THREE.Group();
      this.size = size;
      this.color = {
         body: 0x0eeff,
         eyes: 0x000000
      };
      
      // camera offset
      this.cameraOffset = {
         x: cameraInfo.cameraOffset.x,
         y: cameraInfo.cameraOffset.y,
         z: cameraInfo.cameraOffset.z
      };
      
      // tween durations
      this.rotateTweenDuration = 0.1; // anything over 0.11 casues issues
      this.cameraTweenDuration = {
         position: 1,
         follow: {
            x: 0.5,
            y: 0.5,
            z: 0.5
         }
      };
      
      // player speeds
      this.movementSpeed = 0.05;
      this.jumpSpeed = 0.06;
      this.jumpHeight = this.size * 2;
      
      // jump handlers
      this.jumpEnabled = false;
      this.vPos = 0;
      
      // movement flags
      this.movementFlag = {
         up: false,
         down: false,
         left: false,
         right: false,
         jump: false
      };
      
      // rotation cardinal directions
      this.rotation = 0;
      this.cardinalDir = {
         up: 1.570796,     // parseFloat((Math.PI / 2).toFixed(6)),
         down: 4.712388,   // parseFloat(((Math.PI * 3) / 2).toFixed(6)),
         left: 3.14159,    // parseFloat((Math.PI).toFixed(6)),
         right: 6.283185   // parseFloat((Math.PI * 2).toFixed(6))***
      };
      // *** right starts off at 0
      
      // rotation helpers (allow for proper full circle movement)
      this.tweenBuffer = true;
      this.errorSpace = 0.05; // allowed error for full circle (see rotateHandler()) original: 0.000005
      
      // draw model
      this.drawBody();
      this.drawEyes();
      
      // enable/disable shadows
      this.group.traverse((object) => {
         object.castShadow = true;
         object.receiveShadow = true;
      });
      
      // move model to prevent clipping
      this.group.position.y = this.size / 2;
      
      // camera lookAt coordinates
      this.cameraFollowCordinate = {
         x: this.group.position.x,
         y: this.group.position.y,
         z: this.group.position.z
      };
   }
   drawBody() {
      let body = new THREE.Mesh(
         new THREE.BoxGeometry(this.size, this.size, this.size),
         new THREE.MeshLambertMaterial({color: this.color.body})
      );
      body.position.set(0, 0, 0);
      this.group.add(body);
   }
   drawEyes() {
      // eye geometries
      let eyeGeo = new THREE.BoxGeometry(this.size / 8, this.size / 2, this.size / 4);
      
      // left eye
      let leftEye = new THREE.Mesh(
         eyeGeo,
         new THREE.MeshLambertMaterial({color: this.color.eyes})
      );
      leftEye.position.set(this.size / 2, 0, -(this.size / 4));
      this.group.add(leftEye);
      
      // right eye
      let rightEye = leftEye.clone();
      rightEye.position.set(this.size / 2, 0, this.size / 4);
      this.group.add(rightEye);
   }
   update() {
      // turning handler
      this.rotation = this.group.rotation.y; // for convenience
      this.rotateHandler();
      
      // jumping handler
      this.jumpHandler();
      
      // reset camera position
      this.resetCamera();
   }   
   movementHandler(dir) {
      switch (dir) {
         case 'up':
            this.group.position.z -= this.movementSpeed;
            gsap.to(this.group.rotation, {
               y: this.cardinalDir.up,
               duration: this.rotateTweenDuration
            });
            break;
            
         case 'down':
            let downRadian = this.rotation >= this.cardinalDir.up ? this.cardinalDir.down : -1.570796;
            downRadian = this.rotateHandler(downRadian);
            
            this.group.position.z += this.movementSpeed;
            if (this.tweenBuffer === true) {
               gsap.to(this.group.rotation, {
                  y: downRadian,
                  duration: this.rotateTweenDuration
               });
            } else {
               this.tweenBuffer = true;
            }
            break;
            
         case 'left':
            this.group.position.x -= this.movementSpeed;
            gsap.to(this.group.rotation, {
               y: this.cardinalDir.left,
               duration: this.rotateTweenDuration
            });
            break;
            
         case 'right':
            let rightRadian = this.rotation <= this.cardinalDir.left ? 0 : this.cardinalDir.right;
            rightRadian = this.rotateHandler(rightRadian);
            
            this.group.position.x += this.movementSpeed;
            if (this.tweenBuffer === true) {
               gsap.to(this.group.rotation, {
                  y: rightRadian,
                  duration: this.rotateTweenDuration
               });
            } else {
               this.tweenBuffer = true;
            }
            break;
            
         case 'jump':
            this.jumpEnabled = true;
            break;
      }
   }
   rotateHandler(input) {
      // it isn't perfect, but i think this is good enough for me
      // checks to see if current rotation is equal to one of
      // the secondary cardinalDir of either down or right
      // if it is, then reset to original cardinal direction
      // (errorSpace is the allowed error when returning to original cardinal direction)
      if (this.rotation >= this.cardinalDir.right - this.errorSpace) { 
         this.group.rotation.y = 0;
         this.tweenBuffer = false;
         return 0;
         
      } else if (this.rotation <= -1.570796 + this.errorSpace) {
         this.group.rotation.y = this.cardinalDir.down;
         this.tweenBuffer = false;
         return this.cardinalDir.down;
         
      } else {
         return input;
      }
   }
   jumpHandler() {
      if (this.jumpEnabled === true) {
         if (this.group.position.y >= this.size / 2) { // if the player isn't touching the floor
            this.vPos += this.jumpSpeed;
            this.group.position.y = Math.sin(this.vPos) + (this.size / 2);
         } else { // reset jump
            this.jumpEnabled = false;
            this.group.position.y = this.size / 2;
            this.vPos = 0;
         }
      }
   }
   resetCamera() { // bless the heavens for gsap
      // tween cameras position to follow player
      gsap.to(camera.position, {
         x: this.group.position.x + this.cameraOffset.x,
         y: this.group.position.y + this.cameraOffset.y,
         z: this.group.position.z + this.cameraOffset.z,
         duration: this.cameraTweenDuration.position // this.cameraTD
      });
      
      // tween camera's lookAt coordinates
      // 'key' will be either x, y, or z
      Object.keys(this.cameraTweenDuration.follow).forEach((key) => {
         if (this.cameraTweenDuration.follow[key] !== 0) {
            gsap.to(this.cameraFollowCordinate, {
               [key]: this.group.position[key],
               duration: this.cameraTweenDuration.follow[key]
            });
         } else {
            this.cameraFollowCordinate[key] = this.group.position[key];
         }
      });
      
      // update camera's lookAt coordinates
      camera.lookAt(
         this.cameraFollowCordinate.x,
         this.cameraFollowCordinate.y,
         this.cameraFollowCordinate.z
      );
   }
   tp(x, z, y) {
      this.group.position.set(x, y, z);
   }
}

const ENVIRONMENT = {
   // trees
   trees: [],
   Tree: class {
      constructor(size, leafColor, pos) {
         this.group = new THREE.Group();
         this.size = size;
         this.color = {
            leaves: leafColor,
            trunk: 0x49011d
         };
         
         // draw tree
         this.drawTree();
         
         // enable shadows
         this.group.traverse((object) => {
            object.castShadow = true;
            object.receiveShadow = true;
         });
   
         // move tree
         this.group.position.set(pos.x, pos.y, pos.z);
      }
      drawTree() {
         // mesh geometries
         let leafGeo = new THREE.ConeGeometry(this.size * 0.75, this.size * 2, 10);
         let trunkGeo = new THREE.CylinderGeometry(this.size * 0.16, this.size * 0.16, this.size, 10);
         
         // 'leaf' segments
         let leaves1 = new THREE.Mesh(
            leafGeo,
            new THREE.MeshLambertMaterial({color: this.color.leaves})
         );
         leaves1.position.set(0, this.size, 0);
         this.group.add(leaves1);
         
         let leaves2 = leaves1.clone();
         leaves2.position.set(0, this.size * 1.25, 0);
         this.group.add(leaves2);
         
         let leaves3 = leaves1.clone();
         leaves3.position.set(0, this.size * 1.5, 0);
         this.group.add(leaves3);
         
         // trunk
         let trunk = new THREE.Mesh(
            trunkGeo,
            new THREE.MeshLambertMaterial({color: this.color.trunk})
         );
         trunk.position.set(0, 0, 0);
         this.group.add(trunk);
         
         // move up to prevent clipping
         this.group.position.set(0, this.size / 2, 0);
      }
   },
   generateForest: function (amount, minSize, maxSize, minPos, maxPos) {
      for (let i = 0; i < amount; i++) {
         // get random size
         let size = getRandFloat(minSize, maxSize);
         
         // get leaf color (small chance to get a golden tree)
         let leafColor = getRandFloat(0, 1) > 0.9 ? 0xd1a101 : 0x32620D;
         
         this.trees.push(new ENVIRONMENT.Tree(
            size,
            leafColor,
            {
               x: getRandFloat(minPos, maxPos),
               y: size / 2,
               z: getRandFloat(minPos, maxPos)
            }         
         ));
         
         scene.add(this.trees[i].group);
      }
   },
   // rocks
   rocks: [],
   Rock: class {
      constructor(size, color, pos) {
         this.group = new THREE.Group();
         this.size = {width: size.width, height: size.height, depth: size.depth};
         this.color = color;
         
         this.drawRock();
         
         // enable shadows
         this.group.traverse((object) => {
            object.castShadow = true;
            object.receiveShadow = true;
         });
         
         this.group.position.set(pos.x, pos.y, pos.z);
      }
      drawRock() {
         let rock = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth),
            new THREE.MeshLambertMaterial({color: this.color})
         );
         this.group.add(rock);
      }
      
   },
   generateRockArea: function(amount, color, minSize, maxSize, minPos, maxPos) {
      for (let i = 0; i < amount; i++) {
         let size, rockColor;
         
         // get random dimensions
         size = {
            width: getRandFloat(minSize, maxSize),
            height: getRandFloat(minSize, maxSize),
            depth: getRandFloat(minSize, maxSize)
         };
         
         // get random color from given list
         rockColor = color[getRandInt(0, color.length - 1)];
         
         this.rocks.push(new ENVIRONMENT.Rock(
            size,
            rockColor,
            {
               x: getRandFloat(minPos, maxPos),
               y: size.height / 2,
               z: getRandFloat(minPos, maxPos)
            }         
         ));
         
         scene.add(this.rocks[i].group);
      }
   }
};

// ----------------------------------
// OTHER MODELS
// ----------------------------------

// test models
// presets: normal-map cube (1), l-piece(2)
class TestModel {
   constructor(preset, size, material) {
      this.group = new THREE.Group();
      this.size = size;
      this.material = material; // for plane only
      this.preset = preset;
      
      // draw selected preset model;
      this.selectPreset(this.preset);
      
      // enable/disable shadows
      this.group.castShadow = true;
      this.group.receiveShadow = true;
   }
   selectPreset(preset) {
      switch (preset) {
         case 1:
            this.drawCube();
            break;
         
         case 2:
            this.drawLPiece();
            break;
            
         case 3:
            this.drawPlane();
            break;
            
         default:
            this.drawSquare();
      }
   }
   drawCube() {
      let cube = new THREE.Mesh(
         new THREE.BoxGeometry(this.size, this.size, this.size),
         new THREE.MeshNormalMaterial()
      );
      this.group.add(cube);
      this.group.position.set(0, this.size / 2, 0);
   }
   drawLPiece() {
      let cube1 = new THREE.Mesh(
         new THREE.BoxGeometry(this.size, this.size, this.size),
         new THREE.MeshLambertMaterial({color: 0xff0000, wireframe: true})
      );
      cube1.position.set(0, 0, 0);
      this.group.add(cube1);
      
      let cube2 = new THREE.Mesh(
         cube1.geometry,
         new THREE.MeshLambertMaterial({color: 0x00ff00, wireframe: true})
      );
      cube2.position.set(0, this.size, 0);
      this.group.add(cube2);
      
      let cube3 = new THREE.Mesh(
         cube1.geometry,
         new THREE.MeshLambertMaterial({color: 0x0000ff, wireframe: true})
      );
      cube3.position.set(0, this.size * 2, 0);
      this.group.add(cube3);
      
      let cube4 = new THREE.Mesh(
         cube1.geometry,
         new THREE.MeshLambertMaterial({color: 0xffff00, wireframe: true})
      );
      cube4.position.set(this.size, 0, 0);
      this.group.add(cube4);
      
      this.group.position.set(0, this.size / 2, 0);
   }
   drawPlane() {
      const plane = new THREE.Mesh(
         new THREE.PlaneBufferGeometry(this.size, this.size),
         this.material
      );
      this.group.add(plane);
   }
   spin(axis, speed) {
      this.group.rotation[axis] += speed;
   }
   tp(x, y, z) {
      this.group.position.set(x, y, z);
   }
}

class ArrowHelperModel {
   constructor(size = 10) {
      this.group = new THREE.Group();
      this.size = size;
      this.origin = new THREE.Vector3(0, 0, 0);
      this.color = {
         x: 0x00ff00,
         y: 0xff0000,
         z: 0x0000ff
      };
      
      // draw arrows
      this.drawArrowHelper();
   }

   drawArrowHelper() {
      let arrowX = new THREE.ArrowHelper(
         new THREE.Vector3(1, 0, 0).normalize(),
         this.origin,
         this.size,
         this.color.x
      );
      this.group.add(arrowX);
      
      let arrowY = new THREE.ArrowHelper(
         new THREE.Vector3(0, 1, 0).normalize(),
         this.origin,
         this.size,
         this.color.y
      );
      this.group.add(arrowY);
      
      let arrowZ = new THREE.ArrowHelper(
         new THREE.Vector3(0, 0, 1).normalize(),
         this.origin,
         this.size,
         this.color.z
      );
      this.group.add(arrowZ);
   }
}
