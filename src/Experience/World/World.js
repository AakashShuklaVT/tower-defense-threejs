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
import DemogorgonEnemy from './Enemies/DemogorgonEnemy.js'
import FloramonEnemy from './Enemies/FloramonEnemy.js'
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
            this.redPantherCount = 10;
            // Spawn skeleton using preloaded path
            // this.skeletonEnemy = new SkeletonEnemy({
            //     resourceName: 'skeleton',
            //     position: { x: 0, y: 0, z: 0 },
            //     scale: 0.22,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 2
            // })
            this.waves = [
                [
                    { EnemyClass: RedPantherEnemy, resourceName: 'redPanther', count: 5, delay: 2000, scale: 0.35, speed: 0.75 },
                    { EnemyClass: GoblimonEnemy, resourceName: 'goblimon', count: 3, delay: 3000, scale: 0.3, speed: 1.2 },
                ],
                [
                    { EnemyClass: GaurdamonEnemy, resourceName: 'gaurdamon', count: 2, delay: 3000, scale: 0.5, speed: 0.85 },
                    { EnemyClass: DemogorgonEnemy, resourceName: 'demogorgon', count: 2, delay: 4000, scale: 0.005, speed: 2 },
                ]
            ];

            // const redPantherSpawner = setInterval(() => {
            //     if (this.redPantherCount > 0) {
            //         this.spawnEnemy(RedPantherEnemy, {
            //             resourceName: 'redPanther',
            //             position: { x: 0, y: 0.1, z: 0 },
            //             scale: 0.35,
            //             movePath: this.levelManager.getLevelData().movePath,
            //             speed: 0.75,
            //             levelData: this.levelManager.getLevelData().levelData,
            //         })
            //         this.redPantherCount--;
            //     } else {
            //         clearInterval(redPantherSpawner)
            //     }
            // }, 2000)

            this.spawnWave(0); // first wave
            // const gaurdamonEnemy = new GaurdamonEnemy({
            //     resourceName: 'gaurdamon',
            //     position: { x: 0, y: 0.5, z: 0 },
            //     scale: 0.5,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 0.85,
            //     levelData: this.levelManager.getLevelData().levelData,
            // })

            // const goblimonEnemy = new GoblimonEnemy({
            //     resourceName: 'goblimon',
            //     position: { x: 0, y: 0.05, z: 0 },
            //     scale: 0.3,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 1.5,
            //     levelData: this.levelManager.getLevelData().levelData,
            // })

            // const demogorgonEnemy = new DemogorgonEnemy({
            //     resourceName: 'demogorgon',
            //     position: { x: 0, y: 0.05, z: 0 },
            //     scale: 0.005,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 2,
            //     levelData: this.levelManager.getLevelData().levelData,
            // })

            // const floramonEnemy = new FloramonEnemy({
            //     resourceName: 'floramon',
            //     position: { x: 0, y: 0.05, z: 0 },
            //     scale: 0.25,
            //     movePath: this.levelManager.getLevelData().movePath,
            //     speed: 2.5,
            //     levelData: this.levelManager.getLevelData().levelData,
            // })


            // this.mapGenerator.towers.forEach(tower => {
            //     tower.fireWizard.targets.push(this.redPantherEnemy.model)
            //     tower.fireWizard.targets.push(this.gaurdamonEnemy.model)
            //     tower.fireWizard.targets.push(this.goblimonEnemy.model)
            // })

            // this.fireWizard.targets.push(this.redPantherEnemy.model)
            // this.fireWizard.targets.push(this.gaurdamonEnemy.model)
            // this.fireWizard.targets.push(this.goblimonEnemy.model)
            // this.enemies.push(this.skeletonEnemy)
            // this.enemies.push(this.redPantherEnemy)
            // this.enemies.push(this.gaurdamonEnemy)
            // this.enemies.push(this.goblimonEnemy)
            // this.enemies.push(this.demogorgonEnemy)
            // this.enemies.push(this.floramonEnemy)

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

    checkWaveComplete(waveIndex) {
        const waveEnemies = this.enemies.filter(e => this.waves[waveIndex].some(w => e instanceof w.EnemyClass));
        if (waveEnemies.length === 0) {
            this.spawnWave(waveIndex + 1);
        }
    }

    spawnWave(waveIndex = 0) {
        if (!this.waves || waveIndex >= this.waves.length) return;

        const wave = this.waves[waveIndex];
        wave.forEach(config => {
            let spawned = 0;
            const spawner = setInterval(() => {
                if (spawned < config.count) {
                    this.spawnEnemy(config.EnemyClass, {
                        resourceName: config.resourceName,
                        position: { x: 0, y: 0.1, z: 0 },
                        scale: config.scale,
                        movePath: this.levelManager.getLevelData().movePath,
                        speed: config.speed,
                        levelData: this.levelManager.getLevelData().levelData,
                    });
                    spawned++;
                } else {
                    clearInterval(spawner);
                }
            }, config.delay);
        });
    }



    addEnemiesToTower(tower) {
        this.enemies.forEach(enemy => {
            if (enemy.model) {
                tower.fireWizard.targets.push(enemy.model);
            }
        });
    }


    spawnEnemy(EnemyClass, { resourceName, position, scale, movePath, speed, levelData }) {
        const enemy = new EnemyClass({
            resourceName,
            position,
            scale,
            movePath,
            speed,
            levelData,
        })

        this.enemies.push(enemy)

        // ✅ also add this enemy to all existing towers
        if (this.mapGenerator && this.mapGenerator.towers) {
            this.mapGenerator.towers.forEach(tower => {
                if (tower.fireWizard && enemy.model) {
                    tower.fireWizard.targets.push(enemy.model)
                }
            })
        }

        return enemy
    }

    update() {
        this.enemies && this.enemies.forEach((enemy) => {
            enemy.update()
        })
        this.mapGenerator && this.mapGenerator.update()
        // this.fireWizard && this.fireWizard.update()
    }
}
