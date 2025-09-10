import * as THREE from 'three'
import Experience from '../Experience.js'

export default class RaycastManager {
    constructor(targets) {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.camera = this.experience.camera.instance
        this.renderer = this.experience.renderer.instance
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.targets = [...targets]
        this.setModelsForRaycast()
        this.intializeRaycaster()
        this.setupEventListners()
    }

    setModelsForRaycast() {
        for(let i = 0; i < this.targets.length; i++) {
            this.targets[i] = this.targets[i].model
        }
    }

    intializeRaycaster() {
        this.raycaster = new THREE.Raycaster()
        this.pointer = new THREE.Vector2()
    }

    setupEventListners() {
        window.addEventListener('pointerdown', (e) => {
            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
            this.handleRaycast()
        })
    }

    handleRaycast() {
        this.raycaster.setFromCamera(this.pointer, this.camera)
        const intersects = this.raycaster.intersectObjects(this.targets);
        if(intersects[0]) {
            intersects[0].object.userData.scriptInstance.createTower()
        }
    }
}