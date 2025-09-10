import Experience from '../Experience.js'
import TowerSelectionUI from './TowerSelectionUI.js'

let instance = null

export default class UIManager {
    constructor() {
        if (instance) {
            return instance
        }
        instance = this
        this.experience = new Experience()
        this.init()
        this.getUIElements()
        this.addEventListeners()
    }

    init() {
       this.towerSelectionUI = new TowerSelectionUI()
    }

    getUIElements() {
        
    }

    addEventListeners() {
        
    }


    toggleElementVisibility(element, action = 'toggle') {
        if (!element) return;

        if (action === 'show') {
            element.style.display = 'flex';
        }
        else if (action === 'hide') {
            element.style.display = 'none';
        }
        else if (action === 'toggle') {
            const isVisible = element.style.display === 'flex';
            element.style.display = isVisible ? 'none' : 'flex';
        }
    }
}
