import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Grass.js'
import Tower from './Tower.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"

export default class Foundation {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Foundation')
        }

        this.resource = this.resources.items['foundation']
        this.tower = null
        this.setGround()
        this.setModel()
        this.setInstance()
    }

    setGround() {
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z } })
    }

    setInstance() {
        this.model.userData.scriptInstance = this
    }

    createTower() {
        if (this.tower == null) {
            this.tower = new Tower({ position: { x: this.position.x, y: 0, z: this.position.z } })
            // this.pushTowerForRaycast()
            this.model.visible = false
        }
    }

    pushTowerForRaycast() {        
        this.experience.world.raycastManager.targets.push(this.tower.model)
    }

    removeTowerFromRaycast() {
        this.experience.world.raycastManager.targets = this.experience.world.raycastManager.targets.filter((target) => target !== this.tower.model)
    }

    setModel() {
        this.model = clone(this.resource.scene)
        this.model.position.set(this.position.x, 0.1, this.position.z)
        this.model.scale.set(0.007, 0.007, 0.006)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.userData.scriptInstance = this
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    update() {
        if (this.tower) {
            this.tower.update()
        }
    }
}
