import * as THREE from "three"
import Experience from "../../Experience.js"
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js"

export default class XBow {
    constructor({ resourceName = "xbow1", position = { x: 0, y: 0, z: 0 }, scale = 0.25 }) {
        // === Experience ===
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // === Stats ===
        this.position = position
        this.scale = scale

        // === Model ===
        this.resource = this.resources.items[resourceName]
        this.setModel()

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("xbow")
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
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    /* -----------------------
       Update Loop
    ------------------------*/
    update() {
        // no combat logic yet
    }

    /* -----------------------
       Cleanup
    ------------------------*/
    dispose() {
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
