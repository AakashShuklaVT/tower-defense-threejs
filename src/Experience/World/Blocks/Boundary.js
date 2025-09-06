import * as THREE from 'three'
import Experience from '../../Experience'
import mergeModelToSingleGeometry from '../../Utils/UtilityFunctions.js'

export default class Boundary {
    static instances = [] // keep track of all created Boundary

    constructor({ position = { x: 0, z: 0 }, rotation = 0, isCornerWall = false }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position
        this.rotation = rotation
        this.isCornerWall = isCornerWall

        // Resource
        this.resource = isCornerWall
            ? this.resources.items.cornerBoundary
            : this.resources.items.boundary

        this.setModel()

        // Store this instance for later batching
        Boundary.instances.push(this)
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x, 0, this.position.z)
        this.model.scale.set(0.5, 0.5, 0.5)
        this.model.rotation.set(0, this.rotation, 0)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    /**
     * Combine all boundaries into instanced meshes,
     * grouped by straight vs corner wall
     */
    static combineIntoInstancedMeshes(scene) {
        const boundaries = Boundary.instances
        if (boundaries.length === 0) return

        // Group by corner/straight
        const grouped = {
            straight: [],
            corner: []
        }

        boundaries.forEach((b) => {
            if (b.isCornerWall) {
                grouped.corner.push(b)
            } else {
                grouped.straight.push(b)
            }
        })

        Object.entries(grouped).forEach(([type, group]) => {
            if (group.length === 0) return

            const original = group[0].resource.scene
            const mergedGeometry = mergeModelToSingleGeometry(original)

            if (!mergedGeometry) return

            let mergedMaterial = null
            original.traverse((child) => {
                if (child.isMesh && !mergedMaterial) {
                    mergedMaterial = child.material.clone()
                }
            })

            const instancedMesh = new THREE.InstancedMesh(
                mergedGeometry,
                mergedMaterial,
                group.length
            )

            const dummy = new THREE.Object3D()
            group.forEach((b, i) => {
                b.model.updateMatrixWorld(true)
                dummy.position.copy(b.model.position)
                dummy.quaternion.copy(b.model.quaternion)
                dummy.scale.copy(b.model.scale)
                dummy.updateMatrix()

                instancedMesh.setMatrixAt(i, dummy.matrix)

                // cleanup old meshes
                scene.remove(b.model)
                b.model.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose()
                        if (child.material.map) child.material.map.dispose()
                        child.material.dispose()
                    }
                })
            })

            instancedMesh.instanceMatrix.needsUpdate = true
            instancedMesh.castShadow = true
            instancedMesh.receiveShadow = true
            instancedMesh.name = `Boundary_${type}`
            scene.add(instancedMesh)
        })

        // ✅ clear static array so they aren’t combined again
        Boundary.instances = []
    }
}
