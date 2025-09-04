import * as THREE from 'three'
import Experience from '../../Experience.js'
import Grass from './Grass.js'

export default class Castle {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Castle')
        }

        // Resource
        this.resource = this.resources.items.castle

        this.setGround()
        this.setModel()
        // this.setAnimation()
    }

    setGround() {
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z } })
        this.ground = new Grass({ position: { x: this.position.x + 1, z: this.position.z } })
        this.ground = new Grass({ position: { x: this.position.x, z: this.position.z + 1 } })
        this.ground = new Grass({ position: { x: this.position.x + 1, z: this.position.z + 1 } })
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.position.set(this.position.x - 0.5, 0, this.position.z + 2)
        this.model.scale.set(0.0035, 0.0035, 0.0035)
        this.model.rotation.set(0, -Math.PI / 2, 0)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
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
