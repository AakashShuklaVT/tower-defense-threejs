import * as THREE from 'three'
import Experience from '../../Experience.js'

export default class Foundation {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.position = position
        this.setMesh()
    }


    setMesh() {
        this.mesh = this.resources.items.foundation.scene.clone()
        this.mesh.position.set(this.position.x - 4.6, 0.05, this.position.z - 2.8)
        this.mesh.scale.set(0.1, 0.1, 0.1)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.script = this;
            }
        })
        this.scene.add(this.mesh)
        // //(this.mesh);

        this.experience.triggerableObjects.push(this.mesh)
    }

    disposeObject() {
        this.mesh.removeFromParent()
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                child.material.dispose()
            }
        })
    }
}       
