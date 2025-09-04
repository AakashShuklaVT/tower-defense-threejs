import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Grass {
    constructor({  length = 1,  width = 1,  height = 0.1,  position = { x: 0, z: 0 }, color = 0x00f00, textureRepeat = { x: 1.5, y: 1.5 }}) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.length = length
        this.width = width
        this.height = height
        this.position = position
        this.color = color
        this.textureRepeat = textureRepeat

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry() {
        this.geometry = new THREE.BoxGeometry(this.length, this.height, this.width)
    }

    setTextures() {
        this.textures = {}
        
        if (this.resources.items.grassColorTexture) {
            this.textures.color = this.resources.items.grassColorTexture
            this.textures.color.colorSpace = THREE.SRGBColorSpace
            this.textures.color.repeat.set(this.textureRepeat.x, this.textureRepeat.y)
            this.textures.color.wrapS = THREE.RepeatWrapping
            this.textures.color.wrapT = THREE.RepeatWrapping
        }

        if (this.resources.items.grassNormalTexture) {
            this.textures.normal = this.resources.items.grassNormalTexture
            this.textures.normal.repeat.set(this.textureRepeat.x, this.textureRepeat.y)
            this.textures.normal.wrapS = THREE.RepeatWrapping
            this.textures.normal.wrapT = THREE.RepeatWrapping
        }
    }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: this.color
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.mesh.position.set(
            this.position.x,
            0,
            this.position.z
        )

        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }
}
