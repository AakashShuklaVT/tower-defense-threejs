export default class LevelManager {
    constructor() {
        this.levelData = null
        this.movePath = null
    }

    async load() {
        if (this.levelData) return 

        const response = await fetch('/Configs/LevelData.json')
        this.levelData = await response.json()
        
        this.movePath = this.levelData.pathPoints
    }

    getLevelData() {
        return {levelData: this.levelData, movePath: this.movePath}
    }
}
