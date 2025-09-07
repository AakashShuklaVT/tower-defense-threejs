export default class CoinsManager {
    _availableCoins = 0;
    constructor() {
        this._availableCoins = 0;
    }

    addToCurrentAmount = (amount) => this._availableCoins += amount

    subtractFromCurrentAmount = (amount) => this._availableCoins -= amount;

    getCurrentAmount = () => this._availableCoins;

    resetAmount = () => this._availableCoins = 0;
}