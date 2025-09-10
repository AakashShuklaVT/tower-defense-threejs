import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../../Experience.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
export default class GoblimonEnemy {
    constructor({ resourceName = 'goblimon', position = { x: 0, y: 0, z: 0 }, scale = 0.15, movePath, speed, levelData }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.speed = speed
        this.health = 100
        this.isDead = false

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('goblimon enemy')
        }

        // Resource (GLTF model from resources)
        this.resource = this.resources.items[resourceName]

        this.setModel(position, scale)
        this.movePath = movePath
        this.startMoving(this.movePath, levelData)
        this.setAnimation()
        this.setInstance()
    }

    setInstance() {
        this.scriptInstance = this
    }

    takeDamage(damage) {
        this.health -= damage
        //('Goblimon health:', this.health);

        if (this.health <= 0) {
            this.die()
        }
    }
    
    die() {
        this.killTweens()
        this.playDeathAnimation()
        this.isDead = true
    }

    killTweens() {
        gsap.killTweensOf(this.model.position)
        gsap.killTweensOf(this.model.rotation)
    }

    dispose() {
        // ✅ Dispose geometries & materials
        this.model.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    // If material is an array
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m) => {
                            if (m.map) m.map.dispose()
                            if (m.normalMap) m.normalMap.dispose()
                            if (m.roughnessMap) m.roughnessMap.dispose()
                            if (m.metalnessMap) m.metalnessMap.dispose()
                            m.dispose()
                        })
                    } else {
                        if (child.material.map) child.material.map.dispose()
                        if (child.material.normalMap) child.material.normalMap.dispose()
                        if (child.material.roughnessMap) child.material.roughnessMap.dispose()
                        if (child.material.metalnessMap) child.material.metalnessMap.dispose()
                        child.material.dispose()
                    }
                }
            }
        })

        // ✅ Remove from scene
        this.scene.remove(this.model)

        // ✅ Dispose animations
        if (this.animation && this.animation.mixer) {
            this.animation.mixer.stopAllAction()
            this.animation.mixer.uncacheRoot(this.model)
        }

        // ✅ Clear references
        this.model = null
        this.resource = null
        this.animation = null
    }

    playDeathAnimation() {
        if (this.isDead) {
            return
        }

        const deathAnimation = this.animation.actions.down
        if (!deathAnimation) {
            this.dispose()
            return
        }

        // Configure to play once
        deathAnimation.setLoop(THREE.LoopOnce, 1)
        deathAnimation.clampWhenFinished = true

        const oldAction = this.animation.actions.current
        if (oldAction && oldAction !== deathAnimation) {
            oldAction.fadeOut(0.2)
        }

        // Reset and play
        deathAnimation.reset()
        deathAnimation.play()
        this.animation.actions.current = deathAnimation

        // Listen for animation finished
        const onFinish = (e) => {
            if (e.action === deathAnimation) {
                //('down animation finished')
                this.animation.mixer.removeEventListener('finished', onFinish)
                this.dispose()
            }
        }
        this.animation.mixer.addEventListener('finished', onFinish)
    }

    setModel(position, scale) {
        this.model = clone(this.resource.scene)

        this.model.scale.set(scale, scale, scale)
        this.model.position.set(position.x, position.y, position.z)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions (renamed set)
        this.animation.actions = {}
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.damage = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.win = this.animation.mixer.clipAction(this.resource.animations[2])
        this.animation.actions.move = this.animation.mixer.clipAction(this.resource.animations[3])
        this.animation.actions.down = this.animation.mixer.clipAction(this.resource.animations[4])
        this.animation.actions.getup = this.animation.mixer.clipAction(this.resource.animations[5])
        this.animation.actions.play_arrowspecial01 = this.animation.mixer.clipAction(this.resource.animations[6])

        // ✅ Default action = move
        this.animation.actions.current = this.animation.actions.move
        this.animation.actions.current.play()

        // Play method
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            if (newAction && newAction !== oldAction) {
                newAction.reset()
                newAction.play()
                newAction.crossFadeFrom(oldAction, 0.4)
                this.animation.actions.current = newAction
            }
        }

        // Debug controls
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => this.animation.play('idle'),
                playDamage: () => this.animation.play('damage'),
                playWin: () => this.animation.play('win'),
                playMove: () => this.animation.play('move'),
                playDown: () => this.animation.play('down'),
                playGetup: () => this.animation.play('getup'),
                playArrowSpecial: () => this.animation.play('play_arrowspecial01'),
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playDamage')
            this.debugFolder.add(debugObject, 'playWin')
            this.debugFolder.add(debugObject, 'playMove')
            this.debugFolder.add(debugObject, 'playDown')
            this.debugFolder.add(debugObject, 'playGetup')
            this.debugFolder.add(debugObject, 'playArrowSpecial')
        }
    }

    startMoving(pathPoints, levelData) {
        if (!pathPoints || pathPoints.length === 0) return;

        const offsetX = levelData.width / 2;
        const offsetZ = levelData.height / 2;

        // Convert grid coords → world coords
        const points = pathPoints.map(p => ({
            x: p.x - offsetX + 0.5,
            z: p.z - offsetZ + 0.5,
            angle: p.angle,
            number: p.number,
        }));

        // Start position
        this.model.position.set(points[0].x, this.model.position.y, points[0].z);
        this.model.rotation.y = THREE.MathUtils.degToRad(points[0].angle);

        let i = 0;

        const moveToNext = () => {
            if (i >= points.length - 1) return;

            const current = points[i];
            const next = points[i + 1];

            const dx = next.x - current.x;
            const dz = next.z - current.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const duration = distance / this.speed;



            // Move toward next point
            gsap.to(this.model.position, {
                x: next.x,
                z: next.z,
                duration,
                ease: 'none',
                onComplete: () => {
                    i++;
                    moveToNext();
                    if (next.angle !== undefined) {
                        // Rotate toward next direction first
                        gsap.to(this.model.rotation, {
                            y: THREE.MathUtils.degToRad(next.angle),
                            duration: 0.2,
                            ease: 'power2.inOut',
                        });
                    }
                }
            });
        };

        moveToNext();
    }

    update() {
        if (this.animation && this.animation.mixer) {
            this.animation.mixer.update(this.time.delta * 0.001)
        }
    }
}
