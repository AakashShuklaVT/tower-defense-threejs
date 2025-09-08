import * as THREE from 'three'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
import Experience from '../../Experience.js'
import gsap from 'gsap'

export default class Wizard {
    constructor({ resourceName = 'wizard', position = { x: 0, y: 0, z: 0 }, scale = 0.25, attackRange = 4 }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.position = position
        this.scale = scale
        this.range = attackRange

        setTimeout(() => {
            this.enemies = this.experience.world.getEnemies()
        }, 1000)

        this.fireballs = []
        this.fireballInterval = 2000
        this.lastShot = 0

        if (this.debug.active) this.debugFolder = this.debug.ui.addFolder('wizard')

        this.resource = this.resources.items[resourceName]

        this.setModel(position, scale)
        this.setAnimation()
    }

    setModel(position, scale) {
        this.model = clone(this.resource.scene)
        this.model.position.set(position.x, position.y, position.z)
        this.model.rotation.set(0, Math.PI, 0)
        this.model.scale.setScalar(scale)
        this.scene.add(this.model)

        this.model.traverse(child => {
            if (child instanceof THREE.Mesh) child.castShadow = true
        })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {
            idle: this.animation.mixer.clipAction(this.resource.animations[0]),
            fire: this.animation.mixer.clipAction(this.resource.animations[1])
        }

        // Default action = idle
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Fire animation settings
        const fireAction = this.animation.actions.fire
        fireAction.clampWhenFinished = true
        fireAction.loop = THREE.LoopOnce

        // Smooth crossfade back to idle after fire finishes
        this.animation.mixer.addEventListener('finished', (e) => {
            if (e.action === fireAction) {
                this.animation.play('idle')
            }
        })

        // Play method with crossfade
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

    spawnFireball(target) {
        if (!target) return;

        const fireAction = this.animation.actions.fire;
        this.animation.play('fire');

        const delay = fireAction.getClip().duration / 2;

        gsap.delayedCall(delay, () => {
            const fireball = {};

            // Fireball mesh
            fireball.mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.5 * this.scale),
                new THREE.MeshPhysicalMaterial({ color: "orange", roughness: 0, metalness: 0.6 })
            );

            // Spawn in front of wizard
            const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.model.quaternion).normalize();
            const spawnPos = this.model.position.clone()
                .add(forward.clone().multiplyScalar(0.5 * this.scale))
                .add(new THREE.Vector3(0, 1.5 * this.scale, 0));

            fireball.mesh.position.copy(spawnPos);
            this.scene.add(fireball.mesh);

            // Particle trail setup
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(64, 64, 48, 0, Math.PI * 2);
            ctx.fill();
            const texture = new THREE.CanvasTexture(canvas);

            const N = 200, M = 3;
            const geometry = new THREE.BufferGeometry();
            const position = new THREE.BufferAttribute(new Float32Array(3 * N), 3);
            const color = new THREE.BufferAttribute(new Float32Array(3 * N), 3);
            const v = new THREE.Vector3();
            let idx = 0;

            for (let i = 0; i < N; i++) {
                position.setXYZ(i, spawnPos.x, spawnPos.y, spawnPos.z);
                color.setXYZ(i, 1, 0.5, 0);
            }

            geometry.setAttribute('position', position);
            geometry.setAttribute('color', color);

            const material = new THREE.PointsMaterial({
                size: 0.4 * this.scale,
                vertexColors: true,
                map: texture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            fireball.cloud = new THREE.Points(geometry, material);
            this.scene.add(fireball.cloud);

            // Store reference to target
            fireball.target = target;

            // === Update method for fireball ===
            fireball.update = () => {
                if (!fireball.mesh || !fireball.target || !fireball.target.model) {
                    this.disposeFireball(fireball);
                    return;
                }

                // Always recalc direction toward moving target
                const dir = fireball.target.model.position.clone()
                    .sub(fireball.mesh.position)
                    .normalize();

                const speed = 0.08; // slightly faster
                fireball.mesh.position.add(dir.multiplyScalar(speed));

                // Collision check
                const distToTarget = fireball.mesh.position.distanceTo(fireball.target.model.position);
                if (distToTarget < 0.5 * this.scale) {
                    console.log("🔥 Fireball hit enemy:", fireball.target);
                    this.disposeFireball(fireball);
                    this.fireballs.splice(this.fireballs.indexOf(fireball), 1);
                    return;
                }

                // === Particle effect ===
                for (let j = 0; j < M; j++) {
                    v.randomDirection().divideScalar(16).add(fireball.mesh.position);
                    position.setXYZ(idx, v.x, v.y, v.z);
                    color.setXYZ(idx, 1, 0.5, 0);
                    idx = (idx + 1) % N;
                }

                let k = 1;
                for (let j = idx + N; j > idx - M; j--) {
                    color.setXYZ(j % N, k, k * 0.5, 0);
                    k *= 0.98;
                }

                position.needsUpdate = true;
                color.needsUpdate = true;
            };

            this.fireballs.push(fireball);
        });
    }



    disposeFireball(fireball) {
        if (!fireball) return;

        // Remove and dispose mesh
        if (fireball.mesh) {
            this.scene.remove(fireball.mesh);
            if (fireball.mesh.geometry) fireball.mesh.geometry.dispose();
            if (fireball.mesh.material) fireball.mesh.material.dispose();
            fireball.mesh = null;
        }

        // Remove and dispose particle cloud
        if (fireball.cloud) {
            this.scene.remove(fireball.cloud);
            if (fireball.cloud.geometry) fireball.cloud.geometry.dispose();
            if (fireball.cloud.material) fireball.cloud.material.dispose();
            fireball.cloud = null;
        }
    }

    getNearestEnemy() {
        if (!this.enemies || this.enemies.length === 0) return null;

        let nearest = null;
        let minDist = Infinity;

        this.enemies.forEach(enemy => {
            const dist = this.model.position.distanceTo(enemy.model.position);
            if (dist < minDist && dist <= this.range) {
                minDist = dist;
                nearest = enemy;
            }
        });

        return nearest;
    }

    updateFireballs() {
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            const f = this.fireballs[i];

            // Safe check
            if (!f || !f.mesh) {
                this.disposeFireball(f);
                this.fireballs.splice(i, 1);
                continue;
            }
            f.update();
        }
    }

    update() {
        if (this.animation.mixer) this.animation.mixer.update(this.time.delta * 0.001);

        const nearest = this.getNearestEnemy();
        if (nearest) {
            // Face the enemy
            this.model.lookAt(nearest.model.position.x, this.model.position.y, nearest.model.position.z);

            // Fireball cooldown
            const now = performance.now();
            if (now - this.lastShot > this.fireballInterval) {
                this.spawnFireball(nearest);
                this.lastShot = now;
            }
        }

        // Update fireballs
        this.updateFireballs();
    }

}
