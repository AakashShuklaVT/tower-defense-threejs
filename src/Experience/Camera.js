import * as THREE from 'three';
import Experience from './Experience.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.setInstance();
        this.setControls();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.01, 1000);
        this.instance.position.set(0, 12, 18)
        this.scene.add(this.instance);
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1; // Smoother controls
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 2; // Limit rotation to not go under the ground
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    disableControls() {
        this.controls.enabled = false;
    }

    enableControls() {
        this.controls.enabled = true;
    }

    update() {
        this.controls.update();
    }
}