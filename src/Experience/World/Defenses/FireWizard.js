import * as THREE from "three";
import gsap from "gsap";
import Experience from "../../Experience.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { DEFENSES_STATS } from "../../Configs/GameConfig.js";

export default class FireWizard {
    constructor({ attackRange = DEFENSES_STATS.FIRE_WIZARD.ATTACK_RANGE,
        scale = 1,
        positionX = 0,
        positionZ = 0,
        level = 1 }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        this.debug = this.experience.debug;
        this.meteorTimeout = null;
        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("PrinceGreen");
        }

        // Resource
        this.resource = this.resources.items.fireWizard;

        // Array of meshes meteor can collide with
        this.targets = [];
        this.splashRadius = DEFENSES_STATS.FIRE_WIZARD.DAMAGE_RADIUS;
        this.currentLevel = level;
        // Dynamic attack range
        this.attackRange = attackRange;
        this.scale = scale;
        this.positionX = positionX;
        this.positionZ = positionZ;
        this.won = false;

        this.setModel();
        this.setAnimation();
    }

    setModel() {
        this.model = clone(this.resource.scene);
        this.model.position.set(this.positionX, 1.75, this.positionZ);
        this.model.rotation.set(0, Math.random() * Math.PI * 2, 0);
        this.model.scale.setScalar(this.scale);
        this.scene.add(this.model);

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.material.color = new THREE.Color(0x888888)
            }
        });
    }

    updateLevel() {
        if (this.currentLevel == 1) {
            if (this.experience.world.coinsManager.getCurrentAmount() < DEFENSES_STATS.FIRE_WIZARD.BUILDING_COST.LV2) return;
            this.experience.world.coinsManager.subtractFromCurrentAmount(DEFENSES_STATS.FIRE_WIZARD.BUILDING_COST.LV2);
        }
        this.currentLevel += 1;
        if (this.animation.actions.current == this.animation.actions.fire) {
            this.animation.play('fire');
        }
    }

    setParticles() {
        this.particles = {};

        // Meteor mesh
        this.meteor = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.25 * this.scale), // scale here
            new THREE.MeshPhysicalMaterial({
                color: "silver",
                roughness: 0,
                metalness: 0.6,
                flatShading: true,
            })
        );


        // spawn in front of character
        const forward = new THREE.Vector3(0, 0, 1)
            .applyQuaternion(this.model.quaternion)
            .normalize();

        const spawnPos = this.model.position.clone()
            .add(forward.clone().multiplyScalar(1.0 * this.scale)) // forward distance scaled
            .add(new THREE.Vector3(0, 1.0 * this.scale, 0));       // vertical offset scaled


        this.meteor.position.copy(spawnPos);
        this.scene.add(this.meteor);

        this.meteorBox = new THREE.Box3().setFromObject(this.meteor);

        // Create particle trail
        const canvas = document.createElement("CANVAS");
        canvas.width = 128;
        canvas.height = 128;

        const context = canvas.getContext("2d");
        context.globalAlpha = 0.3;
        context.filter = "blur(16px)";
        context.fillStyle = "white";
        context.beginPath();
        context.arc(64, 64, 40, 0, 2 * Math.PI);
        context.fill();
        context.globalAlpha = 1;
        context.filter = "blur(5px)";
        context.fillStyle = "white";
        context.beginPath();
        context.arc(64, 64, 16, 0, 2 * Math.PI);
        context.fill();

        const texture = new THREE.CanvasTexture(canvas);

        const N = 200,
            M = 3;
        const position = new THREE.BufferAttribute(new Float32Array(3 * N), 3);
        const color = new THREE.BufferAttribute(new Float32Array(3 * N), 3);
        const v = new THREE.Vector3();



        for (let i = 0; i < N; i++) {
            // when setting v length
            v.randomDirection().setLength(3 + 2 * Math.pow(Math.random(), 1 / 3)); // keep spread constant
            position.setXYZ(
                i,
                this.meteor.position.x,
                this.meteor.position.y,
                this.meteor.position.z
            );
            color.setXYZ(i, Math.random(), Math.random(), Math.random());
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", position);
        geometry.setAttribute("color", color);

        const material = new THREE.PointsMaterial({
            color: "white",
            vertexColors: true,
            size: 2 * this.scale,      // scale the particle size
            sizeAttenuation: true,
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });


        const cloud = new THREE.Points(geometry, material);
        this.scene.add(cloud);

        let idx = 0;

        this.particles.burstBall = this.meteor;
        this.particles.cloud = cloud;

        this.particles.update = () => {
            if (!this.meteor) return; // <---- safeguard
            for (let j = 0; j < M; j++) {
                v.randomDirection().divideScalar(16).add(this.meteor.position);
                position.setXYZ(idx, v.x, v.y, v.z);
                color.setXYZ(idx, 1, 1, 2);
                idx = (idx + 1) % N;
            }

            // recolor all the rest particles
            let k = 1;
            for (let j = idx + N; j > idx - M; j--) {
                color.setXYZ(j % N, k, k ** 1.5, 5 * k ** 3);
                k = 0.98 * k;
            }
            position.needsUpdate = true;
            color.needsUpdate = true;
        };
    }

    findNearestTarget(maxRange = this.attackRange) { // use dynamic range
        let nearest = null;
        let minDist = Infinity;

        for (let target of this.targets) {
            if (!target) continue;
            const dist = this.model.position.distanceTo(target.position);
            if (dist < minDist && dist <= maxRange) {
                minDist = dist;
                nearest = target;
            }
        }
        return nearest;
    }

    throwBall(target) {
        if (!this.meteor) return;
        const meteor = this.meteor;

        // direction character is facing
        const forward = new THREE.Vector3(0, 0, 1)
            .applyQuaternion(this.model.quaternion)
            .normalize();

        // rise up position: a bit forward & up from current meteor
        const risePos = meteor.position.clone()
            .add(forward.clone().multiplyScalar(1.0 * this.scale))  // forward
            .add(new THREE.Vector3(0, 1.5 * this.scale, 0));       // upward

        // Save timeline reference
        this.meteorTimeline = gsap.timeline({
            onUpdate: () => {
                if (meteor && this.meteorBox) {
                    this.meteorBox.setFromObject(meteor);
                }
                this.particles?.update();
            },
            onComplete: () => {
                this.destroyMeteor(target);
            },
        });

        // Phase 1: rise up
        // this.meteorTimeline.to(meteor.position, {
        //     x: risePos.x,
        //     y: risePos.y,
        //     z: risePos.z,
        //     duration: 0.75,
        //     delay: 0.25,
        // });

        // Phase 2: chase toward *current* target position
        const speed = DEFENSES_STATS.FIRE_WIZARD.TIME_TAKEN_TO_REACH_TARGET; // units per second
        this.meteorTimeline.to(meteor.position, {
            duration: 3, // just a max duration; GSAP will overwrite each frame
            ease: "none",
            delay: 0.25,
            onUpdate: () => {
                if (!target) return;
                const targetPos = target.position.clone();
                const direction = targetPos.clone().sub(meteor.position);
                const distance = direction.length();

                // move step toward current target position
                if (distance > 0.01) {
                    direction.normalize().multiplyScalar(speed * (gsap.ticker.deltaRatio() / 60));
                    meteor.position.add(direction);
                }
            },
            onComplete: () => {
                this.destroyMeteor()
            }
        });
    }

    dispose() {
        this.scene.remove(this.model);
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        this.model = null;
    }

    getEnemiesInSplash(center, radius) {
        this.enemiesInRange = [];

        for (let t of this.targets) {
            if (!t) continue;

            const dist = t.position.distanceTo(center);

            if (dist <= radius) {
                this.enemiesInRange.push(t);
            }
        }

        //("Enemies in range:", this.enemiesInRange);
        this.splashDamage(50)
    }

    splashDamage(damage = 10) {
        for (let enemy of this.enemiesInRange) {
            if (enemy) {
                const script = enemy.userData.scriptInstance;
                if (!script) continue;
                // if (script.type === 'Goblimon') {
                //     script.takeDamage(DAMAGE_FROM_FIRE_WIZARD_TO_GOBLIMON);
                // } else if (script.type === 'Guardamon') {
                //     script.takeDamage(DAMAGE_FROM_FIRE_WIZARD_TO_GAURDAMON);
                // } else if (script.type === 'RedPanther') {
                //     script.takeDamage(DAMAGE_FROM_FIRE_WIZARD_TO_RED_PANTHER);
                // } else if (script.type === 'Demogorgon') {
                //     script.takeDamage(DAMAGE_FROM_FIRE_WIZARD_TO_DEMOGORGON);
                // } else if (script.type === 'Floramon') {
                //     script.takeDamage(DAMAGE_FROM_FIRE_WIZARD_TO_FLORAMON);
                // }

                script.takeDamage(DEFENSES_STATS.FIRE_WIZARD.ATTACK_DAMAGE);

                // ✅ If enemy is dead → remove from targets
                if (script.health <= 0) {
                    this.targets = this.targets.filter(t => t !== enemy);
                }
            }
        }

        this.enemiesInRange = []; // clear the array after splashing
    }


    destroyMeteor(target = null) {

        if (this.meteorTimeline) {
            this.meteorTimeline.kill();
            this.meteorTimeline = null;
        }

        if (this.meteor) {
            const splashPos = this.meteor.position.clone();
            this.getEnemiesInSplash(splashPos, this.splashRadius);

            this.scene.remove(this.meteor);
            this.meteor.geometry.dispose();
            this.meteor.material.dispose();
            this.meteor = null;
            this.meteorBox = null;

            if (this.particles?.cloud) {
                const cloud = this.particles.cloud;
                const geometry = cloud.geometry;
                const positions = geometry.getAttribute("position");
                const colors = geometry.getAttribute("color");
                const N = positions.count;

                // get flight direction (use target if available)
                let normal = new THREE.Vector3(0, 0, 1);
                if (target) {
                    normal = new THREE.Vector3()
                        .subVectors(target.position, splashPos)
                        .normalize();
                }

                // find a vector perpendicular to normal (to form ring plane)
                const tangent = new THREE.Vector3(0, 1, 0);
                if (Math.abs(normal.dot(tangent)) > 0.9) tangent.set(1, 0, 0);
                const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
                tangent.crossVectors(bitangent, normal).normalize();

                for (let i = 0; i < N; i++) {
                    const angle = (i / N) * Math.PI * 2;
                    const distortion = (Math.random() - 0.5) * 0.1;
                    const r = 0.05 + distortion;

                    // parametric circle in tangent/bitangent plane
                    const x = splashPos.x + r * (tangent.x * Math.cos(angle) + bitangent.x * Math.sin(angle));
                    const y = splashPos.y + r * (tangent.y * Math.cos(angle) + bitangent.y * Math.sin(angle));
                    const z = splashPos.z + r * (tangent.z * Math.cos(angle) + bitangent.z * Math.sin(angle));

                    positions.setXYZ(i, x, y, z);

                    const t = i / N;
                    colors.setXYZ(i, 1, 1 - t, 1 - t);
                }
                positions.needsUpdate = true;
                colors.needsUpdate = true;

                const radiusObj = { r: 0.05, opacity: 1 };
                gsap.to(radiusObj, {
                    r: 1.2,
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    onUpdate: () => {
                        cloud.material.opacity = radiusObj.opacity;

                        for (let i = 0; i < N; i++) {
                            const angle = (i / N) * Math.PI * 2;
                            const distortion = (Math.random() - 0.5) * 0.1;
                            const r = radiusObj.r + distortion;

                            const x = splashPos.x + r * (tangent.x * Math.cos(angle) + bitangent.x * Math.sin(angle));
                            const y = splashPos.y + r * (tangent.y * Math.cos(angle) + bitangent.y * Math.sin(angle));
                            const z = splashPos.z + r * (tangent.z * Math.cos(angle) + bitangent.z * Math.sin(angle));

                            positions.setXYZ(i, x, y, z);
                        }
                        positions.needsUpdate = true;
                    },
                    onComplete: () => {
                        if (cloud.parent) this.scene.remove(cloud);
                        geometry.dispose();
                        cloud.material.dispose();
                        this.particles.cloud = null;
                        this.particles.update = () => { };
                    },
                });
            }
        }
    }

    setAnimation() {
        this.animation = {};

        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model);
        this.animation.mixer.addEventListener('finished', () => {
            this.triggered = false;
        })
        // Actions
        this.animation.actions = {};
        this.animation.actions.idle = this.animation.mixer.clipAction(
            this.resource.animations[0]
        );
        this.animation.actions.fire = this.animation.mixer.clipAction(
            this.resource.animations[2]
        );
        this.animation.actions.win = this.animation.mixer.clipAction(
            this.resource.animations[1]
        );

        this.animation.actions.current = this.animation.actions.idle;
        this.animation.actions.current.play();

        this.triggerTime = 0.6;
        this.triggered = false;

        this.animation.play = (name) => {
            const newAction = this.animation.actions[name];
            const oldAction = this.animation.actions.current;

            if (newAction === oldAction && name != 'fire') return; // prevent re-triggering same anim
            if (name === 'fire' && this.currentLevel == 1) {
                newAction.timeScale = DEFENSES_STATS.FIRE_WIZARD.ATTACK_SPEED.LV1;
            } else if (name === 'fire' && this.currentLevel == 2) {
                newAction.timeScale = DEFENSES_STATS.FIRE_WIZARD.ATTACK_SPEED.LV2;
            }
            newAction.reset();
            newAction.play();
            newAction.crossFadeFrom(oldAction, 0.5);

            this.animation.actions.current = newAction;
            name == 'win' ? console.log("Played Win") : null;

            this.triggered = false;       // reset meteor spawn control
            this.prevActionTime = 0;      // reset animation cycle tracking
        };

        if (this.debug.active) {
            const debugObject = {
                playIdle: () => this.animation.play("idle"),
                playFire: () => this.animation.play("fire"),
                playWin: () => this.animation.play("win"),
            };
            this.debugFolder.add(debugObject, "playIdle");
            this.debugFolder.add(debugObject, "playFire");
            this.debugFolder.add(debugObject, "playWin");
        }
    }

    playWin() {
        this.won = true
        this.animation.play('win');
    }

    update() {
        // Update animation mixer
        if (this.model) {
            this.animation.mixer.update(this.time.delta * 0.001);

            const action = this.animation.actions.current;
            if (action) {
                // 🔄 Detect animation restart (looped back to start)
                if (action.time < this.prevActionTime) {
                    this.triggered = false; // reset for new cycle
                }
                this.prevActionTime = action.time;

                // 🎯 Find nearest target within dynamic range
                let nearestTarget = null;
                let minDist = Infinity;
                for (let target of this.targets) {
                    if (!target) continue;
                    const dist = this.model.position.distanceTo(target.position);
                    // //(dist, minDist, this.attackRange);

                    if (dist < minDist && dist <= this.attackRange) { // ✅ use dynamic range
                        minDist = dist;
                        nearestTarget = target;
                    }
                }

                // Rotate toward nearest target if any
                if (nearestTarget) {
                    this.model.lookAt(new THREE.Vector3(nearestTarget.position.x, this.model.position.y, nearestTarget.position.z));
                    if (this.animation.actions.current !== this.animation.actions.fire) {
                        this.animation.play('fire');
                    }
                } else {
                    if (this.animation.actions.current !== this.animation.actions.idle && !this.won) {
                        this.animation.play('idle');
                    }
                }

                // 🚀 Spawn meteor ONLY once per fire cycle
                if (
                    action === this.animation.actions.fire &&
                    !this.triggered &&
                    action.time >= this.triggerTime
                ) {
                    if (nearestTarget) {
                        this.setParticles();
                        this.throwBall(nearestTarget);
                    }
                    this.triggered = true;
                }
            }

            // ✨ Update particles
            this.particles?.update();

            // 💥 Collision check
            if (this.meteor && this.meteorBox) {
                for (let target of this.targets) {
                    if (target && this.meteorBox) {
                        const targetBox = new THREE.Box3().setFromObject(target);
                        if (target.name === 'Gaurdamon') {
                            // ISSUE FIXED.  
                            // As the GAURDAMON (i.e. Gaurdamon as mentioned by name in model) is already above the ground, 
                            // So, for intersection to happen -> I shifted the position of it's bounding box to a bit Lower 
                            // as the target position of the meteor is ground but the Actual object is at 0.5 above the ground. 
                            // The meteor was already targeting the point of the group, but the group contains mesh which is not
                            // at origin, so combined with the coordinates of the group and mesh, the target was at 1 unit above 
                            // the ground, due to which sometimes the collision worked and sometimes the meteor skipped it. 
                            targetBox.min.y -= 0.2;
                            targetBox.max.y -= 0.2;
                        }
                        if (this.meteorBox.intersectsBox(targetBox)) {
                            this.destroyMeteor(target);
                            if (this.meteorTimeout) {
                                clearTimeout(this.meteorTimeout)
                                this.meteorTimeout = null;
                            }
                            break;
                        } else {
                            if (!this.meteorTimeout) {
                                this.meteorTimeout = setTimeout(() => {
                                    this.destroyMeteor();
                                    clearTimeout(this.meteorTimeout)
                                    this.meteorTimeout = null;
                                }, 2000)
                            }
                        }
                    }
                }
            }
        }
    }

}
