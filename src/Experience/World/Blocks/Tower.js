// Tower.js
import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Grass.js'
import FireWizard from '../Defenders/FireWizard.js'

export default class Tower {
    static allTowers = [] // store all created towers

    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.position = position
        this.resource = this.resources.items.archerTower

        this.setGround()
        this.setModel()

        // store this tower for later batching
        Tower.allTowers.push(this)

        this.fireWizard = new FireWizard({
            attackRange: 4,
            positionX: this.position.x,
            positionZ: this.position.z,
            scale: 0.25
        })
    }

    setGround() {
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z } })
    }

    setModel() {
        this.model = this.resource.scene.clone(true)
        this.model.position.set(this.position.x, 0, this.position.z - 0.3)
        this.model.scale.set(0.2, 0.2, 0.2)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    // 🔹 Static method to batch all towers
    static combineIntoInstancedMesh(scene) {
        if (Tower.allTowers.length === 0) return

        let sampleTower = Tower.allTowers[0].model
        let meshes = []
        sampleTower.traverse((child) => {
            if (child.isMesh) meshes.push(child)
        })

        // Create one instanced mesh per material
        let instancedMeshes = []
        meshes.forEach((sampleMesh) => {
            const count = Tower.allTowers.length
            const instancedMesh = new THREE.InstancedMesh(
                sampleMesh.geometry,
                sampleMesh.material,
                count
            )
            instancedMesh.castShadow = true
            instancedMesh.receiveShadow = true

            const dummy = new THREE.Object3D()

            Tower.allTowers.forEach((tower, i) => {
                // find the matching child mesh for this tower
                let childMesh = null
                tower.model.traverse((c) => {
                    if (c.isMesh && c.name === sampleMesh.name) {
                        childMesh = c
                    }
                })

                if (childMesh) {
                    dummy.position.copy(childMesh.getWorldPosition(new THREE.Vector3()))
                    dummy.quaternion.copy(childMesh.getWorldQuaternion(new THREE.Quaternion()))
                    dummy.scale.copy(childMesh.getWorldScale(new THREE.Vector3()))
                    dummy.updateMatrix()
                    instancedMesh.setMatrixAt(i, dummy.matrix)
                }
            })

            instancedMesh.instanceMatrix.needsUpdate = true
            scene.add(instancedMesh)
            instancedMeshes.push(instancedMesh)
        })

        // remove + dispose original towers
        Tower.allTowers.forEach((tower) => {
            scene.remove(tower.model)
            tower.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose()
                    if (child.material.map) child.material.map.dispose()
                    child.material.dispose()
                }
            })
        })

        Tower.allTowers = [] // clear memory
        return instancedMeshes
    }

    update(){
        this.fireWizard && this.fireWizard.update()
    }
}
