import * as THREE from 'three'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
import Experience from '../../Experience.js'
import gsap from 'gsap'

export default class Freeze {
    static enemies = []
    constructor({ resourceName = 'freeze1', position = { x: 0, y: 0, z: 0 }, scale = 0.25, attackRange = 4 }) {
        // === Experience & Resources ===
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // === Stats ===
        this.position = position
        this.scale = scale
        this.range = attackRange
        this.freezeDuration = 1000 // ms
        this.iceballInterval = 2000 // 2s between shots
        this.lastShot = 0
        this.iceballs = []

        // === Setup ===
        this.resource = this.resources.items[resourceName]
        this.setModel()

        Freeze.enemies = this.experience.world.getEnemies()

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Freeze')
        }
    }

    /* -----------------------
       Setup
    ------------------------*/
    setModel() {
        this.model = clone(this.resource.scene)
        this.model.position.set(this.position.x, this.position.y, this.position.z)
        this.model.rotation.set(0, Math.random() * Math.PI * 2, 0)
        this.model.scale.setScalar(this.scale)
        this.scene.add(this.model)

        this.model.traverse(child => {
            if (child.isMesh) child.castShadow = true
        })
    }

    /* -----------------------
       Combat
    ------------------------*/
    spawnIceball(target) {
        if (!target) return
        this.createIceball(target)
    }

    createIceball(target) {
        const iceball = {}

        // === Mesh ===
        iceball.mesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.5 * this.scale),
            new THREE.MeshPhysicalMaterial({
                color: "deepskyblue",
                roughness: 0.2,
                metalness: 0.3,
                transparent: true,
                opacity: 0.9
            })
        )

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.quaternion).normalize()
        const spawnPos = this.model.position.clone()
            .add(forward.clone().multiplyScalar(0.5 * this.scale))
            .add(new THREE.Vector3(0, 1.5 * this.scale, 0))

        iceball.mesh.position.copy(spawnPos)
        this.scene.add(iceball.mesh)

        iceball.target = target
        iceball.update = () => this.updateIceball(iceball)

        this.iceballs.push(iceball)
    }

    updateIceball(iceball) {
        if (!iceball.mesh || !iceball.target?.model) {
            this.disposeIceball(iceball)
            return
        }

        // Move
        const dir = iceball.target.model.position.clone()
            .sub(iceball.mesh.position)
            .normalize()
        iceball.mesh.position.add(dir.multiplyScalar(0.12))

        // Collision
        const dist = iceball.mesh.position.distanceTo(iceball.target.model.position)
        if (dist < 0.5 * this.scale) {
            this.applyFreeze(iceball)
            return
        }

        // Ground check
        if (iceball.mesh.position.y <= 0.1) {
            this.createFreezeSplash(iceball.mesh.position, "ground")
            this.disposeIceball(iceball)
        }
    }

    applyFreeze(iceball) {
        const target = iceball.target
        if (!target.isDead && target.health > 0) {
            target.freeze(this.freezeDuration)
            if (target.health <= 0) this.removeEnemyFromTarget(target)
        }
        else if (!target.isDead) {
            this.removeEnemyFromTarget(target)
        }

        // ❄️ splash in the air at collision point
        this.createFreezeSplash(iceball.mesh.position, "air")
        this.disposeIceball(iceball)
    }

    createFreezeSplash(position, type) {
        const geometry = new THREE.SphereGeometry(1 * this.scale, 8, 8)
        const material = new THREE.MeshBasicMaterial({
            color: "lightblue",
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        })
        const splash = new THREE.Mesh(geometry, material)
        splash.position.copy(position)

        let splashRadius = 2.5 * this.scale

        if (type === "ground") {
            splash.position.y = 0.1 // flatten on ground
            splash.scale.set(1.5, 0.2, 1.5)
            splashRadius = 3 * this.scale
        } else {
            splash.scale.set(1, 1, 1)
            splashRadius = 2 * this.scale
        }

        this.scene.add(splash)

        // ❄️ Freeze enemies in splash radius based on type (y-axis check)
        Freeze.enemies.forEach(enemy => {
            if (!enemy?.model) return
            const dist = splash.position.distanceTo(enemy.model.position)
            if (dist <= splashRadius) {
                const enemyY = enemy.model.position.y

                if (type === "ground" && enemyY <= 2) {
                    enemy.freeze(this.freezeDuration)
                } 
                else if (type === "air" && enemyY > 2) {
                    enemy.freeze(this.freezeDuration)
                }
            }
        })

        // animate fade + remove
        gsap.to(splash.material, {
            opacity: 0,
            duration: 0.6,
            ease: "power1.out",
            onComplete: () => {
                this.scene.remove(splash)
                splash.geometry.dispose()
                splash.material.dispose()
            }
        })
    }

    removeEnemyFromTarget(target) {
        Freeze.enemies.splice(Freeze.enemies.indexOf(target), 1)
    }

    disposeIceball(iceball) {
        if (!iceball) return
        if (iceball.mesh) {
            this.scene.remove(iceball.mesh)
            iceball.mesh.geometry?.dispose()
            iceball.mesh.material?.dispose()
        }
        this.iceballs.splice(this.iceballs.indexOf(iceball), 1)
    }

    /* -----------------------
       Targeting
    ------------------------*/
    getNearestEnemy() {
        if (!Freeze.enemies?.length) return null
        let nearest = null
        let minDist = Infinity

        Freeze.enemies.forEach(enemy => {
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
    updateIceballs() {
        for (let i = this.iceballs.length - 1; i >= 0; i--) {
            const iceball = this.iceballs[i]
            if (!iceball?.mesh) {
                this.disposeIceball(iceball)
                this.iceballs.splice(i, 1)
                continue
            }
            iceball.update()
        }
    }

    update() {
        const nearest = this.getNearestEnemy()
        if (nearest) {
            const now = performance.now()
            if (now - this.lastShot > this.iceballInterval) {
                this.spawnIceball(nearest)
                this.lastShot = now
            }
        }

        this.updateIceballs()
    }

    /* -----------------------
       Cleanup
    ------------------------*/
    dispose() {
        this.iceballs.forEach(b => this.disposeIceball(b))
        this.iceballs = []

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

        if (this.animation?.mixer) {
            this.animation.mixer.stopAllAction()
            this.animation.mixer.uncacheRoot(this.model)
        }

        this.model = null
        this.animation = null
    }
}
