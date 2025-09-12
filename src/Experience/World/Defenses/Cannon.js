import * as THREE from "three";
import Experience from "../../Experience.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import gsap from "gsap";

export default class Cannon {
    static enemies = [];

    constructor({
        resourceName = "cannon",
        position = { x: 0, y: 0, z: 0 },
        scale = 0.4,
        attackRange = 3,
    } = {}) {
        // === Experience ===
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        this.debug = this.experience.debug;

        // === Stats / tuning ===
        this.position = position;
        this.scale = scale;
        this.range = attackRange;
        this.attackDamage = 15;
        this.splashRange = 2;
        this.shotInterval = 2500; // ms between shots
        this.shotDelay = 800;    // wait before first shot
        this.lastShot = performance.now() + this.shotDelay;
        this.spheres = [];

        // Gravity: this is the per-frame decrement applied to velocity.y in updateSphere.
        this.gravity = 0.003;

        // === Model ===
        this.resource = this.resources.items[resourceName];
        this.setModel();

        // get enemies reference (your world.getEnemies())
        Cannon.enemies = this.experience.world.getEnemies();

        if (this.debug?.active) {
            this.debugFolder = this.debug.ui.addFolder("cannon");
        }
    }

    /* -----------------------
       Setup
    ------------------------*/
    setModel() {
        this.model = clone(this.resource.scene);
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.rotation.set(0, 0, 0);
        this.model.scale.setScalar(this.scale);
        this.scene.add(this.model);
        this.barrel = null;
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                if (child.name === "Object_5") {
                    this.barrel = child;
                }
            }
        });
        this.initialPos = this.barrel.position;
    }

    /* -----------------------
       Combat
    ------------------------*/
    spawnSphere(target) {
        if (!target?.model) return;

        // Barrel squash + recoil animation
        gsap.to(this.barrel.scale, {
            x: this.barrel.scale.x,
            y: this.barrel.scale.y,
            z: this.barrel.scale.z - 0.2,
            duration: 0.2,
            ease: "power1.inOut",
            onComplete: () => {
                gsap.to(this.barrel.scale, {
                    x: this.barrel.scale.x,
                    y: this.barrel.scale.y,
                    z: this.barrel.scale.z + 0.2,
                    duration: 0.2,
                    ease: "power1.inOut",
                    onComplete: () => {
                        gsap.to(this.barrel.scale, {
                            x: this.barrel.scale.x,
                            y: this.barrel.scale.y,
                            z: this.barrel.scale.z,
                            duration: 0.1,
                            ease: "power1.inOut",
                        });
                    },
                });
            },
        });

        gsap.to(this.barrel.position, {
            x: this.initialPos.x + 1,
            y: this.initialPos.y,
            z: this.initialPos.z,
            duration: 0.1,
            ease: "power1.inOut",
            onComplete: () => {
                gsap.to(this.barrel.position, {
                    x: this.initialPos.x - 1,
                    y: this.initialPos.y,
                    z: this.initialPos.z,
                    duration: 0.1,
                    ease: "power1.inOut",
                });
            },
        });

        const sphere = {};

        // === Mesh ===
        sphere.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * this.scale, 16, 16),
            new THREE.MeshStandardMaterial({
                color: "black",
                metalness: 0.7,
                roughness: 0.4,
            })
        );

        // Start position (barrel mouth)
        const spawnPos = this.model.position
            .clone()
            .add(new THREE.Vector3(0, 2.1 * this.scale, 0));
        sphere.mesh.position.copy(spawnPos);
        this.scene.add(sphere.mesh);

        // === Projectile Physics ===
        const targetPos = target.model.position.clone();
        targetPos.y += 0.5 * this.scale; // aim slightly above target

        const distance = spawnPos.distanceTo(targetPos);
        const arcHeight = Math.max(2.5 * this.scale, distance * 0.6 * this.scale); // ⬅ higher arc

        const initVel = this.computeLaunchVelocity(
            spawnPos,
            targetPos,
            arcHeight,
            this.gravity
        );

        if (!initVel) {
            // fallback: simple forward shot
            const dir = targetPos.clone().sub(spawnPos).normalize();
            sphere.velocity = dir.multiplyScalar(0.15);
            sphere.velocity.y += 0.05;
        } else {
            sphere.velocity = initVel;
        }

        sphere.life = 0;
        sphere.update = () => this.updateSphere(sphere);

        this.spheres.push(sphere);
    }

    computeLaunchVelocity(spawn, target, peakOffset, g) {
        if (g <= 0) return null;

        const peakY = Math.max(spawn.y, target.y) + Math.abs(peakOffset);
        if (peakY <= spawn.y + 1e-6) return null;

        const tUp = Math.sqrt((2 * (peakY - spawn.y)) / g);
        const tDown = Math.sqrt((2 * (peakY - target.y)) / g);

        const t = tUp + tDown;
        if (!isFinite(t) || t <= 0) return null;

        const offset = new THREE.Vector3().copy(target).sub(spawn);
        offset.y += 0.5 * g * t * t;

        return offset.divideScalar(t);
    }

    updateSphere(sphere) {
        if (!sphere.mesh) return;

        sphere.velocity.y -= this.gravity;
        sphere.mesh.position.add(sphere.velocity);

        sphere.life += this.time.delta;
        if (sphere.life > 5000) {
            this.disposeSphere(sphere);
            return;
        }

        if (sphere.mesh.position.y <= 0.1) {
            this.applySplashDamage(sphere.mesh.position);
            this.disposeSphere(sphere);
        }
    }

    applySplashDamage(hitPos) {
        Cannon.enemies.forEach((enemy) => {
            if (!enemy.model || enemy.isDead) return;
            const dist = enemy.model.position.distanceTo(hitPos);
            if (dist <= this.splashRange) {
                enemy.takeDamage(this.attackDamage);
                if (enemy.health <= 0) {
                    this.removeEnemy(enemy);
                }
            }
        });
    }

    removeEnemy(enemy) {
        const i = Cannon.enemies.indexOf(enemy);
        if (i !== -1) Cannon.enemies.splice(i, 1);
    }

    /* -----------------------
       Update Loop
    ------------------------*/
    getNearestEnemy() {
        if (!Cannon.enemies?.length) return null;
        let nearest = null;
        let minDist = Infinity;

        Cannon.enemies.forEach((enemy) => {
            if (enemy.model) {
                const dist = this.model.position.distanceTo(enemy.model.position);
                if (dist < minDist && dist <= this.range) {
                    minDist = dist;
                    nearest = enemy;
                }
            }
        });
        return nearest;
    }

    updateSpheres() {
        for (let i = this.spheres.length - 1; i >= 0; i--) {
            const sphere = this.spheres[i];
            if (!sphere?.mesh) {
                this.disposeSphere(sphere);
                this.spheres.splice(i, 1);
                continue;
            }
            sphere.update();
        }
    }

    update() {
        const nearest = this.getNearestEnemy();
        if (nearest) {
            const now = performance.now();
            if (now - this.lastShot > this.shotInterval) {
                this.spawnSphere(nearest);
                this.lastShot = now;
            }
        }

        this.updateSpheres();
    }

    /* -----------------------
       Cleanup
    ------------------------*/
    disposeSphere(sphere) {
        if (!sphere) return;
        if (sphere.mesh) {
            this.scene.remove(sphere.mesh);
            sphere.mesh.geometry?.dispose();
            sphere.mesh.material?.dispose();
        }
        sphere.mesh = null;
        const idx = this.spheres.indexOf(sphere);
        if (idx !== -1) this.spheres.splice(idx, 1);
    }

    dispose() {
        this.spheres.forEach((s) => this.disposeSphere(s));
        this.spheres = [];

        if (this.model) {
            this.scene.remove(this.model);
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry?.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }

        this.model = null;
    }
}
