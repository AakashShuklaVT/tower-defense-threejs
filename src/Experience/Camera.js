import * as THREE from 'three';
import Experience from './Experience.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.setInstance();
        this.setControls()
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 1, 1000);
        this.instance.position.set(50, 50, 50)
        this.instance.lookAt(new THREE.Vector3(0, 0, 0))
        this.scene.add(this.instance);
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        // this.controls.enabled = false;
        this.controls.enableDamping = false;
        // this.controls.dampingFactor = 0.1; // Smoother controls
        // this.controls.screenSpacePanning = false;

    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    startinitialCameraAnimation(callback) {
        gsap.to(this.instance.position, {
            x: -14, y: 15, z: 13, duration: 2,
            onComplete: () => {
                callback();
                this.setControls();
                this.controls.maxPolarAngle = Math.PI / 3.5;
                this.controls.minPolarAngle = Math.PI / 3.5;
                this.controls.maxAzimuthAngle = -Math.PI / 180 * 45;
                this.controls.minAzimuthAngle = -Math.PI / 180 * 135;
                this.controls.maxZoom = 20;
                this.controls.minZoom = 12;
            },
            onUpdate: () => {
                this.instance.lookAt(new THREE.Vector3(0, 0, 0))
            }
        })
    }

    disableControls() {
        this.controls.enabled = false;
    }

    enableControls() {
        this.controls.enabled = true;
    }

    update() {
        this.controls && this.controls.update();
    }
}