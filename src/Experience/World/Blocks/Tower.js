// Tower.js
import * as THREE from 'three'
import Experience from '../../Experience.js'
import FireWizard from '../Defenses/FireWizard.js'
import CannonDefense from '../Defenses/CannonDefense.js'
import FreezeDefense from '../Defenses/FreezeDefense.js'
import XBowDefense from '../Defenses/XBowDefense.js'
import { CANNON_RANGE, DEFENSES_STATS } from '../../Configs/GameConfig.js'

export default class Tower {
    static allTowers = [] // store all created towers

    constructor({ position = { x: 0, z: 0 }, name = 'fireWizard' }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.position = position
        this.resource = this.resources.items.archerTower
        this.defenseName = name;
        this.setModel()
        this.coinsManager = this.experience.world.coinsManager;

        // store this tower for later batching
        Tower.allTowers.push(this)

        if (name === 'fireWizard') {
            this.fireWizard = new FireWizard({
                attackRange: DEFENSES_STATS.FIRE_WIZARD.ATTACK_RANGE,
                positionX: this.position.x,
                positionZ: this.position.z,
                scale: 0.35,
                level: 1
            })
            this.coinsManager.subtractFromCurrentAmount(DEFENSES_STATS.FIRE_WIZARD.BUILDING_COST.LV1);
        }
        else if (name === 'cannonDefense') {
            this.cannonDefense = new CannonDefense({
                attackRange: CANNON_RANGE,
                positionX: this.position.x,
                positionZ: this.position.z,
                scale: 0.25
            })
            this.coinsManager.subtractFromCurrentAmount(COST_OF_BUILDINGS.CANNON_TOWER);
        }
        else if (name === 'freezeDefense') {
            this.freezeDefense = new FreezeDefense({
                attackRange: 5,
                positionX: this.position.x,
                positionZ: this.position.z,
                scale: 0.25
            })
        }
        else if (name === 'xBowDefense') {
            this.xBowDefense = new XBowDefense({
                attackRange: 5,
                positionX: this.position.x,
                positionZ: this.position.z,
                scale: 0.25
            })
        }
    }

    setModel() {
        this.model = this.resource.scene.clone(true)
        this.model.position.set(this.position.x, 0, this.position.z)
        this.model.scale.set(0.4, 0.4, 0.4)
        this.scene.add(this.model)
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                child.userData.script = this;
                child.name = 'defensive_tower';
            }
        })
        this.experience.triggerableObjects.push(this.model);
    }

    disposeTower() {
        console.log(this);
        if (this.defenseName === 'fireWizard') {
            const level = this.fireWizard.currentLevel;
            if (level == 1) {
                this.experience.world.coinsManager.addToCurrentAmount(DEFENSES_STATS.FIRE_WIZARD.SELL_AMOUNT.LV_1);
            } else {
                this.experience.world.coinsManager.addToCurrentAmount(DEFENSES_STATS.FIRE_WIZARD.SELL_AMOUNT.LV_2);
            }
        }
        this.scene.remove(this.model)
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()
                if (child.material.map) child.material.map.dispose()
                child.material.dispose()
            }
        })
        // remove from the list
        Tower.allTowers = Tower.allTowers.filter(tower => tower !== this)
        this.fireWizard?.dispose()
        this.fireWizard = null
        this.experience.world.mapGenerator.setupFoundation({ position: this.position })
        this.experience.triggerableObjects = this.experience.triggerableObjects.filter(value => value != this.model);
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

    update() {
        this.fireWizard && this.fireWizard.update()
    }
}
