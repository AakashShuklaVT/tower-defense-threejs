import * as THREE from 'three'
import Experience from '../Experience.js'
import { DEFENSE_TYPES } from '../Configs/GameConfig.js'

export default class RaycastManager {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.camera = this.experience.camera.instance
        this.renderer = this.experience.renderer.instance
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.isEnabled = true;
    }

    intializeRaycaster() {
        this.raycaster = new THREE.Raycaster()
        this.pointer = new THREE.Vector2()
        this.setupEventListners()
    }

    setupEventListners() {
        window.addEventListener('click', (e) => {
            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
            if (this.isEnabled) this.handleRaycast()
        })
    }

    handleRaycast() {
        this.raycaster.setFromCamera(this.pointer, this.camera)
        const intersects = this.raycaster.intersectObjects(this.experience.triggerableObjects);

        if (intersects.length > 0) {
            if (this.experience.world.coinsManager.getCurrentAmount() <= 0) return;
            this.isEnabled = false;
            const objectToBeRemoved = intersects[0].object
            const positionofObject = objectToBeRemoved.script.position
            this.experience.uiManager.updateCardsPopup(DEFENSE_TYPES,
                this.experience.world.levelManager.towersData,
                positionofObject, objectToBeRemoved, this.experience, this.setEnabled.bind(this))
        }
    }

    setEnabled(value) {
        this.isEnabled = value;
    }
}
