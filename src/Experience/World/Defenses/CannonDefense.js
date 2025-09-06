import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import Experience from "../../Experience.js";

export default class CannonDefense {
    constructor({
        attackRange = 30,
        scale = 1,
        positionX = 0,
        positionZ = 0
    }) {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        this.debug = this.experience.debug;

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder("Cannon");
        }

        this.targets = [];
        this.attackRange = attackRange;
        this.scale = scale;
        this.positionX = positionX;
        this.positionZ = positionZ;

        this.currentLevel = 1; // default
        this.setModel();

        setTimeout(() => {
            this.updateLevel(2)
        }, 5000);
    }

    setModel() {
        const key = `cannon${this.currentLevel}`;
        this.resource = this.resources.items[key];

        if (!this.resource) {
            console.warn(`❌ Resource not found: ${key}`);
            return;
        }

        this.model = clone(this.resource.scene);
        this.model.position.set(this.positionX, 1.65, this.positionZ);
        this.model.rotation.set(0, Math.random() * Math.PI * 2, 0);
        this.model.scale.setScalar(this.scale);
        this.scene.add(this.model);

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
            }
        });
    }

    disposeModel() {
        if (!this.model) return;

        this.scene.remove(this.model);

        this.model.traverse((child) => {
            if (child.isMesh) {
                child.geometry?.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });

        this.model = null;
    }

    updateLevel(newLevel) {
        if (newLevel === this.currentLevel) return;

        this.disposeModel();
        this.currentLevel = newLevel;
        this.setModel();
    }

    findNearestTarget(maxRange = this.attackRange) {
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
}
