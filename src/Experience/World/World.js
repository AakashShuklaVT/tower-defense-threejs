import Experience from '../Experience.js'
import TransformControlsManager from '../Utils/TransformControlsManager.js'
import Environment from './Environment.js'
import MapGenerator from './MapGenerator.js'
import LevelManager from './LevelManager.js'
import RedPantherEnemy from './Enemies/RedPantherEnemy.js'
import GaurdamonEnemy from './Enemies/GaurdamonEnemy.js'
import GoblimonEnemy from './Enemies/GoblimonEnemy.js'
import BombermanEnemy from './Enemies/BombermanEnemy.js'
import RaycastManager from '../Utils/RaycastManager.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.levelManager = new LevelManager()
        this.enemies = []
        
        
        this.resources.on('ready', async () => {
            await this.levelManager.load()
            
            this.environment = new Environment()
            
            this.redPantherEnemy = new RedPantherEnemy({
                resourceName: 'redPanther',
                position: { x: 0, y: 0.1, z: 0 },
                scale: 0.5,
                movePath: this.levelManager.getLevelData().movePath,
                speed: 1.2,
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
            
            this.mapGenerator = new MapGenerator(this.levelManager.getLevelData().levelData)
            this.raycastManager = new RaycastManager(this.mapGenerator.foundations)
            

            // skinned mesh issue in this model also not pushed in this.enemies array
            // this.bombermanEnemy = new BombermanEnemy({
            //     resourceName: 'bomberman',
            //     position: { x: 0, y: 0.05, z: 0 },
            //     scale: 0.000001,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 0.3
            // })


            // this.addTransformControls()
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
        this.mapGenerator && this.mapGenerator.update()
    }
}
