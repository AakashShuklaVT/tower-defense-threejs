import Experience from '../../Experience.js'
import { TOWER_TYPES } from '../../Utils/CONSTANTS.js'
import Cannon from '../Defenses/Cannon.js'
import Wizard from '../Defenses/Wizard.js'
import XBow from '../Defenses/XBow.js'

export default class DefenderSpawner {
    static defenders = [] // store all active defenders

    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter

        // Listen for tower selection
        this.eventEmitter.on('towerSelected', (foundation, towerType) => {
            this.spawnDefender(foundation, towerType)
        })
    }

    spawnDefender(foundation, towerType) {
        if (!foundation || !foundation.tower) return

        console.log(`[DefenderSpawner] Spawning defender for ${towerType} tower`)

        let defender
        switch (towerType) {
            case TOWER_TYPES.WIZARD:
                defender = this.spawnWizard(foundation.tower)
                break
            case TOWER_TYPES.CANNON:
                defender = this.spawnCannon(foundation.tower)
                break
            case TOWER_TYPES.XBOW:
                defender = this.spawnXBow(foundation.tower)
                break
            default:
                console.warn(`[DefenderSpawner] Unknown tower type: ${towerType}`)
                return
        }

        if (defender) {
            DefenderSpawner.defenders.push(defender)
        }
    }

    spawnWizard(tower) {
        const wizard = new Wizard({
            position: {
                x: tower.position.x,
                y: 1.5,
                z: tower.position.z
            }
        })
        console.log('✨ Wizard defender spawned at tower', tower)
        return wizard
    }

    spawnCannon(tower) {
        // Placeholder for when you add Cannon defender
        const cannon = new Cannon({
            position: {
                x: tower.position.x,
                y: 1.5,
                z: tower.position.z
            }
        })
        console.log('💥 Cannon defender spawned at tower', tower)
        return cannon
    }

    spawnXBow(tower) {
        // Placeholder for when you add XBow defender
        const xbow = new XBow({
            position: {
                x: tower.position.x,
                y: 1.5,
                z: tower.position.z
            }
        })
        console.log('🏹 XBow defender spawned at tower', tower)
        return xbow
    }

    update() {
        DefenderSpawner.defenders.forEach(defender => {
            if (defender.update) defender.update()
        })
    }
}
