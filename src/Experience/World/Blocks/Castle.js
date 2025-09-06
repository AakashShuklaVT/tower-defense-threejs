import * as THREE from 'three'
import Experience from '../../Experience.js'

export default class Castle {
    constructor({ position = { x: 0, z: 0 } }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.position = position

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Castle')
        }

        // Resource
        this.resource = this.resources.items.castle

        this.castleTower = this.resources.items.castleTower;

        this.door = this.resources.items.door.scene
        this.setModel()
        // this.setAnimation()
    }

    setModel() {
        this.model = this.resource.scene.clone()
        const castleTower1 = this.castleTower.scene.clone();
        const castleTower2 = this.castleTower.scene.clone();
        const castleTower3 = this.castleTower.scene.clone();
        const castleTower4 = this.castleTower.scene.clone();

        this.model.position.set(this.position.x + 1, 0, this.position.z + 2)
        this.model.scale.set(1.5, 0.5, 1.5)
        castleTower1.scale.set(0.55, 0.55, 0.55)
        castleTower1.position.set(this.position.x - 0.5, 0, this.position.z - 0)
        castleTower2.scale.set(0.55, 0.55, 0.55)
        castleTower2.position.set(this.position.x - 0.5, 0, this.position.z + 4)
        castleTower3.scale.set(0.55, 0.55, 0.55)
        castleTower3.position.set(this.position.x + 2.5, 0, this.position.z - 0)
        castleTower4.scale.set(0.55, 0.55, 0.55)
        castleTower4.position.set(this.position.x + 2.5, 0, this.position.z + 4)
        this.model.rotation.set(0, -Math.PI / 2, 0)
        this.door.rotation.set(0, -Math.PI / 2, 0)
        this.door.scale.set(0.75, 0.75, 0.75)
        this.door.position.set(this.position.x - 0.55, 0, this.position.z + 2)
        this.scene.add(this.model, this.door)
        this.scene.add(castleTower1, castleTower2, castleTower3, castleTower4)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }
}
