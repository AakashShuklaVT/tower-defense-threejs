import * as THREE from "three";
import gsap from "gsap";
import Experience from "../../Experience";

function createCircleTexture() {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, size / 8,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

export default class CannonBall {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.createBall();
        this.createParticles();
    }

    createBall() {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xff5500,
            emissive: 0xff2200,
            emissiveIntensity: 2,
            roughness: 0.3,
            metalness: 0.1,
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);

        gsap.to(this.material, {
            emissiveIntensity: 4,
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    createParticles() {
        this.particleCount = 100;
        this.particles = [];

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3 + 0] = 0;
            positions[i * 3 + 1] = -999; // start offscreen
            positions[i * 3 + 2] = 0;
            this.particles.push({
                velocity: new THREE.Vector3(),
                life: 0
            });
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        this.positions = positions;

        this.particleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            map: createCircleTexture(),
            transparent: true,
            color: 0xffaa55,
            depthWrite: false
        });

        this.points = new THREE.Points(geometry, this.particleMaterial);
        this.scene.add(this.points);
    }

    spawnParticle(pos) {
        for (let i = 0; i < this.particleCount; i++) {
            const p = this.particles[i];
            if (p.life <= 0) {
                this.positions[i * 3 + 0] = pos.x;
                this.positions[i * 3 + 1] = pos.y;
                this.positions[i * 3 + 2] = pos.z;

                p.velocity.set(
                    (Math.random() - 0.5) * 0.3,
                    -Math.random() * 0.3 - 0.1,
                    (Math.random() - 0.5) * 0.3
                );
                p.life = 1;
                break;
            }
        }
    }

    launch(start, end, speed = 5, height = 5) {
        this.mesh.position.copy(start);
        this.mesh.scale.set(1, 1, 1);

        gsap.fromTo(this.mesh.scale, { x: 0.2, y: 0.2, z: 0.2 }, {
            x: 1, y: 1, z: 1,
            duration: 0.3,
            ease: "back.out(2)"
        });

        const distance = start.distanceTo(end);
        const duration = distance / speed;
        const tempVec = new THREE.Vector3();

        if (this.tween) this.tween.kill();
        const data = { t: 0 };

        this.tween = gsap.to(data, {
            t: 1,
            duration,
            ease: "none",
            onUpdate: () => {
                const t = data.t;
                tempVec.lerpVectors(start, end, t);
                const parabola = 4 * height * t * (1 - t);
                tempVec.y = THREE.MathUtils.lerp(start.y, end.y, t) + parabola;
                this.mesh.position.copy(tempVec);

                // spawn a few particles per frame
                for (let i = 0; i < 2; i++) this.spawnParticle(tempVec);
            },
        });
    }

    update() {
        // Update particle motion
        for (let i = 0; i < this.particleCount; i++) {
            const p = this.particles[i];
            if (p.life > 0) {
                this.positions[i * 3 + 0] += p.velocity.x;
                this.positions[i * 3 + 1] += p.velocity.y;
                this.positions[i * 3 + 2] += p.velocity.z;

                p.velocity.y -= 0.01; // gravity
                p.life -= 0.02;

                if (p.life <= 0) this.positions[i * 3 + 1] = -999;
            }
        }

        this.points.geometry.attributes.position.needsUpdate = true;
    }
}
