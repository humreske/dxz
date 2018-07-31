export default {
  scene: null,
  camera: null,
  renderer: null,
  me: null,
  mouseMove: null,
  mouseDown: null,
  mouseUp: null,
  keyDown: null,
  keyUp: null,
  init() {
    // console.log(this);
    // if (!this.scene) {

    this.me = this;

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(45, 12 / 8, 0.1, 10000);
    camera.position.y = 80;
    camera.position.x = -1000;
    camera.position.z = -1000;

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(1200, 800);
    renderer.setClearColor("#fff");
    document.querySelector("#stage").appendChild(renderer.domElement);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.buildPlane();

    let animateFrame = () => {
      setTimeout(animateFrame, 18);
      // requestAnimationFrame(animateFrame);
      this.animate();
      renderer.render(scene, camera);
    };
    animateFrame();
    let canvas = document.querySelector("canvas");
    let me = this;
    // console.log(canvas);
    if (canvas) {
      canvas.onmousedown = e => {
        canvas.requestPointerLock();
        if (document.pointerLockElement) {
          me.mouseDown(e)
        }
      }
      canvas.onmouseup = e => {
        // canvas.requestPointerLock();
        if (document.pointerLockElement) {
          me.mouseUp(e)
        }
      }
      canvas.onmousemove = e => {
        if (document.pointerLockElement) {
          me.mouseMove(e.movementX, e.movementY)
        }
      }
      document.onkeydown = e => {
        if (document.pointerLockElement) {
          me.keyDown(e.key)
        }
      }
      document.onkeyup = e => {
        if (document.pointerLockElement) {
          me.keyUp(e.key)
        }
      }
    }
    // }

  },
  animate() {

  },
  buildPlane() {
    let m1 = new THREE.MeshBasicMaterial({
      color: "#ccc",
      side: THREE.DoubleSide
    });
    let m2 = new THREE.MeshBasicMaterial({
      color: "#804040",
      side: THREE.DoubleSide
    });
    let m3 = new THREE.MeshBasicMaterial({
      color: "#228E02",
      side: THREE.DoubleSide
    });
    let p0 = new THREE.PlaneGeometry(3000, 3000, 5, 5);
    let plane0 = new THREE.Mesh(p0, m1);
    plane0.position.y = 0;
    plane0.rotation.x = Math.PI / 2;
    this.scene.add(plane0);

    for (let i = -10; i < 10; i++) {
      for (let j = -10; j < 10; j++) {
        let pgg = new THREE.PlaneGeometry(100, 100, 5, 5);
        let pg = new THREE.Mesh(pgg, m3);
        pg.position.y = 0.2;
        pg.position.x = 100 * i * 2;
        pg.position.z = 100 * j * 2;
        pg.rotation.x = Math.PI / 2;
        this.scene.add(pg);

      }
    }

    let p1 = new THREE.PlaneGeometry(3000, 1000, 5, 5);
    let plane1 = new THREE.Mesh(p1, m2);
    plane1.position.y = 480;
    plane1.position.z = -1500;
    this.scene.add(plane1);

    let p2 = new THREE.PlaneGeometry(3000, 1000, 5, 5);
    let plane2 = new THREE.Mesh(p2, m2);
    plane2.position.y = 480;
    plane2.position.z = 1500;
    this.scene.add(plane2);

    let p3 = new THREE.PlaneGeometry(3000, 1000, 5, 5);
    let plane3 = new THREE.Mesh(p3, m2);
    plane3.position.y = 480;
    plane3.position.x = 1500;
    plane3.rotation.y = Math.PI / 2;
    this.scene.add(plane3);

    let p4 = new THREE.PlaneGeometry(3000, 1000, 5, 5);
    let plane4 = new THREE.Mesh(p4, m2);
    plane4.position.y = 480;
    plane4.position.x = -1500;
    plane4.rotation.y = Math.PI / 2;
    this.scene.add(plane4);


  },

  addPlayer(x, z) {
    let geometry = new THREE.BoxGeometry(40, 80, 40);
    let material = new THREE.MeshBasicMaterial({
      color: "#02a"
    });
    let geometry2 = new THREE.BoxGeometry(4, 40, 40);
    let material2 = new THREE.MeshBasicMaterial({
      color: "#eee"
    });
    let geometry3 = new THREE.BoxGeometry(2, 10, 3);
    let geometry4 = new THREE.BoxGeometry(2, 10, 3);
    let material3 = new THREE.MeshBasicMaterial({
      color: "#222"
    });
    let cube = new THREE.Mesh(geometry, material);
    let cube2 = new THREE.Mesh(geometry2, material2);
    let cube3 = new THREE.Mesh(geometry3, material3);
    let cube4 = new THREE.Mesh(geometry4, material3);
    cube.position.y = 40;
    cube2.position.y = 60;
    cube2.position.x = 22;
    cube3.position.y = 65;
    cube3.position.x = 24;
    cube3.position.z = -8;
    cube4.position.y = 65;
    cube4.position.x = 24;
    cube4.position.z = 8;
    let group = new THREE.Group();
    group.add(cube);
    group.add(cube2);
    group.add(cube3);
    group.add(cube4);
    group.position.x = x;
    group.position.z = z;
    this.scene.add(group);
    return group;
  },
  addLookObj() {

  },
  movePlayer(o, x, z) {
    o.position.x = x;
    o.position.z = z;
  }


}
