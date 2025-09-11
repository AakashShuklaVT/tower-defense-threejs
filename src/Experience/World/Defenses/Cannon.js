import * as THREE from "three"
import Experience from "../../Experience.js"
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"

export default class Cannon {
    static enemies = []
    constructor({ resourceName = "cannon1", position = { x: 0, y: 0, z: 0 }, scale = 0.25, attackRange = 3 }) {
        // === Experience ===
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // === Stats ===
        this.position = position
        this.scale = scale
        this.range = attackRange
        this.attackDamage = 15
        this.splashRange = 2
        this.shotInterval = 2500
        this.lastShot = 0
        this.spheres = []

        // === Model ===
        this.resource = this.resources.items[resourceName]
        this.setModel()

        Cannon.enemies = this.experience.world.getEnemies()

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("cannon")
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
    spawnSphere(target) {
        if (!target?.model) return

        const sphere = {}

        // === Mesh ===
        sphere.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * this.scale, 16, 16),
            new THREE.MeshStandardMaterial({ color: "gray", metalness: 0.7, roughness: 0.4 })
        )

        // Start position (barrel mouth)
        const spawnPos = this.model.position.clone().add(new THREE.Vector3(0, 2.1 * this.scale, 0))
        sphere.mesh.position.copy(spawnPos)
        this.scene.add(sphere.mesh)

        // === Projectile Physics ===
        const dir = target.model.position.clone().sub(spawnPos).normalize()
        const speed = 0.15
        sphere.velocity = dir.multiplyScalar(speed)
        sphere.velocity.y += 0.05 // give arc

        sphere.life = 0 // time to live
        sphere.update = () => this.updateSphere(sphere)

        this.spheres.push(sphere)
    }

    updateSphere(sphere) {
        if (!sphere.mesh) return

        // Gravity effect
        sphere.velocity.y -= 0.003
        sphere.mesh.position.add(sphere.velocity)

        sphere.life += this.time.delta
        if (sphere.life > 5000) { // auto-remove after 5s
            this.disposeSphere(sphere)
            return
        }

        // Check ground hit
        if (sphere.mesh.position.y <= 0.1) {
            this.applySplashDamage(sphere.mesh.position)
            this.disposeSphere(sphere)
        }
    }

    applySplashDamage(hitPos) {
        Cannon.enemies.forEach(enemy => {
            if (!enemy.model || enemy.isDead) return
            const dist = enemy.model.position.distanceTo(hitPos)
            if (dist <= this.splashRange) {
                enemy.takeDamage(this.attackDamage)
                if (enemy.health <= 0) {
                    this.removeEnemy(enemy)
                }
            }
        })
    }

    removeEnemy(enemy) {
        Cannon.enemies.splice(Cannon.enemies.indexOf(enemy), 1)
    }

    /* -----------------------
       Update Loop
    ------------------------*/
    getNearestEnemy() {
        if (!Cannon.enemies?.length) return null
        let nearest = null
        let minDist = Infinity

        Cannon.enemies.forEach(enemy => {
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

    updateSpheres() {
        for (let i = this.spheres.length - 1; i >= 0; i--) {
            const sphere = this.spheres[i]
            if (!sphere?.mesh) {
                this.disposeSphere(sphere)
                this.spheres.splice(i, 1)
                continue
            }
            sphere.update()
        }
    }

    update() {
        const nearest = this.getNearestEnemy()
        if (nearest) {
            this.model.lookAt(nearest.model.position.x, this.model.position.y, nearest.model.position.z)

            const now = performance.now()
            if (now - this.lastShot > this.shotInterval) {
                this.spawnSphere(nearest)
                this.lastShot = now
            }
        }

        this.updateSpheres()
    }

    /* -----------------------
       Cleanup
    ------------------------*/
    disposeSphere(sphere) {
        if (!sphere) return
        if (sphere.mesh) {
            this.scene.remove(sphere.mesh)
            sphere.mesh.geometry?.dispose()
            sphere.mesh.material?.dispose()
        }
        sphere.mesh = null
        this.spheres.splice(this.spheres.indexOf(sphere), 1)
    }

    dispose() {
        // Dispose spheres
        this.spheres.forEach(s => this.disposeSphere(s))
        this.spheres = []

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

        this.model = null
    }
}
