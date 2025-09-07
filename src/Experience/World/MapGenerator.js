import StraightPath from './Blocks/StraightPath.js'
import Experience from '../Experience.js'
import Ground from './Blocks/Ground.js'
import Tower from './Blocks/Tower.js'
import Trees from './Blocks/Trees.js'
import Stones from './Blocks/Stones.js'
import Castle from './Blocks/Castle.js'
import Foundation from './Blocks/Foundation.js'
import Boundary from './Blocks/Boundary.js'
import Grass from './Blocks/Grass.js'
import House from './Blocks/Houses.js'

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
        const pathPositions = []
        let isCastleCreated = false;

        this.paths.forEach(path => {
            const worldX = path.position.x - offsetX + 0.5
            const worldZ = path.position.z - offsetZ + 0.5

            if (path.type === 'path') {
                new StraightPath({ position: { x: worldX, z: worldZ } })
                pathPositions.push({ x: worldX, z: worldZ })
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
                if (!isCastleCreated) {
                    isCastleCreated = true;
                    new Castle({ position: { x: worldX, z: worldZ } })
                }
            }
            else if (path.type === "home") {
                new House({ position: { x: worldX, z: worldZ } })
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

        new Ground({ position: { x: 0, z: 0 } });
        new Grass(1000, pathPositions);
        Grass.combineIntoInstancedMeshes(this.experience.scene)
        StraightPath.combineIntoInstancedMesh(this.experience.scene)
        Trees.combineIntoInstancedMeshes(trees, this.experience.scene)
        Stones.combineIntoInstancedMeshes(this.experience.scene)
        Boundary.combineIntoInstancedMeshes(this.experience.scene)
    }

    setupTower(position, previousTower, name) {
        const key = `${position.x}_${position.z}`

        if (!this.placedTowers.has(key)) {
            this.placedTowers.add(key)

            if (previousTower && previousTower.userData.script) {
                previousTower.userData.script.disposeObject()
            }

            const newTower = new Tower({ position, name })
            this.towers.push(newTower)

            // ✅ hook into World to add enemies to this tower
            const world = this.experience.world
            if (world) {
                world.addEnemiesToTower(newTower)
            }

            return newTower
        } else {
            return null
        }
    }


    setupFoundation(position) {
        const key = `${position.position.x}_${position.position.z}`;
        this.placedTowers.delete(key);
        this.foundations.push(new Foundation(position));
    }

    update() {
        this.towers.forEach(tower => tower.update());
    }
}
