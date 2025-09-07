import { INITIAL_COINS_AMOUNT, INITIAL_TOWER_HEALTH } from "../Configs/GameConfig";
import Experience from "../Experience";

export default class HUDManager {
    constructor(containerId) {
        this.experience = new Experience();
        // Create HUD container
        this.container = document.getElementById(containerId);
        this.container.classList.add('hud');
        this.container.style.display = 'flex';
        // Create Coins display
        this.coinsValue = INITIAL_COINS_AMOUNT;
        this.coinsElement = document.createElement('div');
        this.coinsElement.classList.add('hud-item');
        this.coinsElement.innerHTML = `
        <img src="https://img.icons8.com/emoji/48/000000/money-bag-emoji.png" alt="Coins">
        <span id="coins">${this.coinsValue}</span>
        `;
        this.container.appendChild(this.coinsElement);

        // Create Tower Health display
        this.healthValue = INITIAL_TOWER_HEALTH;
        this.healthElement = document.createElement('div');
        this.healthElement.classList.add('hud-item');
        this.healthElement.innerHTML = `
        <span>❤️ Tower Health:</span>
        <div class="health-bar">
            <div class="health-fill" id="towerHealth"></div>
        </div>
        `;
        this.container.appendChild(this.healthElement);

        this.healthFill = this.healthElement.querySelector('.health-fill');
    }

    // Update coins
    addCoins(amount) {
        this.coinsValue += amount;
        this.updateCoins()
    }

    // Update tower health
    setHealth() {
        const healthPercent = (this.healthValue / INITIAL_TOWER_HEALTH) * 100;
        this.healthFill.style.width = healthPercent + '%';
    }

    // Increase coins
    removeCoins(amount) {
        this.coinsValue -= amount;
        this.updateCoins()
    }

    updateCoins() {
        this.coinsElement.querySelector('span').textContent = this.coinsValue;
    }

    // Decrease tower health
    takeDamage(amount) {
        this.healthValue -= amount;
        console.log(this.healthValue);
        if (this.healthValue <= 0) {
            this.healthValue = 0;
            this.experience.world.showGameOverScreen()
            return;
        }
        this.setHealth();
    }
}