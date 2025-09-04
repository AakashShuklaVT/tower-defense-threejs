import * as THREE from 'three'
import StraightPath from './Blocks/StraightPath.js'
import Experience from '../Experience.js'
import Grass from './Blocks/Grass.js'
import Tower from './Blocks/Tower.js'
import Trees from './Blocks/Trees.js'
import Stones from './Blocks/Stones.js'
import Castle from './Blocks/Castle.js'
import gsap from 'gsap'

export default class MapGenerator {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.loadLevelData()
    }

    async loadLevelData() {
        this.levelDataJSON = await fetch('./Experience/Configs/LevelData.json')
        this.levelData = await this.levelDataJSON.json()
        this.generatePath()
    }

    generatePath() {
        this.paths = this.levelData.grid
        const offsetX = this.levelData.width / 2
        const offsetZ = this.levelData.height / 2
        // Store references to your trees
        const trees = [];
        const startPoint = { x: 4.5, z: -7.5 }
        const movePath = [
            { x: 4.5, z: -7.5, angle: 90 },
            { x: 4.5, z: -7.5 + 4, angle: -90 },
            { x: 4.5 - 12, z: -7.5 + 4, angle: 0 },
            { x: 4.5 - 12, z: -7.5 + 11, angle: 90 },
            { x: 4.5 - 7, z: -7.5 + 11, angle: 180 },
            { x: 4.5 - 7, z: -7.5 + 9, angle: 90 },
            { x: 4.5 - 4, z: -7.5 + 9, angle: 0 },
            { x: 4.5 - 4, z: -7.5 + 14, angle: 90 },
            { x: 4.5, z: -7.5 + 14, angle: 180 },
            { x: 4.5, z: -7.5 + 10, angle: 90 },
            { x: 4.5 + 2, z: -7.5 + 10, angle: 90 },
        ]



        this.paths.forEach(path => {
            const worldX = path.position.x - offsetX + 0.5
            const worldZ = path.position.z - offsetZ + 0.5

            if (path.type === 'path') {
                new StraightPath({
                    position: { x: worldX, z: worldZ },
                })

            }
            else if (path.type === 'tower') {
                new Tower({
                    position: { x: worldX, z: worldZ },
                })
            }
            else if (path.type === 'tree') {
                trees.push(
                    new Trees({
                        position: { x: worldX, z: worldZ },
                    })
                );
            }
            else if (path.type === 'stone') {
                new Stones({
                    position: { x: worldX, z: worldZ },
                })
            }
            else if (path.type === 'castle') {
                new Castle({
                    position: { x: worldX, z: worldZ },
                })
            }
            else {
                new Grass({
                    position: { x: worldX, z: worldZ },
                })
            }
        })

        const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0000 }))
        // this.experience.scene.add(box1)
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
        // this.experience.scene.add(sphere)
        sphere.position.set(0, 0.25, 0.5)
        
        const box = new THREE.Group()
        box.position.set(startPoint.x, 0.25, startPoint.z)
        box.add(box1)
        this.experience.scene.add(box)
        box.add(sphere)

        // Animation function with rotation support
        function animateAlongPath(object, points, speed = 2, rotateSpeed = 180) {
            let i = 0;

            function moveToNext() {
                if (i >= points.length - 1) return;

                const current = points[i];
                const next = points[i + 1];

                const dx = next.x - current.x;
                const dz = next.z - current.z;

                const distance = Math.sqrt(dx * dx + dz * dz);
                const duration = distance / speed;

                const tl = gsap.timeline({
                    onComplete: () => {
                        i++;
                        moveToNext();
                        gsap.to(object.rotation, {
                            y: THREE.MathUtils.degToRad(next.angle),
                            duration: 0.25, // or use distance/rotateSpeed for consistency
                            ease: "power1.inOut"
                        })
                    }
                });

                // Move
                tl.to(object.position, {
                    x: next.x,
                    z: next.z,
                    duration,
                    ease: "none"
                });
            }

            moveToNext();
        }


        // Start animation
        animateAlongPath(box, movePath, 2);


        Grass.combineIntoInstancedMesh()
        // ✅ collapse into one instanced mesh
        StraightPath.combineIntoInstancedMesh(this.experience.scene)
        Tower.combineIntoInstancedMesh(this.experience.scene)
        // ✅ After all are created, collapse them into instanced meshes
        // Trees.combineIntoInstancedMeshes(trees, experience.scene);
        console.log(this.scene);

        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name == "Grass") {
                console.log(child);
            }
            if (child instanceof THREE.Mesh && child.name == "GRASS_INSTANCE") {
                console.log(child);
            }
        })
    }
}

