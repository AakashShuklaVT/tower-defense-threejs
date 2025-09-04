import Experience from '../Experience.js'
import TransformControlsManager from '../Utils/TransformControlsManager.js'
import Environment from './Environment.js'
import MapGenerator from './MapGenerator.js'
import TowerModels from './TowerModels.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            // this.towerModels = new TowerModels()
            // this.floor = new Floor()
            this.environment = new Environment()
            this.mapGenerator = new MapGenerator()
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

    }
}