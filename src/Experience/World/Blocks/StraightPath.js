import * as THREE from 'three'
import Experience from '../../Experience.js'

export default class StraightPath {
    static instances = [] // track all created paths

    constructor({
        length = 1,
        width = 1,
        height = 0.1,
        position = { x: 0, z: 0 },
        color = 0x3d251e,
    }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.length = length
        this.width = width
        this.height = height
        this.position = position
        this.color = color
        // this.textureRepeat = textureRepeat

        this.setGeometry()
        // this.setTextures()
        this.setMaterial()
        this.setMesh()

        StraightPath.instances.push(this)
    }

    setGeometry() {
        this.geometry = new THREE.BoxGeometry(this.length, this.height, this.width)
    }

    // setTextures() {
    //     this.textures = {}

    //     if (this.resources.items.grassColorTexture) {
    //         this.textures.color = this.resources.items.grassColorTexture
    //         this.textures.color.colorSpace = THREE.SRGBColorSpace
    //         this.textures.color.repeat.set(this.textureRepeat.x, this.textureRepeat.y)
    //         this.textures.color.wrapS = THREE.RepeatWrapping
    //         this.textures.color.wrapT = THREE.RepeatWrapping
    //     }

    //     if (this.resources.items.grassNormalTexture) {
    //         this.textures.normal = this.resources.items.grassNormalTexture
    //         this.textures.normal.repeat.set(this.textureRepeat.x, this.textureRepeat.y)
    //         this.textures.normal.wrapS = THREE.RepeatWrapping
    //         this.textures.normal.wrapT = THREE.RepeatWrapping
    //     }
    // }

    setMaterial() {
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            // map: this.textures.color || null,
            // normalMap: this.textures.normal || null
        })
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(this.position.x, 0.01, this.position.z)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.scene.add(this.mesh)
    }

    /**
     * Collapse all StraightPath meshes into one InstancedMesh
     */
    static combineIntoInstancedMesh(scene) {
        if (StraightPath.instances.length === 0) return

        const sample = StraightPath.instances[0]

        // shared geometry + material
        const geometry = sample.geometry.clone()
        const material = sample.material.clone()

        const instancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            StraightPath.instances.length
        )

        const dummy = new THREE.Object3D()
        StraightPath.instances.forEach((path, i) => {
            path.mesh.updateMatrixWorld(true)
            dummy.position.copy(path.mesh.position)
            dummy.quaternion.copy(path.mesh.quaternion)
            dummy.scale.copy(path.mesh.scale)
            dummy.updateMatrix()

            instancedMesh.setMatrixAt(i, dummy.matrix)

            // cleanup old mesh
            scene.remove(path.mesh)
            path.geometry.dispose()
            if (path.material.map) path.material.map.dispose()
            if (path.material.normalMap) path.material.normalMap.dispose()
            path.material.dispose()
        })

        instancedMesh.instanceMatrix.needsUpdate = true
        instancedMesh.castShadow = true
        instancedMesh.receiveShadow = true
        scene.add(instancedMesh)

        // clear old refs
        StraightPath.instances = []
        return instancedMesh
    }
}
