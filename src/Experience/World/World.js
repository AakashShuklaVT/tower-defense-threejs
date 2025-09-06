import Experience from '../Experience.js'
import TransformControlsManager from '../Utils/TransformControlsManager.js'
import Environment from './Environment.js'
import MapGenerator from './MapGenerator.js'
// import TowerModels from './TowerModels.js'
// import SkeletonEnemy from './Enemies/SkeletonEnemy.js'
import LevelManager from './LevelManager.js'
import RedPantherEnemy from './Enemies/RedPantherEnemy.js'
import GaurdamonEnemy from './Enemies/GaurdamonEnemy.js'
import GoblimonEnemy from './Enemies/GoblimonEnemy.js'
// import BombermanEnemy from './Enemies/BombermanEnemy.js'
// import FireWizard from './Defenders/FireWizard.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.levelManager = new LevelManager()


        this.resources.on('ready', async () => {
            await this.levelManager.load()

            this.environment = new Environment()
            this.mapGenerator = new MapGenerator(this.levelManager.getLevelData().levelData)

            this.enemies = []
            // Spawn skeleton using preloaded path
            // this.skeletonEnemy = new SkeletonEnemy({
            //     resourceName: 'skeleton',
            //     position: { x: 0, y: 0, z: 0 },
            //     scale: 0.22,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 2
            // })


            this.redPantherEnemy = new RedPantherEnemy({
                resourceName: 'redPanther',
                position: { x: 0, y: 0.1, z: 0 },
                scale: 0.35,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 0.75,
                levelData: this.levelManager.getLevelData().levelData,
            })

            this.gaurdamonEnemy = new GaurdamonEnemy({
                resourceName: 'gaurdamon',
                position: { x: 0, y: 0.5, z: 0 },
                scale: 0.25,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 0.85,
                levelData: this.levelManager.getLevelData().levelData,
            })

            this.goblimonEnemy = new GoblimonEnemy({
                resourceName: 'goblimon',
                position: { x: 0, y: 0.05, z: 0 },
                scale: 0.3,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 1.5,
                levelData: this.levelManager.getLevelData().levelData,
            })


            // this.mapGenerator.towers.forEach(tower => {
            //     tower.fireWizard.targets.push(this.redPantherEnemy.model)
            //     tower.fireWizard.targets.push(this.gaurdamonEnemy.model)
            //     tower.fireWizard.targets.push(this.goblimonEnemy.model)
            // })

            // this.fireWizard.targets.push(this.redPantherEnemy.model)
            // this.fireWizard.targets.push(this.gaurdamonEnemy.model)
            // this.fireWizard.targets.push(this.goblimonEnemy.model)
            // this.enemies.push(this.skeletonEnemy)
            this.enemies.push(this.redPantherEnemy)
            this.enemies.push(this.gaurdamonEnemy)
            this.enemies.push(this.goblimonEnemy)

            // this.transformControlsManager = new TransformControlsManager(
            //     this.experience.camera.instance,
            //     this.experience.renderer.instance.domElement,
            //     this.experience.scene,
            //     this.experience.scene.children
            // )

            // // After creating both camera and transform controls
            // this.transformControlsManager.setOrbitControls(this.experience.camera.controls);
        })
    }

    update() {
        this.enemies && this.enemies.forEach((enemy) => {
            enemy.update()
        })
        this.mapGenerator && this.mapGenerator.update()
        // this.fireWizard && this.fireWizard.update()
    }
}
