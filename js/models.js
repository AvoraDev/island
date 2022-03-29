// ----------------------------------
// MAIN MODELS
// ----------------------------------

class PlayerModel {
   constructor(size, color, cameraInfo) {
      // TODO - try to minimize the amount of objects
      // model info
      this.group = new THREE.Group();
      this.size = size;
      this.color = {
         body: color.body, // original: 0x0eeff
         eyes: color.eyes
      };
      
      // camera offset
      this.cameraOffset = {
         x: cameraInfo.x,
         y: cameraInfo.y,
         z: cameraInfo.z
      };
      
      // tween durations
      this.rotateTweenDuration = 0.1; // anything over 0.11 casues issues
      this.cameraTweenDuration = {
         position: 1,
         follow: {
            x: 0.5,
            y: 1,
            z: 0.5
         }
      };
      
      // camera fall switch
      // used with this.cameraFall()
      this.cameraFallSwitch = false;
      
      // player speeds
      // TODO - implement this.jumpHeight
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
         right: 6.283185   // parseFloat((Math.PI * 2).toFixed(6))*
      };
      // * right starts off at 0
      
      // rotation helpers (allow for proper full circle movement)
      // TODO - look into this.tweenBuffer and this.errorSpace
      this.tweenBuffer = true;
      // allowed error for full circle (see this.rotateHandler())
      this.errorSpace = 0.05; // original: 0.000005
      
      // draw model
      this.drawBody();
      this.drawEyes();
      this.group.position.y = this.size / 2;
      this.group.rotation.y = this.cardinalDir.down;
      
