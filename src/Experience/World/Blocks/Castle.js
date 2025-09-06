import * as THREE from 'three'
import Experience from '../../Experience.js'

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

        this.setModel()
        // this.setAnimation()
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x - 0.5, 0, this.position.z + 2)
        this.model.scale.set(0.0035, 0.0035, 0.0035)
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
