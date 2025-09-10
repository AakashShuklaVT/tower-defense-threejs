import * as THREE from 'three'
import Experience from '../../Experience'

export default class Ground {
    constructor({ length = 20, width = 16, height = 0.1, color = 0x888888 }) {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.length = length
        this.width = width
        this.height = height
        this.color = color

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.BoxGeometry(this.length, this.height, this.width)
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: this.color
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.name = "Ground"
        this.mesh.position.set(0, -0.02, 0)

        this.mesh.castShadow = true
        this.mesh.receiveShadow = true

        this.scene.add(this.mesh)
    }
}
