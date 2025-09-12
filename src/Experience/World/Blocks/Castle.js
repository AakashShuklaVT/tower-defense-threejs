import * as THREE from 'three'
import Experience from '../../Experience.js'
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"
import HealthBar from '../../Utils/HealthBar.js'

export default class Castle {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position
        console.log(this.position)
        this.health = 100

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Castle')
        }

        // Resource
        this.resource = this.resources.items.castle

        this.setModel()
        this.createHealthBar()
    }

    setModel() {
        this.model = clone(this.resource.scene)
        this.model.position.set(this.position.x + 0.45, 0, this.position.z)
        this.model.scale.set(0.007, 0.009, 0.007)
        this.model.rotation.set(0, -Math.PI / 2, 0)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    createHealthBar() {
        this.healthBar = new HealthBar({
            maxHealth: this.health,
            camera: this.experience.camera.instance,
            scene: this.scene,
            target: this.model,
            offset: new THREE.Vector3(-2, 4, 0),
            scale: 2
        });

        this.healthBar.setHealth(this.health);

        // 👇 Call once so bar starts above castle instead of (0,0,0)
        this.healthBar.updateHealthBarUI();
    }

    updateHealthBarUI() {
        if (this.healthBar) {
            this.healthBar.setHealth(this.health)
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        this.health = Math.max(0, this.health);

        if (this.healthBar) {
            this.healthBar.setHealth(this.health); // update UI
        }

        if (this.health <= 0) {
            // this.die();
        }
    }
}
