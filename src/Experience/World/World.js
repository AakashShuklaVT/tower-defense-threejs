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
import CoinsManager from './CoinsManager.js'
import HUDManager from './HUDManager.js'
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
                // Wave 1
                [
                    { EnemyClass: RedPantherEnemy, resourceName: 'redPanther', count: 5, delay: 2000, scale: 0.35, speed: 0.75 },
                    { EnemyClass: GoblimonEnemy, resourceName: 'goblimon', count: 3, delay: 3000, scale: 0.3, speed: 1.2 },
                ],
                // Wave 2
                [
                    { EnemyClass: GaurdamonEnemy, resourceName: 'gaurdamon', count: 2, delay: 3000, scale: 0.5, speed: 2 },
                    { EnemyClass: DemogorgonEnemy, resourceName: 'demogorgon', count: 2, delay: 4000, scale: 0.005, speed: 2 },
                ],
                // Wave 3
                [
                    { EnemyClass: RedPantherEnemy, resourceName: 'redPanther', count: 4, delay: 1500, scale: 0.35, speed: 0.9 },
                    { EnemyClass: FloramonEnemy, resourceName: 'floramon', count: 2, delay: 2500, scale: 0.25, speed: 2.5 },
                    { EnemyClass: GoblimonEnemy, resourceName: 'goblimon', count: 3, delay: 2000, scale: 0.3, speed: 1.5 },
                ],
                // Wave 4
                [
                    { EnemyClass: GaurdamonEnemy, resourceName: 'gaurdamon', count: 3, delay: 3000, scale: 0.5, speed: 2 },
                    { EnemyClass: DemogorgonEnemy, resourceName: 'demogorgon', count: 3, delay: 3500, scale: 0.005, speed: 2.2 },
                    { EnemyClass: RedPantherEnemy, resourceName: 'redPanther', count: 2, delay: 1800, scale: 0.35, speed: 0.8 },
                ],
                // Wave 5
                [
                    { EnemyClass: FloramonEnemy, resourceName: 'floramon', count: 4, delay: 2500, scale: 0.25, speed: 2.7 },
                    { EnemyClass: GoblimonEnemy, resourceName: 'goblimon', count: 4, delay: 2000, scale: 0.3, speed: 1.6 },
                    { EnemyClass: DemogorgonEnemy, resourceName: 'demogorgon', count: 2, delay: 4000, scale: 0.005, speed: 2.5 },
                    { EnemyClass: RedPantherEnemy, resourceName: 'redPanther', count: 2, delay: 5000, scale: 0.35, speed: 0.8 }
                ],
            ];


            this.totalEnemiesInFirstWave = this.getTotalEnemiesInWave(0);
            this.totalEnemiesInSecondWave = this.getTotalEnemiesInWave(1);
            this.totalEnemiesInThirdWave = this.getTotalEnemiesInWave(2);
            this.totalEnemiesInFourthWave = this.getTotalEnemiesInWave(3);
            this.totalEnemiesInFifthWave = this.getTotalEnemiesInWave(4);

            this.currentWaveIndex = 0;
            this.currentWaveEnemiesKilled = 0;
            this.isGameOver = false;
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
            document.querySelector('.enemy-container-continue-btn').addEventListener('click', this.startGame.bind(this))// const gaurdamonEnemy = new GaurdamonEnemy({
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

    showGameWinScreen() {
        const winScreen = document.querySelector('.td-win-screen-container');
        winScreen.style.display = 'flex';
        // Hide win screen and restart game
        setTimeout(() => {
            winScreen.classList.add('show');
        }, 2500)
    }

    startGame = () => {
        this.hudManager = new HUDManager('hud')
        this.coinsManager = new CoinsManager()
        setTimeout(() => {
            this.spawnWave(0); // first wave
        }, 1000)
        this.experience.raycastManager.intializeRaycaster()
        this.experience.raycastManager.setEnabled(true)
        document.querySelector('.enemy-info-container').style.display = 'none';
    }

    getTotalEnemiesInWave(waveIndex) {
        if (!this.waves || waveIndex >= this.waves.length) return 0;

        const wave = this.waves[waveIndex];
        return wave.reduce((total, config) => total + config.count, 0);
    }


    checkWaveComplete(waveIndex) {
        console.log("currentWaveEnemiesKilled", this.currentWaveEnemiesKilled);
        console.log("totalEnemiesInWave", this.getTotalEnemiesInWave(this.currentWaveIndex));

        if (this.currentWaveEnemiesKilled === this.getTotalEnemiesInWave(this.currentWaveIndex) & !this.isGameOver) {
            this.currentWaveEnemiesKilled = 0;
            this.currentWaveIndex++;
            this.spawnWave(this.currentWaveIndex);
            if (this.currentWaveIndex === this.waves.length) {
                this.isGameOver = true;
                this.showWavePopup()
                this.mapGenerator.towers.forEach((tower) => {
                    if (tower.fireWizard) {
                        tower.fireWizard.playWin();
                    }
                })
            }
        }
    }

    showWavePopup() {
        const textBox = document.querySelector('.wave-incoming-text_box');
        const textWrapper = document.querySelector('.wave-incoming-text_box .wave-incoming-letters');

        // Determine the text to show
        let displayText = this.currentWaveIndex == this.waves.length - 1 ? 'Final Wave!' : textWrapper.textContent;
        if (this.isGameOver) {
            displayText = 'You Successfully Defended!';
            this.showGameWinScreen()
        }
        // Wrap each letter in a span
        textWrapper.innerHTML = displayText.replace(/\S/g, "<span class='wave-incoming-letter'>$&</span>");

        // Reset initial state before animation
        textBox.style.display = 'flex';
        textBox.style.opacity = 1; // reset container opacity
        const letters = document.querySelectorAll('.wave-incoming-text_box .wave-incoming-letter');
        letters.forEach(letter => {
            letter.style.transform = 'scale(0)'; // reset each letter scale
        });

        anime.timeline({ loop: false })
            .add({
                targets: '.wave-incoming-text_box .wave-incoming-letter',
                scale: [0, 1],
                duration: 1500,
                elasticity: 600,
                delay: (el, i) => 45 * (i + 1)
            }).add({
                targets: '.wave-incoming-text_box',
                opacity: 0,
                duration: 1000,
                easing: "easeOutExpo",
                delay: 500 // small delay before fading out
            });
    }

    spawnWave(waveIndex = 0) {
        if (!this.waves || waveIndex >= this.waves.length) return;
        setTimeout(() => {
            this.showWavePopup()
        }, 1000)
        // Mark this wave as active
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

    removeEnemy(target) {
        if (!target) return;
        this.enemies = this.enemies.filter(enemy => enemy.model.uuid != target.uuid)
        this.currentWaveEnemiesKilled++;
        console.log("currentWaveEnemiesKilled", this.currentWaveEnemiesKilled);
        console.log("totalEnemiesInWave", this.getTotalEnemiesInWave(this.currentWaveIndex));
        if (this.currentWaveEnemiesKilled === this.getTotalEnemiesInWave(this.currentWaveIndex)) {
            this.checkWaveComplete(this.currentWaveIndex);
        }
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
        this.enemies && this.enemies.forEach(enemy => enemy.update());
        this.mapGenerator && this.mapGenerator.update();
    }

}
