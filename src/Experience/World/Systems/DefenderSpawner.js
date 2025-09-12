import Experience from '../../Experience.js'
import { TOWER_TYPES } from '../../Utils/CONSTANTS.js'
import Cannon from '../Defenses/Cannon.js'
import Freeze from '../Defenses/Freeze.js'
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
            case TOWER_TYPES.FREEZE:
                defender = this.spawnFreeze(foundation.tower)
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
        return xbow
    }

    spawnFreeze(tower) {
        // Placeholder for when you add Freeze defender
        const freeze = new Freeze({
            position: {
                x: tower.position.x,
                y: 1.5,
                z: tower.position.z
            }
        })
        return freeze
    }

    update() {
        DefenderSpawner.defenders.forEach(defender => {
            if (defender.update) defender.update()
        })
    }
}
