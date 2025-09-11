import Experience from "../../Experience"
import { TOWER_TYPES } from "../../Utils/CONSTANTS.js"
import Tower from "../../World/Blocks/Tower.js"

export default class TowerBuilder {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter

        // Listen for tower selection
        this.eventEmitter.on('towerSelected', (foundation, towerType) => {
            this.buildTower(foundation, towerType)
        })
    }

    buildTower(foundation, towerType) {
        if (!foundation) return

        switch (towerType) {
            case TOWER_TYPES.WIZARD:
                this.buildWizardTower(foundation)
                break

            case TOWER_TYPES.CANNON:
                this.buildCannonTower(foundation)
                break
            case TOWER_TYPES.XBOW:
                this.buildXBowTower(foundation)
                break
            default:
                console.warn(`[TowerBuilder] Unknown tower type: ${towerType}`)
        }
    }

    buildWizardTower(foundation) {
        console.log("[TowerBuilder] Building Wizard Tower on foundation", foundation)

        foundation.tower = new Tower({
            type: TOWER_TYPES.WIZARD,
            position: { x: foundation.position.x, y: 0, z: foundation.position.z },
        })

        foundation.model.visible = false
    }

    buildCannonTower(foundation) {
        console.log("[TowerBuilder] Building Cannon Tower on foundation", foundation)

        foundation.tower = new Tower({
            type: TOWER_TYPES.CANNON,
            position: { x: foundation.position.x, y: 0, z: foundation.position.z },
        })

        foundation.model.visible = false
    }

    buildXBowTower(foundation) {
        console.log("[TowerBuilder] Building XBow Tower on foundation", foundation)

        foundation.tower = new Tower({
            type: TOWER_TYPES.XBOW,
            position: { x: foundation.position.x, y: 0, z: foundation.position.z },
        })

        foundation.model.visible = false
    }
}