      // enable shadows
      this.group.traverse((object) => {
         object.castShadow = true;
         object.receiveShadow = true;
      });
      
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
      this.group.add(body);
   }
   drawEyes() {
      // eye geometries
      let eyeGeo = new THREE.BoxGeometry(
         this.size / 8,
         this.size / 2,
         this.size / 4
      );
      
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
      // camera fall handler
      if (player.cameraFallSwitch === true) {this.cameraFallLoop(); return;}
      
      // turning handler
      this.rotation = this.group.rotation.y; // for convenience
      this.rotateHandler();
      
      // jumping handler
      this.jumpHandler();
      
      // reset camera position
      this.resetCamera();
      
      // movement handler
      if (this.movementFlag.up)     {this.movementHandler('up');}
      if (this.movementFlag.down)   {this.movementHandler('down');}
      if (this.movementFlag.left)   {this.movementHandler('left');}
      if (this.movementFlag.right)  {this.movementHandler('right');}
      if (this.movementFlag.jump)   {this.movementHandler('jump');}
      /* old handler
      Object.keys(this.movementFlag).forEach((key) => {
         if (this.movementFlag[key]) {
            this.movementHandler(key);
         }
      });
      */
   }   
   movementHandler(dir) {
      switch (dir) {
         case 'up':
            this.group.position.z -= this.movementSpeed;
            if (this.roration !== this.cardinalDir.up) {
               gsap.to(this.group.rotation, {
                  y: this.cardinalDir.up,
                  duration: this.rotateTweenDuration
               });
            }
            break;
            
         case 'down':
            let downRadian = this.rotation >= this.cardinalDir.up ? 
               this.cardinalDir.down : -1.570796;
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
            if (this.roration !== this.cardinalDir.left) {
               gsap.to(this.group.rotation, {
                  y: this.cardinalDir.left,
                  duration: this.rotateTweenDuration
               });
            }
            break;
            
         case 'right':
            let rightRadian = this.rotation <= this.cardinalDir.left ?
               0 : this.cardinalDir.right;
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
      /*
      TODO - try to figure out how to fix all of this
      checks to see if current rotation is equal to one of
      the secondary cardinalDir of either down or right
      if it is, then reset to original cardinal direction
      this.errorSpace is the allowed error when
      returning to original cardinal direction
      */
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
         if (this.group.position.y >= this.size / 2) {
            this.vPos += this.jumpSpeed;
            this.group.position.y = Math.sin(this.vPos) + (this.size / 2);
         } else { // reset jump
            this.jumpEnabled = false;
            this.group.position.y = this.size / 2;
            this.vPos = 0;
         }
      }
   }
   resetCamera() {
      // (bless the heavens for gsap)
      // tween cameras position to follow player
      gsap.to(camera.position, {
         x: this.group.position.x + this.cameraOffset.x,
         y: this.group.position.y + this.cameraOffset.y,
         z: this.group.position.z + this.cameraOffset.z,
         duration: this.cameraTweenDuration.position
      });
      
      this.resetCameraLootAt();
   }
   resetCameraLootAt() {
      // tween camera's lookAt coordinates
      Object.keys(this.cameraTweenDuration.follow).forEach((axis) => {
         if (this.cameraTweenDuration.follow[axis] !== 0) {
            gsap.to(this.cameraFollowCordinate, {
               [axis]: this.group.position[axis],
               duration: this.cameraTweenDuration.follow[axis]
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
   cameraFall(start, dur, delay = 0) {
      // starts the camera from a given height and smoothly lowers the camera,
      // giving a 'falling' look
      // duration and delay are in seconds
      
      // disable player movement
      this.cameraFallSwitch = true;
      camera.position.y = start;
      
      setTimeout(() => {
         // fall
         gsap.to(camera.position, {
            y: this.group.position.y + this.cameraOffset.y,
            duration: dur
         });
         
         // slow down camera lookAt
         let pastTween = this.cameraTweenDuration.follow.y;
         this.cameraTweenDuration.follow.y = dur * 1.25;
         setTimeout(() => {
            gsap.to(this.cameraTweenDuration.follow, {
               y: pastTween
            });
         }, (dur * 1000) + 4000);
         
         // enable player.update() after fall
         setTimeout(() => {
            this.cameraFallSwitch = false;
         }, (dur * 1000) - 200);
      }, delay * 1000);
   }
   cameraFallLoop() {
      // tweens the camera's lookAt coordinates while
      // this.cameraFallSwitch is true
      this.cameraFollowCordinate.y = camera.position.y;
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
         this.group.position.set(pos.x, this.size / 2, pos.z);
         
         // enable shadows
         this.group.traverse((object) => {
            object.castShadow = true;
            object.receiveShadow = true;
         });
      }
      drawTree() {
         // mesh geometries
         let leafGeo = new THREE.ConeGeometry(
            this.size * 0.75,
            this.size * 2,
            5
         );
         let trunkGeo = new THREE.CylinderGeometry(
            this.size * 0.16,
            this.size * 0.16,
            this.size, 5
         );
         
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
         
         // let leaves3 = leaves1.clone();
         // leaves3.position.set(0, this.size * 1.5, 0);
         // this.group.add(leaves3);
         
         // tree trunk
         let trunk = new THREE.Mesh(
            trunkGeo,
            new THREE.MeshLambertMaterial({color: this.color.trunk})
         );
         trunk.position.set(0, 0, 0);
         this.group.add(trunk);
      }
   },
   generateForest: function (amount, minSize, maxSize, minPos, maxPos) {
      let size, leafColor;
      for (let i = 0; i < amount; i++) {
         // get random size
         size = getRandFloat(minSize, maxSize);
         
         // get one of three leaf colors: red, golden, and green
         leafColor = getRandFloat(0, 1); // > 0.75 ? 0xd1a101 : 0x32520D;
         if (leafColor >= 0.98) {
            leafColor = 0xb00a00; // red, rare ~1/10
         } else if (leafColor >= 0.6) {
            leafColor = 0xd1a101; // golden, uncommon ~3/10
         } else {
            leafColor = 0x32520D; // green, common ~6/10
         }
         
         // add to trees array
         this.trees.push(new ENVIRONMENT.Tree(
            size,
            leafColor,
            {
               x: getRandFloat(minPos, maxPos),
               z: getRandFloat(minPos, maxPos)
            }         
         ));
         
         // add to scene
         scene.add(this.trees[i].group);
      }
   },
   // rocks
   rocks: [],
   Rock: class {
      constructor(size, color, pos) {
         this.group = new THREE.Group();
         this.size = {
            width: size.width,
            height: size.height,
            depth: size.depth
         };
         this.color = color;
         
         // draw rock
         this.drawRock();
         this.group.position.set(pos.x, pos.y, pos.z);
         
         // enable shadows
         this.group.traverse((object) => {
            object.castShadow = true;
            object.receiveShadow = true;
         });
      }
      drawRock() {
         let mainRock = new THREE.Mesh(
            new THREE.BoxGeometry(
               this.size.width,
               this.size.height,
               this.size.depth
            ),
            new THREE.MeshLambertMaterial({color: this.color})
         );
         this.group.add(mainRock);
         
         let sideRock1 = new THREE.Mesh(
            new THREE.BoxGeometry(
               this.size.width / 2,
               this.size.height / 2,
               this.size.depth / 2
            ),
            new THREE.MeshLambertMaterial({color: this.color})
         );
         sideRock1.position.set(
            (this.size.width * 0.5) * getRandInt(-1, 2),
            (this.size.height / 3) / -2,
            (this.size.depth * 0.5) * getRandInt(-1, 2)
         );
         this.group.add(sideRock1);
         
         let sideRock2 = new THREE.Mesh(
            new THREE.BoxGeometry(
               this.size.width / 3,
               this.size.height / 3,
               this.size.depth / 3
            ),
            new THREE.MeshLambertMaterial({color: this.color})
         );
         sideRock2.position.set(
            this.size.width * -0.75,
            (this.size.height / 3) / -2,
            this.size.depth * -0.75
         );
         this.group.add(sideRock2);
      }
      
   },
   generateRockArea: function(amount, color, minSize, maxSize, minPos, maxPos) {
      let size, rockColor;
      for (let i = 0; i < amount; i++) {
         // get random dimensions
         size = {
            width: getRandFloat(minSize, maxSize),
            height: getRandFloat(minSize, maxSize),
            depth: getRandFloat(minSize, maxSize)
         };
         
         // get random color from given list
         rockColor = color[getRandInt(0, color.length)];
         
         // add to array
         this.rocks.push(new ENVIRONMENT.Rock(
            size,
            rockColor,
            {
               x: getRandFloat(minPos, maxPos),
               y: size.height / 2,
               z: getRandFloat(minPos, maxPos)
            }         
         ));
         
         // add to scene
         scene.add(this.rocks[i].group);
      }
   }
};

// ----------------------------------
// OTHER MODELS
// ----------------------------------

// test models
// presets: normal-map cube (1), l-piece(2), plane(3)
class TestModel {
   constructor(preset, size, material) {
      this.group = new THREE.Group();
      this.size = size;
      this.material = material; // for plane only
      this.preset = preset;
      
      // draw selected preset model;
      this.selectPreset(this.preset);
      
      // enable shadows
      this.group.traverse((object) => {
         object.castShadow = true;
         object.receiveShadow = true;
      });
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

// arrow helper for axis
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
