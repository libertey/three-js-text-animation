import * as THREE from './node_modules/three/build/three.module.js'
import * as dat from './node_modules/dat.gui/build/dat.gui.module.js'
import { OrbitControls } from "./vendor_mods/OrbitControls.js";
import gsap from './node_modules/gsap/all.js';

const height = window.innerHeight

const gui = new dat.GUI()
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  }
}

dat.GUI.toggleHide()


/* gui.add(world.plane, 'width', 1, world.plane.width * 2).onChange(generatePlane)
gui.add(world.plane, 'height', 1, world.plane.height * 2).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 150).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 150).onChange(generatePlane) */

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  90,
  innerWidth / innerHeight,
  0.01,
  1000
  ) 

  
function generatePlane() {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
    )
  const {array} = planeMesh.geometry.attributes.position
  
  for(let i = 0; i<array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
    
    array[i + 2] = z + Math.random()
  }
  const colors = []

  for(let i = 0; i<planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0,.19,.4)
  }
  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}
const container = document.getElementById('bg')
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, height)
renderer.setPixelRatio(devicePixelRatio)
container.appendChild(renderer.domElement)

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
)
const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true,
})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

const {array} = planeMesh.geometry.attributes.position
const randomValue = []

//vertices manipulation
for(let i = 0; i<array.length; i ++) {
  const x = array[i];
  const y = array[i + 1];
  const z = array[i + 2];
  
  array[i] = x + (Math.random() - 0.5) * 3
  array[i + 1] = y + (Math.random() - 0.5) * 3
  array[i + 2] = z + (Math.random() - 0.5) * 3

  randomValue.push(Math.random() - 0.5)
}

planeMesh.geometry.attributes.position.randomValues = randomValue
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array


const colors = []

for(let i = 0; i<planeMesh.geometry.attributes.position.count; i++) {
  colors.push(0,.19,.4)
}


planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
console.log(planeMesh.geometry.attributes)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
scene.add(light)
const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

scene.add(planeMesh)
camera.position.z = 40
camera.position.y = -20
const controls = new OrbitControls(camera, renderer.domElement)



const mouse = {
  x: undefined,
  y: undefined,
}
let frame = 0
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  raycaster.setFromCamera(mouse, camera)

  frame += 0.01

  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for(let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.003
  }

  planeMesh.geometry.attributes.position.needsUpdate = true


  const intersects = raycaster.intersectObject(planeMesh)
  if(intersects.length > 0) {
    const {color} =  intersects[0].object.geometry.attributes

    // vertices 1
    color.setX(intersects[0].face.a,0.1)
    color.setY(intersects[0].face.a,0.5)
    color.setZ(intersects[0].face.a,1)

    //vertices 2
    color.setX(intersects[0].face.b,0.1)
    color.setY(intersects[0].face.b,0.5)
    color.setZ(intersects[0].face.b,1)

    //vertices 3
    color.setX(intersects[0].face.c,0.1)
    color.setY(intersects[0].face.c,0.5)
    color.setZ(intersects[0].face.c,1)

    color.needsUpdate = true

    const initialColor = {
      r: 0,
      g: .19,
      b: .4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor,{
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 2,
      onUpdate: () => {
        //vertices 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        //vertices 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        //vertices 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)

        color.needsUpdate = true
      }
    })
  }
}
animate()



document.getElementsByTagName('canvas')[0].addEventListener('mousemove', (e) => {
  const rect = e.target.getBoundingClientRect()
  mouse.x = ((e.clientX / innerWidth) * 2 - 1)
  mouse.y = -(e.clientY / innerHeight) * 2 + 1
  console.log(mouse);
})