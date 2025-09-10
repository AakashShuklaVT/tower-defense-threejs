import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Ground.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"

const STONE_SCALING = {
    0: 0.4,
    1: 1,
    2: 0.4,
    3: 0.4,
}

export default class Stones {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Trees')
        }
        // Resource
        this.stoneTypes = ['stone1', 'stone2', 'stone3', 'stone4']
        this.selectedStone = Math.floor(Math.random() * this.stoneTypes.length)
        this.stoneType = this.stoneTypes[this.selectedStone]
        this.resource = this.resources.items[this.stoneType]
        this.setGround()
        this.setModel()
    }

    setGround() {
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z } })
    }

    setModel() {
        this.model = clone(this.resource.scene)
        this.model.position.set(this.position.x, this.selectedStone !== 1 ? 0.27 : 0, this.position.z)
        this.model.rotation.set(0, Math.floor(Math.PI * 2 * Math.random()), 0)
        this.model.scale.set(STONE_SCALING[this.selectedStone], STONE_SCALING[this.selectedStone], STONE_SCALING[this.selectedStone])
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                child.material.color = new THREE.Color(0xaaaaaa)
            }
        })
    }
}
