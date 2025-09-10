import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Grass.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"

export default class Castle {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Castle')
        }

        // Resource
        this.resource = this.resources.items.castle

        this.setGround()
        this.setModel()
    }

    setGround() {
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z } })
        this.ground = new Grass({ position: { x: this.position.x + 1, z: this.position.z } })
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z + 1 } })
        this.ground = new Grass({ position: { x: this.position.x + 1, z: this.position.z + 1 } })
    }

    setModel() {
        this.model = clone(this.resource.scene)
        this.model.position.set(this.position.x + 0.45 , 0, this.position.z )
        this.model.scale.set(0.007, 0.009, 0.007)
        this.model.rotation.set(0, -Math.PI / 2, 0)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }
}
