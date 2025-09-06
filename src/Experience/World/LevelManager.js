// import { extractMovingPath } from '../Utils/PathExtractor.js'

export default class LevelManager {
    constructor() {
        this.levelData = null
        this.movePath = null
    }

    async load() {
        if (this.levelData) return 

        const response = await fetch('./Experience/Configs/LevelData.json')
        this.levelData = await response.json()
        const towersDataResponse = await fetch('./Experience/Configs/TowersData.json')
        this.towersData = await towersDataResponse.json()
        this.movePath = this.levelData.pathPoints
        // return this.levelData
        // this.movePath = extractMovingPath(this.levelData)
    }

    getLevelData() {
        return {levelData: this.levelData, movePath: this.movePath}
    }
}
