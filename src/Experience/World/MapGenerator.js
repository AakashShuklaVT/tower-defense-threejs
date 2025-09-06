import StraightPath from './Blocks/StraightPath.js'
import Experience from '../Experience.js'
import Grass from './Blocks/Grass.js'
import Tower from './Blocks/Tower.js'
import Trees from './Blocks/Trees.js'
import Stones from './Blocks/Stones.js'
import Castle from './Blocks/Castle.js'
import Foundation from './Blocks/Foundation.js'

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
        this.towers = []
        this.foundations = []
        // --- Build map objects ---
        this.paths.forEach(path => {
            const worldX = path.position.x - offsetX + 0.5
            const worldZ = path.position.z - offsetZ + 0.5

            if (path.type === 'path') {
                new StraightPath({ position: { x: worldX, z: worldZ } })
            }
            else if (path.type === 'tower') {
                // this.towers.push(new Tower({ position: { x: worldX, z: worldZ } }))
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
            else {
                new Grass({ position: { x: worldX, z: worldZ } })
            }
        })

        // --- Instancing (performance) ---
        Grass.combineIntoInstancedMesh()
        StraightPath.combineIntoInstancedMesh(this.experience.scene)
        // Tower.combineIntoInstancedMesh(this.experience.scene)
        // Trees.combineIntoInstancedMeshes(trees, this.experience.scene)
    }

    setupTower(position, previosTower, name) {
        // ✅ Convert position into a unique key
        const key = `${position.x}_${position.z}`
        // Check if tower is already placed here
        if (!this.placedTowers.has(key)) {
            this.placedTowers.add(key) // store it
            previosTower.script.disposeObject()
            if (name === 'fireWizard') {
                const newTower = new Tower({ position })
                this.towers.push(newTower)
                // ✅ Add enemies only to this new tower
                if (newTower?.fireWizard) {
                    newTower.fireWizard.targets.push(this.experience.world.redPantherEnemy.model)
                    newTower.fireWizard.targets.push(this.experience.world.gaurdamonEnemy.model)
                    newTower.fireWizard.targets.push(this.experience.world.goblimonEnemy.model)
                }
            }
        } else {
            console.log("Tower already exists at this position:", key)
            return
        }
    }

    update() {
        // Tower.allTowers.forEach(tower => {
        //     tower.update()
        // })
        this.towers.forEach(tower => tower.update())
    }
}
