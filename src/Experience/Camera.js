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
        // this.setControls();
    }

     setInstance() {
       this.instance = new THREE.PerspectiveCamera(
            25,
            this.sizes.width / this.sizes.height,
            0.1,
            1000
        );
        this.instance.position.set(1.9, 21.49, 24);
        this.instance.rotation.set(-0.7, -0.009, -0.008)
        this.instance.lookAt(2, 0, 0)
        this.scene.add(this.instance);
    }

    setControls() {
        
        this.controls = new OrbitControls(this.instance, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1; 
        this.controls.screenSpacePanning = false;
        // this.controls.maxPolarAngle = Math.PI / 2; 
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
        // this.controls.update();
    }
}
