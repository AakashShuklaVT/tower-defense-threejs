import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../../Experience.js'

export default class BombermanEnemy {
    constructor({ resourceName = 'bomberman', position = { x: 0, y: 0, z: 0 }, scale = 0.15, movePath, speed, levelData }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.speed = speed

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('bomberman enemy')
        }

        // Resource (GLTF model from resources)
        this.resource = this.resources.items[resourceName]

        this.setModel(position, scale)
        this.movePath = movePath
        this.startMoving(this.movePath, levelData)
        this.setAnimation()
    }

    setModel(position, scale) {
        this.model = this.resource.scene.clone()

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
        this.animation.actions.run = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.play_arrowattack = this.animation.mixer.clipAction(this.resource.animations[2])
        this.animation.actions.win = this.animation.mixer.clipAction(this.resource.animations[3])
        this.animation.actions.death = this.animation.mixer.clipAction(this.resource.animations[4])

        // ✅ Default action = run
        this.animation.actions.current = this.animation.actions.run
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
                playRun: () => this.animation.play('run'),
                playArrowAttack: () => this.animation.play('play_arrowattack'),
                playWin: () => this.animation.play('win'),
                playDeath: () => this.animation.play('death'),
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playRun')
            this.debugFolder.add(debugObject, 'playArrowAttack')
            this.debugFolder.add(debugObject, 'playWin')
            this.debugFolder.add(debugObject, 'playDeath')
        }
    }
    
    startMoving(pathPoints, levelData) {
        if (!pathPoints || pathPoints.length === 0) return;
        console.log("Path points:", pathPoints);

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
