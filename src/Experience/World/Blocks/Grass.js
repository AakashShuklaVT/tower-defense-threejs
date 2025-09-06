import * as THREE from 'three'
import Experience from '../../Experience'

export default class Grass {
    static instances = [] // track all individual grass meshes

    constructor({ length = 1, width = 1, height = 0.1, position = { x: 0, z: 0 }, color = 0x00ff00, textureRepeat = { x: 1.5, y: 1.5 } }) {
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

        Grass.instances.push(this)
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
            color: this.color,
            map: this.textures.color || null,
            normalMap: this.textures.normal || null
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(this.position.x, 0, this.position.z)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    /**
     * Static function to generate multiple grass blades randomly
     * Returns a single InstancedMesh for performance
     */
    static generateGrass({ count = 50, areaSize = { x: 1, z: 1 }, length = 1, width = 1, height = 0.1, color = 0x00ff00 }) {
        // Clear any previous grass instances
        Grass.instances.forEach(g => g.scene.remove(g.mesh))
        Grass.instances = []

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * areaSize.x
            const z = (Math.random() - 0.5) * areaSize.z
            new Grass({ length, width, height, position: { x, z }, color })
        }

        return Grass.combineGrassInstances('grass_instanced')
    }

    /**
     * Combine only grass meshes into InstancedMesh
     */
    static combineGrassInstances(name = 'grass') {
        if (Grass.instances.length === 0) return null

        const first = Grass.instances[0]
        const geometry = first.geometry.clone()
        const material = first.material.clone()
        const count = Grass.instances.length

        const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
        instancedMesh.name = name
        instancedMesh.castShadow = true
        instancedMesh.receiveShadow = true

        const dummy = new THREE.Object3D()
        Grass.instances.forEach((grass, i) => {
            dummy.position.copy(grass.mesh.position)
            dummy.scale.copy(grass.mesh.scale)
            dummy.rotation.copy(grass.mesh.rotation)
            dummy.updateMatrix()
            instancedMesh.setMatrixAt(i, dummy.matrix)

            // remove old mesh
            grass.scene.remove(grass.mesh)
            grass.geometry.dispose()
            grass.material.dispose()
        })

        instancedMesh.instanceMatrix.needsUpdate = true

        first.scene.add(instancedMesh)
        Grass.instances = [] // clear list

        return instancedMesh
    }
}
