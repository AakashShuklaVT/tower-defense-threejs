import Experience from '../Experience.js'

export default class TowerSelectionUI {
    constructor() {
        this.experience = new Experience()
        this.uiElements = {}
        this.getUIElements()
        this.addEventListeners()

        this.experience.eventEmitter.on('foundationSelected', (foundation) => {
            this.currentFoundation = foundation
            this.toggleElementVisibility(this.uiElements.container, 'show')
        })
    }

    getUIElements() {
        // Parent container
        this.uiElements.container = document.querySelector('.tower-menu')
        // All tower buttons
        this.uiElements.buttons = document.querySelectorAll('.tower-card__btn')
    }

    addEventListeners() {
        if (!this.uiElements.buttons) return

        this.uiElements.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const towerType = button.dataset.tower
                this.handleTowerSelection(towerType)
            })
        })
    }

    handleTowerSelection(towerType) {
        if (!this.currentFoundation) return
        this.currentFoundation.createTower(towerType)
        this.toggleElementVisibility(this.uiElements.container, 'hide')
    }

    toggleElementVisibility(element, action = 'toggle') {
        if (!element) return

        if (action === 'show') {
            element.style.display = 'flex'
        }
        else if (action === 'hide') {
            element.style.display = 'none'
        }
        else if (action === 'toggle') {
            const isVisible = element.style.display === 'flex'
            element.style.display = isVisible ? 'none' : 'flex'
        }
    }
}
