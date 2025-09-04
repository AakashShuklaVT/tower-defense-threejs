import * as THREE from 'three'
import StraightPath from './StraightPath.js'
import Experience from '../Experience.js'
import Grass from './Grass.js'
import Tower from './Tower.js'

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

        this.paths.forEach(path => {
            const worldX = path.position.x - offsetX + 0.5
            const worldZ = path.position.z - offsetZ + 0.5

            if (path.type === 'path') {
                new StraightPath({
                    position: { x: worldX, z: worldZ },
                })
            }
            else if (path.type === 'grass') {
                new Grass({
                    position: { x: worldX, z: worldZ },
                })
            }
            else if (path.type === 'tower') {
                new Tower({
                    position: { x: worldX, z: worldZ },
                })
            }
        })

    }
}
