import StraightPath from './Blocks/StraightPath.js'
import Experience from '../Experience.js'
import Tower from './Blocks/Tower.js'
import Trees from './Blocks/Trees.js'
import Stones from './Blocks/Stones.js'
import Castle from './Blocks/Castle.js'
import Foundation from './Blocks/Foundation.js'
import WaterBlock from './Blocks/WaterBlock.js'
import Ground from './Blocks/Ground.js'
import House from './Blocks/House.js'


const BlockType = {
    PATH: 'path',
    TOWER: 'tower',
    TREE: 'tree',
    STONE: 'stone',
    CASTLE: 'castle',
    HOUSE: 'house',
}

export default class MapGenerator {
    constructor(levelData) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.levelData = levelData
        this.towers = []
        this.foundations = []
        this.generateMap()
    }

    generateMap() {
        this.paths = this.levelData.grid
        const offsetX = this.levelData.width / 2
        const offsetZ = this.levelData.height / 2
        const trees = []

        // --- Build map objects ---
        this.paths.forEach(path => {
            const worldX = path.position.x - offsetX + 0.5
            const worldZ = path.position.z - offsetZ + 0.5

            switch (path.type) {
                case BlockType.PATH:
                    new StraightPath({ position: { x: worldX, z: worldZ } })
                    break

                case BlockType.TOWER:
                    const foundation = new Foundation({ position: { x: worldX, z: worldZ } })
                    this.foundations.push(foundation)
                    break

                case BlockType.TREE:
                    trees.push(new Trees({ position: { x: worldX, z: worldZ } }))
                    break

                case BlockType.STONE:
                    new Stones({ position: { x: worldX, z: worldZ } })
                    break

                case BlockType.CASTLE:
                    new Castle({ position: { x: worldX, z: worldZ } })
                    break
                case BlockType.HOUSE:
                    new House({ position: { x: worldX, z: worldZ } })
                    break
            }
        })

        // --- Ground & Water ---
        new Ground({ position: { x: 0, z: 0 } })
        this.water = new WaterBlock()

        // --- Instancing (performance) ---
        StraightPath.combineIntoInstancedMesh(this.experience.scene)
        Tower.combineIntoInstancedMesh(this.experience.scene)
        Trees.combineIntoInstancedMeshes(trees, this.experience.scene)
    }

    update() {
        this.foundations.forEach(foundation => foundation.update())
        this.water && this.water.update()
    }
}
