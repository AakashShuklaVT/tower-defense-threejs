import { INITIAL_COINS_AMOUNT } from "../Configs/GameConfig";
import Experience from "../Experience";

export default class CoinsManager {
    _availableCoins = 0;
    constructor() {
        this.experience = new Experience();
        this.hudManager = this.experience.world.hudManager;
        this._availableCoins = INITIAL_COINS_AMOUNT;
    }

    addToCurrentAmount = (amount) => {
        this._availableCoins += amount
        this.hudManager.addCoins(amount);
    }

    subtractFromCurrentAmount = (amount) => {
        this._availableCoins -= amount;
        this.hudManager.removeCoins(amount);
    }

    getCurrentAmount = () => this._availableCoins;

    resetAmount = () => this._availableCoins = 0;
}