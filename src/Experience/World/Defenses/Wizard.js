import * as THREE from 'three'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
import Experience from '../../Experience.js'
import gsap from 'gsap'

export default class Wizard {
    static enemies = []
    constructor({ resourceName = 'wizard', position = { x: 0, y: 0, z: 0 }, scale = 0.25, attackRange = 4 }) {
        // === Experience & Resources ===
        //('wizard created');

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // === Stats ===
        this.position = position
        this.scale = scale
        this.range = attackRange
        this.attackDamage = 10
        this.fireballInterval = 2000
        this.lastShot = 0
        this.fireballs = []

        // === Setup ===
        this.resource = this.resources.items[resourceName]
        this.setModel()
        this.setAnimation()

        Wizard.enemies = this.experience.world.getEnemies()

        // Debug UI
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('wizard')
        }
    }

    /* -----------------------
       Setup & Initialization
    ------------------------*/
    setModel() {
        this.model = clone(this.resource.scene)
        this.model.position.set(this.position.x, this.position.y, this.position.z)
        this.model.rotation.set(0, Math.PI, 0)
        this.model.scale.setScalar(this.scale)
        this.scene.add(this.model)

        this.model.traverse(child => {
            if (child.isMesh) child.castShadow = true
        })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {
            idle: this.animation.mixer.clipAction(this.resource.animations[0]),
            fire: this.animation.mixer.clipAction(this.resource.animations[1]),
        }

        // Default state
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Fire animation one-shot
        const fireAction = this.animation.actions.fire
        fireAction.clampWhenFinished = true
        fireAction.loop = THREE.LoopOnce

        this.animation.mixer.addEventListener('finished', (e) => {
            if (e.action === fireAction) this.animation.play('idle')
        })

        // Crossfade utility
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current
            if (!newAction || newAction === oldAction) return

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 0.3, true)
            this.animation.actions.current = newAction
        }
    }

    /* -----------------------
       Combat Methods
    ------------------------*/
    spawnFireball(target) {
        if (!target) return
        const fireAction = this.animation.actions.fire
        this.animation.play('fire')

        // Halfway through fire animation → launch fireball
        const delay = fireAction.getClip().duration / 2
        gsap.delayedCall(delay, () => this.createFireball(target))
    }

    createFireball(target) {
        const fireball = {}

        // === Mesh ===
        fireball.mesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.5 * this.scale),
            new THREE.MeshPhysicalMaterial({ color: "orange", roughness: 0, metalness: 0.6 })
        )

        // Spawn in front of wizard
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.quaternion).normalize()
        const spawnPos = this.model.position.clone()
            .add(forward.clone().multiplyScalar(0.5 * this.scale))
            .add(new THREE.Vector3(0, 1.5 * this.scale, 0))

        fireball.mesh.position.copy(spawnPos)
        this.scene.add(fireball.mesh)

        // === Particles ===
        this.addFireballTrail(fireball, spawnPos)

        // Target & update logic
        fireball.target = target
        fireball.update = () => this.updateFireball(fireball)

        this.fireballs.push(fireball)
    }

    addFireballTrail(fireball, spawnPos) {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 128
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(64, 64, 48, 0, Math.PI * 2)
        ctx.fill()
        const texture = new THREE.CanvasTexture(canvas)

        const N = 200, M = 3
        const geometry = new THREE.BufferGeometry()
        const position = new THREE.BufferAttribute(new Float32Array(3 * N), 3)
        const color = new THREE.BufferAttribute(new Float32Array(3 * N), 3)
        const v = new THREE.Vector3()
        let idx = 0

        for (let i = 0; i < N; i++) {
            position.setXYZ(i, spawnPos.x, spawnPos.y, spawnPos.z)
            color.setXYZ(i, 1, 0.5, 0)
        }

        geometry.setAttribute('position', position)
        geometry.setAttribute('color', color)

        const material = new THREE.PointsMaterial({
            size: 0.4 * this.scale,
            vertexColors: true,
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        fireball.cloud = new THREE.Points(geometry, material)
        this.scene.add(fireball.cloud)

        // Save particle data
        fireball._particleData = { N, M, position, color, v, idx }
    }

    updateFireball(fireball) {
        if (!fireball.mesh || !fireball.target?.model) {
            this.disposeFireball(fireball)
            return
        }

        // Move fireball
        this.moveFireball(fireball)

        // Check collision and apply damage
        if (this.checkCollision(fireball)) return

        // Update particle effect
        this.updateFireballParticles(fireball)
    }

    moveFireball(fireball) {
        const dir = fireball.target.model.position.clone()
            .sub(fireball.mesh.position)
            .normalize()

        const speed = 0.08
        fireball.mesh.position.add(dir.multiplyScalar(speed))
    }

    checkCollision(fireball) {
        const dist = fireball.mesh.position.distanceTo(fireball.target.model.position)

        if (dist < 0.5 * this.scale) {
            this.applyDamage(fireball)
            return true
        }
        return false
    }

    applyDamage(fireball) {
        const target = fireball.target
        if (!target.isDead && target.health > 0) {
            target.takeDamage(this.attackDamage)
            if (target.health <= 0) {
                this.onTargetDie(target)
            }
        }
        else if (!target.isDead) {
            this.onTargetDie(target)
        }
        this.disposeFireball(fireball)
    }

    onTargetDie(target) {
        this.removeEnemyFromTarget(target)
    }

    removeEnemyFromTarget(target) {
        Wizard.enemies.splice(Wizard.enemies.indexOf(target), 1)
    }

    updateFireballParticles(fireball) {
        const { N, M, position, color, v } = fireball._particleData
        let idx = fireball._particleData.idx

        // Spawn new particles
        for (let j = 0; j < M; j++) {
            v.randomDirection().divideScalar(16).add(fireball.mesh.position)
            position.setXYZ(idx, v.x, v.y, v.z)
            color.setXYZ(idx, 1, 0.5, 0)
            idx = (idx + 1) % N
        }

        // Fade older particles
        let k = 1
        for (let j = idx + N; j > idx - M; j--) {
            color.setXYZ(j % N, k, k * 0.5, 0)
            k *= 0.98
        }

        position.needsUpdate = true
        color.needsUpdate = true
        fireball._particleData.idx = idx
    }


    disposeFireball(fireball) {
        if (!fireball) return

        if (fireball.mesh) {
            this.scene.remove(fireball.mesh)
            fireball.mesh.geometry?.dispose()
            fireball.mesh.material?.dispose()
        }

        if (fireball.cloud) {
            this.scene.remove(fireball.cloud)
            fireball.cloud.geometry?.dispose()
            fireball.cloud.material?.dispose()
        }

        fireball.mesh = null
        fireball.cloud = null
        this.fireballs.splice(this.fireballs.indexOf(fireball), 1)
    }

    /* -----------------------
       Targeting
    ------------------------*/
    getNearestEnemy() {
        if (!Wizard.enemies?.length) return null
        let nearest = null
        let minDist = Infinity

        Wizard.enemies.forEach(enemy => {
            if (enemy.model) {
                const dist = this.model.position.distanceTo(enemy.model.position)
                if (dist < minDist && dist <= this.range) {
                    minDist = dist
                    nearest = enemy
                }
            }
        })
        return nearest
    }

    /* -----------------------
       Update Loop
    ------------------------*/
    updateFireballs() {
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            const fireball = this.fireballs[i]
            if (!fireball?.mesh) {
                this.disposeFireball(fireball)
                this.fireballs.splice(i, 1)
                continue
            }
            fireball.update()
        }
    }

    update() {
        // Animate
        if (this.animation.mixer) {
            this.animation.mixer.update(this.time.delta * 0.001)
        }

        // Target & attack
        const nearest = this.getNearestEnemy()
        if (nearest) {
            this.model.lookAt(nearest.model.position.x, this.model.position.y, nearest.model.position.z)

            const now = performance.now()
            if (now - this.lastShot > this.fireballInterval) {
                this.spawnFireball(nearest)
                this.lastShot = now
            }
        }

        // Fireball updates
        this.updateFireballs()
    }

    /* -----------------------
       Cleanup
    ------------------------*/
    dispose() {
        // Dispose fireballs
        this.fireballs.forEach(f => this.disposeFireball(f))
        this.fireballs = []

        // Remove model
        if (this.model) {
            this.scene.remove(this.model)
            this.model.traverse(child => {
                if (child.isMesh) {
                    child.geometry?.dispose()
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose())
                        } else {
                            child.material.dispose()
                        }
                    }
                }
            })
        }

        // Stop animations
        if (this.animation?.mixer) {
            this.animation.mixer.stopAllAction()
            this.animation.mixer.uncacheRoot(this.model)
        }

        this.model = null
        this.animation = null
    }
}
