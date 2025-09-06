import StraightPath from './Blocks/StraightPath.js'
import Experience from '../Experience.js'
import Grass from './Blocks/Grass.js'
import Tower from './Blocks/Tower.js'
import Trees from './Blocks/Trees.js'
import Stones from './Blocks/Stones.js'
import Castle from './Blocks/Castle.js'
import Foundation from './Blocks/Foundation.js'
import Boundary from './Blocks/Boundary.js'

export default class MapGenerator {
    constructor(levelData) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.levelData = levelData

        // ✅ Keep track of placed towers
        this.placedTowers = new Set()

        this.generateMap()
    }

    generateMap() {
        this.paths = this.levelData.grid
        const offsetX = this.levelData.width / 2
        const offsetZ = this.levelData.height / 2
        const trees = []
        const stones = []
        const boundaries = []
        this.towers = []
        this.foundations = []
        let yes = true
        // --- Build map objects ---
        this.paths.forEach(path => {
            const worldX = path.position.x - offsetX + 0.5
            const worldZ = path.position.z - offsetZ + 0.5

            if (path.type === 'path') {
                new StraightPath({ position: { x: worldX, z: worldZ } })
            }
            else if (path.type === 'tower') {
                this.foundations.push(new Foundation({ position: { x: worldX, z: worldZ } }))
            }
            else if (path.type === 'tree') {
                trees.push(new Trees({ position: { x: worldX, z: worldZ } }))
            }
            else if (path.type === 'stone') {
                new Stones({ position: { x: worldX, z: worldZ } })
            }
            else if (path.type === 'castle') {
                new Castle({ position: { x: worldX, z: worldZ } })
            }
            else if (path.type === 'base') {
                if ((path.position.x === 0 && path.position.z === 0) ||
                    (path.position.x === 0 && path.position.z === this.levelData.height - 1) ||
                    (path.position.x === this.levelData.width - 1 && path.position.z === 0) ||
                    (path.position.x === this.levelData.width - 1 && path.position.z === this.levelData.height - 1)) {

                    if (path.position.x === 0 && path.position.z === 0) {
                        new Boundary({ position: { x: worldX - 1.25, z: worldZ }, rotation: Math.PI, isCornerWall: true })
                    } else if (path.position.x === 0 && path.position.z === this.levelData.height - 1) {
                        new Boundary({ position: { x: worldX, z: worldZ + 1.25 }, rotation: -Math.PI / 2, isCornerWall: true })
                    } else if (path.position.x === this.levelData.width - 1 && path.position.z === 0) {
                        new Boundary({ position: { x: worldX, z: worldZ - 1.25 }, rotation: Math.PI / 2, isCornerWall: true })
                    } else if (path.position.x === this.levelData.width - 1 && path.position.z === this.levelData.height - 1) {
                        new Boundary({ position: { x: worldX + 1.25, z: worldZ }, rotation: 0, isCornerWall: true })
                    }
                } else {
                    if (path.position.x === 0) {
                        new Boundary({ position: { x: worldX - 1.25, z: worldZ }, rotation: - Math.PI / 2, isCornerWall: false })
                        return
                    }
                    if (path.position.z === 0) {
                        new Boundary({ position: { x: worldX, z: worldZ - 1.25 }, rotation: Math.PI, isCornerWall: false })
                        return
                    }
                    if (path.position.x === this.levelData.width - 1) {
                        new Boundary({ position: { x: worldX + 1.25, z: worldZ }, rotation: Math.PI / 2, isCornerWall: false })
                        return
                    }
                    if (path.position.z === this.levelData.height - 1) {
                        new Boundary({ position: { x: worldX, z: worldZ + 1.25 }, rotation: 0, isCornerWall: false })
                        return
                    }
                }
            }
        })

        // --- Instancing (performance) ---
        // for (let i = 0; i < 100; i++) {
        //     for (let j = 0; j < 100; j++) {
        //         const worldX = i - 100 / 2 + 0.5
        //         const worldZ = j - 100 / 2 + 0.5
        //         new Grass({ position: { x: worldX, z: worldZ } })
        //     }
        // }
        new Grass({ position: { x: 0, z: 0 } })
        // Grass.combineIntoInstancedMesh()
        StraightPath.combineIntoInstancedMesh(this.experience.scene)
        Trees.combineIntoInstancedMeshes(trees, this.experience.scene)
        Stones.combineIntoInstancedMeshes(this.experience.scene)
        Boundary.combineIntoInstancedMeshes(this.experience.scene)
    }

    setupTower(position, previosTower, name) {
        // ✅ Convert position into a unique key
        const key = `${position.x}_${position.z}`

        if (!this.placedTowers.has(key)) {
            this.placedTowers.add(key) // store it
            previosTower.script.disposeObject()

            const newTower = new Tower({ position, name })
            this.towers.push(newTower)
            // ✅ Add enemies only to this new tower
            if (newTower?.fireWizard) {
                newTower.fireWizard.targets.push(this.experience.world.redPantherEnemy.model)
                newTower.fireWizard.targets.push(this.experience.world.gaurdamonEnemy.model)
                newTower.fireWizard.targets.push(this.experience.world.goblimonEnemy.model)
            }

        } else {
            console.log("Tower already exists at this position:", key)
            return
        }
    }

    setupFoundation(position) {
        const key = `${position.position.x}_${position.position.z}`
        console.log(key);

        this.placedTowers.delete(key) // remove tower if any
        this.foundations.push(new Foundation(position))
    }

    update() {
        this.towers.forEach(tower => tower.update())
    }
}
