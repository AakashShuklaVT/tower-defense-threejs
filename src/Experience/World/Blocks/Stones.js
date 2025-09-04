import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Grass.js'
const STONE_SCALING = {
    0: 1.5,
    1: 0.001,
    2: 0.9,
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
        this.stoneTypes = ['stone1', 'stone2', 'stone3']
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
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x, this.selectedStone !== 1 ? 0 : -0.2, this.position.z)
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

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions
        this.animation.actions = {}
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Play the action
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }

        // Debug
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => { this.animation.play('idle') },
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') }
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
        }
    }

    update() {
        // if (this.animation?.mixer) {
        //     this.animation.mixer.update(this.time.delta * 0.001)
        // }
    }
}
