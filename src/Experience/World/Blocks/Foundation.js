import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Ground.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"

export default class Foundation {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.eventEmitter = this.experience.eventEmitter
        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Foundation')
        }

        this.resource = this.resources.items['foundation']
        this.tower = null
        this.setModel()
        this.setInstance()
    }

    setInstance() {
        this.model.userData.scriptInstance = this
    }

    onFoundationClick(object) {
        if (!object || !object.userData.scriptInstance) return

        this.eventEmitter.trigger(
            'foundationSelected',
            [object.userData.scriptInstance]
        )
    }
    
    getTower() {
        return this.tower
    }
    
    setTower(tower) {
        this.tower = tower
        this.model.visible = false
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
}
