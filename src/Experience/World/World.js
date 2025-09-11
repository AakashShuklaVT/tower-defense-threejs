import Experience from '../Experience.js'
import TransformControlsManager from '../Utils/TransformControlsManager.js'
import Environment from './Environment.js'
import MapGenerator from './MapGenerator.js'
import LevelManager from './LevelManager.js'
import RedPantherEnemy from './Enemies/RedPantherEnemy.js'
import GaurdamonEnemy from './Enemies/GaurdamonEnemy.js'
import GoblimonEnemy from './Enemies/GoblimonEnemy.js'
import RaycastManager from '../Utils/RaycastManager.js'
import UIManager from '../UI/UIManager.js'
import TowerBuilder from './Systems/TowerBuilder.js'
import DefenderSpawner from './Systems/DefenderSpawner.js'


export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.levelManager = new LevelManager()
        this.uiManager = new UIManager()
        this.enemies = []

        this.towerBuilder = new TowerBuilder()
        this.defenderSpawner = new DefenderSpawner()

        this.resources.on('ready', async () => {
            // Load level data
            await this.levelManager.load()

            // Environment (sky, lighting, etc.)
            this.environment = new Environment()

            // Enemies
            this.redPantherEnemy = new RedPantherEnemy({
                resourceName: 'redPanther',
                position: { x: 0, y: 0.1, z: 0 },
                scale: 0.48,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 0.8,
                levelData: this.levelManager.getLevelData().levelData,
            })

            this.gaurdamonEnemy = new GaurdamonEnemy({
                resourceName: 'gaurdamon',
                position: { x: 0, y: 0.5, z: 0 },
                scale: 0.5,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 1,
                levelData: this.levelManager.getLevelData().levelData,
            })

            this.goblimonEnemy = new GoblimonEnemy({
                resourceName: 'goblimon',
                position: { x: 0, y: 0.05, z: 0 },
                scale: 0.3,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 1.4,
                levelData: this.levelManager.getLevelData().levelData,
            })

            this.enemies.push(this.gaurdamonEnemy)
            this.enemies.push(this.redPantherEnemy)
            this.enemies.push(this.goblimonEnemy)

            // Map + foundations
            this.mapGenerator = new MapGenerator(this.levelManager.getLevelData().levelData)

            // Raycasting setup (click detection)
            this.raycastManager = new RaycastManager(this.mapGenerator.foundations)

            this.addTransformControls()
        })
    }

    getEnemies() {
        return [...this.enemies]
    }

    addTransformControls() {
        this.transformControlsManager = new TransformControlsManager(
            this.experience.camera.instance,
            this.experience.renderer.instance.domElement,
            this.experience.scene,
            this.experience.scene.children
        )
        // After creating both camera and transform controls
        this.transformControlsManager.setOrbitControls(this.experience.camera.controls);
    }

    update() {
        this.enemies && this.enemies.forEach((enemy) => {
            enemy.update()
        })
        this.defenderSpawner && this.defenderSpawner.update()
        // this.mapGenerator && this.mapGenerator.update() -> needed to update water
    }
}
