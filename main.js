import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as dat from "dat.gui";

const gui = new dat.GUI();

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});

const fov = 75;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 100;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  near,
  far
);
camera.position.z = 10;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

// Lighting Info
const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// Texture
const loader = new THREE.TextureLoader();
const ballTexture = loader.load("/public/004C.jpg");
const terrainTexture = loader.load("/public/snow_field_aerial_col_4k.jpg");
// texture.colorSpace = THREE.SRGBColorSpace;

// Skybox
const bgTexture = loader.load("/public/snowy_park_01_4K.jpg", () => {
  bgTexture.mapping = THREE.EquirectangularReflectionMapping;
  bgTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = bgTexture;
});

// Terrain
const heightMap = loader.load("/public/karhide_terrain.png");
// const alpha

const planeGeo = new THREE.PlaneGeometry(50, 50, 100, 100);
const planeMat = new THREE.MeshStandardMaterial({
  // color: 'gray',
  map: terrainTexture,
  displacementMap: heightMap,
  displacementScale: 5,
});

const plane = new THREE.Mesh(planeGeo, planeMat);
// scene.add(plane);

plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -20;
gui.add(plane.rotation, "x").min(0).max(100);

// Plane (Floor)
// const planeGeometry = new THREE.PlaneGeometry(50, 50);
// const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);
// plane.rotation.x = -0.5 * Math.PI;
// plane.position.y = -50;

const gridHelper = new THREE.GridHelper(100);
// scene.add(gridHelper);
gridHelper.position.y = -50;

//   const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Gltf Loaded Objects
function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

  // compute a unit vector that points in the direction the camera is now
  // from the center of the box
  const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

const gltfLoader = new GLTFLoader();
function loadGltfImage(url, { x, y, z }) {
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    root.position.set(x, y, z);
    scene.add(root);
    // compute the box that contains all the stuff
    // from root and below
    const box = new THREE.Box3().setFromObject(root);

    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    // set the camera to frame the box
    frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

    // update the Trackball controls to handle the new size
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  });
}

const winter_terrain = "/public/winter_terrain_02/scene.gltf";
const winter_house = "/public/winter_house/scene.gltf";
// const landscape = loadGltfImage(winter_terrain, { x: 0, y: 0, z: 0 });
// const winterHouse = loadGltfImage(winter_house, { x: 0, y: 0, z: 0 });

// PRIMITIVE OBJECTS
// Cube
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const cGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const cMaterial = new THREE.MeshToonMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cGeometry, cMaterial);
scene.add(cube);

// Sphere
const sGeometry = new THREE.SphereGeometry(5, 32, 16);
const sMaterial = new THREE.MeshPhongMaterial({
  //   color: 0xffff00,
  map: ballTexture,
});
const sphere = new THREE.Mesh(sGeometry, sMaterial);
// scene.add(sphere);

sphere.position.x = 5;
sphere.position.z = -10;

function makeCube(geometry, color, x) {
  const material = new THREE.MeshNormalMaterial({ color });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}

// const cubes = [
//   makeCube(cGeometry, 0x44aa88, 0),
//   makeCube(cGeometry, 0x8844aa, -2),
//   makeCube(cGeometry, 0xaa8844, 2),
// ];

function animateCubes(time) {
  time *= 0.001;

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * 0.1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animateCubes);
}

function animateSphere(time) {
  time *= 0.001;
  sphere.rotation.x = time;
  sphere.rotation.y = time;
  renderer.render(scene, camera);
  requestAnimationFrame(animateSphere);
}

// requestionAnimationFrame(bgRender);
requestAnimationFrame(animateCubes);
requestAnimationFrame(animateSphere);
// renderer.setAnimationLoop(animateCube);
// renderer.setAnimationLoop(animateCube);
