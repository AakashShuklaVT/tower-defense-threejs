import * as THREE from 'three'
import Experience from '../../Experience.js'

export default class House {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('House')
        }

        // Resource
        this.resource = this.resources.items.house

        this.setModel()
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x, 0, this.position.z)
        this.model.scale.set(0.2, 0.2, 0.15)

        // ✅ Random rotation (0, 90, 180, 270) around Y axis
        const rotations = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
        const randomRotation = rotations[Math.floor(Math.random() * rotations.length)]
        this.model.rotation.set(0, randomRotation, 0)

        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }
}
