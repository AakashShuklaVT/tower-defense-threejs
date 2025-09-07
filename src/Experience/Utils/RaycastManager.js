import * as THREE from 'three'
import Experience from '../Experience.js'
import { DEFENSE_TYPES, MIN_AMOUNT_REQUIRED_TO_BUILD } from '../Configs/GameConfig.js'

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
        window.addEventListener('dblclick', (e) => {
            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
            if (this.isEnabled) this.handleRaycast()
        })
    }

    handleRaycast() {
        this.raycaster.setFromCamera(this.pointer, this.camera)
        const intersects = this.raycaster.intersectObjects(this.experience.triggerableObjects);

        if (intersects.length > 0) {
            this.isEnabled = false;
            const intersectedObject = intersects[0].object;
            const positionofObject = intersectedObject.userData.script.position
            if (intersectedObject.name === 'defensive_tower') {
                const script = intersectedObject.userData.script;
                this.experience.uiManager.showUpgradeTowerPopup(
                    script.defenseName,
                    script[`${script.defenseName}`].currentLevel,
                    script[`${script.defenseName}`].updateLevel.bind(script[`${script.defenseName}`]),
                    script.disposeTower.bind(script),
                    this.setEnabled.bind(this)
                )
            }

            if (this.experience.world.coinsManager.getCurrentAmount() < MIN_AMOUNT_REQUIRED_TO_BUILD) return;
            if (this.experience.world.coinsManager.getCurrentAmount() <= 0) return;
            if (intersectedObject.name === 'foundation') {
                this.experience.uiManager.updateCardsPopup(DEFENSE_TYPES,
                    this.experience.world.levelManager.towersData,
                    positionofObject, intersectedObject, this.experience, this.setEnabled.bind(this))
            }
        }
    }

    setEnabled(value = true) {
        this.isEnabled = value;
    }
}
