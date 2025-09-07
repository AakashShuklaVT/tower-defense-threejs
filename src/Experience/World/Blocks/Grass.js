// Grass.js
import * as THREE from "three"
import Experience from "../../Experience.js"

export default class Grass {
    static instances = [] // track all spawned grass models

    constructor(count = 100, excludePositions = []) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.resource = this.resources.items.grass // grass model in resources

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("Grass")
        }
        this.setModel(count, excludePositions)
    }

    /**
     * Generate many grasses at once
     * @param {number} count number of grasses to spawn
     * @param {Array} excludePositions array of {x, z} objects where grass should NOT spawn
     */
    setModel(count = 100, excludePositions = []) {
        const exclusionSet = new Set(
            excludePositions.map(pos => `${Math.round(pos.x)}_${Math.round(pos.z)}`)
        )

        for (let i = 0; i < count; i++) {
            const x = THREE.MathUtils.randFloat(-25, 25)
            const z = THREE.MathUtils.randFloat(-25, 25)

            // 🚫 Skip spawning grass if it’s too close to excluded positions
            if (exclusionSet.has(`${Math.round(x)}_${Math.round(z)}`)) {
                continue
            }

            const model = this.resource.scene.clone()
            const scale = 0.005

            model.position.set(x, 0.05, z)
            model.scale.set(scale, scale, scale)
            model.rotation.x = -Math.PI / 2

            this.scene.add(model)

            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                    child.material.color = new THREE.Color(0x00ff00)
                }
            })

            Grass.instances.push({ model, resource: this.resource })
        }
    }

    static combineIntoInstancedMeshes(scene) {
        if (Grass.instances.length === 0) return

        const original = Grass.instances[0].resource.scene.clone()
        let mergedGeometry = null
        let mergedMaterial = null

        original.traverse((child) => {
            if (child.isMesh) {
                if (!mergedGeometry) mergedGeometry = child.geometry.clone()
                if (!mergedMaterial) mergedMaterial = child.material.clone()
            }
        })

        if (!mergedGeometry || !mergedMaterial) return

        const instancedMesh = new THREE.InstancedMesh(
            mergedGeometry,
            mergedMaterial,
            Grass.instances.length
        )

        const dummy = new THREE.Object3D()
        Grass.instances.forEach((grass, i) => {
            grass.model.updateMatrixWorld(true)
            dummy.position.copy(grass.model.position)
            dummy.quaternion.copy(grass.model.quaternion)
            dummy.scale.copy(grass.model.scale)
            dummy.updateMatrix()

            instancedMesh.setMatrixAt(i, dummy.matrix)

            scene.remove(grass.model)
            grass.model.traverse((child) => {
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
        scene.add(instancedMesh)
    }
}
