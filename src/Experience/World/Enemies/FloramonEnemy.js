import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../../Experience.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import HealthBar from '../HealthBar/HealthBar.js';
import { ENEMIES_STATS } from '../../Configs/GameConfig.js';

export default class FloramonEnemy {
    static spawnedEnemies = 0;
    constructor({ resourceName = 'floramon', position = { x: 0, y: 0, z: 0 }, scale = 0.15, movePath, speed, levelData }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.speed = speed
        this.health = ENEMIES_STATS.FLORAMON.HEALTH
        this.type = 'Floramon'
        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Floramon enemy')
        }

        // Resource (GLTF model from resources)
        this.resource = this.resources.items[resourceName]

        this.setModel(position, scale)
        this.setScriptInstanceInModel()
        this.movePath = movePath
        this.startMoving(this.movePath, levelData)
        this.setAnimation()
    }

    setModel(position, scale) {
        this.model = clone(this.resource.scene)
        this.healthBar = new HealthBar({
            maxHealth: this.health,
            camera: this.experience.camera.instance,
            target: this.model,
            scene: this.experience.scene
        })
        this.model.scale.set(scale, scale, scale)
        this.model.position.set(position.x, position.y, position.z)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
            }
        })
    }

    setScriptInstanceInModel() {
        this.model.userData.scriptInstance = this
    }

    takeDamage(damage) {
        this.health -= damage;
        this.healthBar.takeDamage(damage)
        //('gaurdamon health:', this.health);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;

        //("Gaurdamon is dying...");

        // Stop movement timeline if exists
        if (this.moveTimeline) {
            this.moveTimeline.kill();
            this.moveTimeline = null;
        }

        // Play death animation once
        this.animation.play('death')

        // Dispose when death anim finishes
        this.animation.mixer.addEventListener("finished", (e) => {
            if (this.animation.actions.current === this.animation.actions.death) {
                this.experience.world.coinsManager.addToCurrentAmount(ENEMIES_STATS.FLORAMON.KILL_COINS);
                //("Disposing Gaurdamon...");
                FloramonEnemy.spawnedEnemies--;
                this.experience.world.removeEnemy(this.model);
                this.disposeModel();
            }
        });
    }


    disposeModel() {
        if (this.model) {
            this.scene.remove(this.model);
            this.healthBar.dispose();

            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();

                    if (child.material.isMaterial) {
                        this.disposeMaterial(child.material);
                    } else if (Array.isArray(child.material)) {
                        for (const m of child.material) this.disposeMaterial(m);
                    }
                }
            });

            this.model = null;
        }
        //("Demogorgon disposed.");
    }

    disposeMaterial(material) {
        for (const key in material) {
            const value = material[key];
            if (value && value.isTexture) value.dispose();
        }
        material.dispose();
    }

    setAnimation() {
        this.animation = {}

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions (renamed set)
        this.animation.actions = {}
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.actions.run = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.attack = this.animation.mixer.clipAction(this.resource.animations[2])
        this.animation.actions.loose = this.animation.mixer.clipAction(this.resource.animations[3])
        this.animation.actions.win = this.animation.mixer.clipAction(this.resource.animations[4])
        this.animation.actions.death = this.animation.mixer.clipAction(this.resource.animations[5])

        // ✅ Default action = move
        this.animation.actions.current = this.animation.actions.run
        this.animation.actions.current.play()

        // Play method
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            if (newAction && newAction !== oldAction) {
                newAction.reset()
                if (name === 'death') {
                    newAction.clampWhenFinished = true
                    newAction.setLoop(THREE.LoopOnce)
                }
                newAction.play()
                newAction.crossFadeFrom(oldAction, 0.4)
                this.animation.actions.current = newAction
            }
        }

        // Debug controls
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => this.animation.play('idle'),
                playRun: () => this.animation.play('run'),
                playAttack: () => this.animation.play('attack'),
                playLoose: () => this.animation.play('loose'),
                playWin: () => this.animation.play('win'),
                playDeath: () => this.animation.play('death'),
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playRun')
            this.debugFolder.add(debugObject, 'playAttack')
            this.debugFolder.add(debugObject, 'playLoose')
            this.debugFolder.add(debugObject, 'playWin')
            this.debugFolder.add(debugObject, 'playDeath')
        }
    }

    startMoving(pathPoints, levelData) {
        if (!pathPoints || pathPoints.length === 0) return;
        //("Path points:", pathPoints);

        const offsetX = levelData.width / 2;
        const offsetZ = levelData.height / 2;

        // Convert grid coords → world coords
        const points = pathPoints.map(p => ({
            x: p.x - offsetX + 0.5,
            z: p.z - offsetZ + 0.5,
            angle: p.angle,
        }));

        // Start position
        this.model.position.set(points[0].x, this.model.position.y, points[0].z);
        this.model.rotation.y = THREE.MathUtils.degToRad(points[0].angle);

        // ✅ Create a single timeline for movement
        this.moveTimeline = gsap.timeline({ paused: false });

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];

            const dx = next.x - current.x;
            const dz = next.z - current.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const duration = distance / this.speed;

            // Add position tween
            this.moveTimeline.to(this.model.position, {
                x: next.x,
                z: next.z,
                duration,
                ease: 'none'
            });

            // Add rotation tween slightly overlapping for smooth turn
            if (next.angle !== undefined) {
                this.moveTimeline.to(this.model.rotation, {
                    y: THREE.MathUtils.degToRad(next.angle),
                    duration: 0.2,
                    ease: 'power2.inOut'
                }); // slight overlap for smooth rotation
            }
        }
        this.moveTimeline.call(() => {
            this.animation.play('attack');
        })
    }

    update() {
        if (this.animation && this.animation.mixer) {
            this.animation.mixer.update(this.time.delta * 0.001);

            const attackAction = this.animation.actions.attack;
            if (this.animation.actions.current === attackAction) {
                const attackDuration = attackAction.getClip().duration;

                // Calculate normalized time (0 → 1) for the current loop
                const loopTime = attackAction.time % attackDuration;

                if (loopTime >= attackDuration * 0.8 && !this.attackLogTriggered) {
                    this.experience.world.hudManager.takeDamage(ENEMIES_STATS.FLORAMON.DAMAGE_PER_SECOND);
                    this.attackLogTriggered = true;
                }

                // Reset the flag at the start of the loop
                if (loopTime < 0.1) {
                    this.attackLogTriggered = false;
                }
            }
        }

        if (this.healthBar) {
            this.healthBar.update();
        }
    }
}
