// HealthBar.js
import * as THREE from "three";

export default class HealthBar {
    constructor({
        width = 0.5,
        height = 0.1,
        offset = new THREE.Vector3(0, 1, 0),
        maxHealth = 100,
        camera,
        scene,
        target, // the object to follow
    }) {
        this.width = width;
        this.height = height;
        this.offset = offset.clone();
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.camera = camera;
        this.scene = scene;
        this.target = target; // object3D to follow

        // Group
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Background (black)
        const bgGeom = new THREE.PlaneGeometry(this.width, this.height);
        const bgMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
        });
        this.bg = new THREE.Mesh(bgGeom, bgMat);
        this.group.add(this.bg);

        // Foreground (green, shrink right → left)
        const fgGeom = new THREE.PlaneGeometry(this.width, this.height);
        fgGeom.translate(this.width / 2, 0, 0);
        const fgMat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
        });
        this.fg = new THREE.Mesh(fgGeom, fgMat);
        this.fg.position.set(-this.width / 2, 0, 0.001);
        this.group.add(this.fg);
    }

    update() {
        if (!this.camera || !this.target) return;
        if (!this.group) return;
        if (!this.bg || !this.fg) return;
        // ✅ follow target’s world position (but ignore its rotation)
        const worldPos = new THREE.Vector3();
        this.target.getWorldPosition(worldPos);
        this.group.position.copy(worldPos).add(this.offset);

        // ✅ always face camera
        this.group.quaternion.copy(this.camera.quaternion);
    }

    takeDamage(amount) {
        if (this.group) {
            this.health = Math.max(0, this.health - amount);
            const hp = this.health / this.maxHealth;

            this.fg.scale.x = hp;

            const col = new THREE.Color(0x00ff00);
            col.lerp(new THREE.Color(0xff0000), 1 - hp);
            this.fg.material.color.copy(col);

            this.group.visible = this.health > 0;
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.takeDamage(0);
    }

    dispose() {
        if (this.scene && this.group) {
            this.scene.remove(this.group);
        }

        this.bg && this.bg.geometry.dispose();
        this.bg && this.bg.material.dispose();
        this.fg && this.fg.geometry.dispose();
        this.fg && this.fg.material.dispose();

        if (this.group) this.group = null;
    }
}
