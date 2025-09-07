export const DEFENSE_TYPES = [
    'fireWizard',
    // 'cannonDefense',
    // 'freezeDefense', 
    // 'xBowDefense'
];

export const TREES_SCALING = {
    0: 0.5,
    1: 0.5,
    2: 0.5,
    3: 0.5,
    4: 0.5,
    5: 0.5
}

export const STONE_SCALING = {
    0: 1.5,
    1: 0.001,
    2: 0.9,
}

export const CANNON_DAMAGE = 150;
export const CANNON_ATTACK_SPEED = 10;
export const CANNON_RANGE = 7;

export const INITIAL_COINS_AMOUNT = 300;
export const INITIAL_TOWER_HEALTH = 5000;
export const MIN_AMOUNT_REQUIRED_TO_BUILD = 100;

export const DEFENSES_STATS = {
    FIRE_WIZARD: {
        ATTACK_DAMAGE: 100,
        ATTACK_RANGE: 5,
        DAMAGE_RADIUS: 2,
        TIME_TAKEN_TO_REACH_TARGET: 25, // ms
        ATTACK_SPEED: {
            LV1: 0.5,
            LV2: 1.15,
        },
        BUILDING_COST: {
            LV1: 100,
            LV2: 200,
        },
        SELL_AMOUNT: {
            LV_1: 80,
            LV_2: 150
        },
        UPGRADE_POPUP_INFO: {
            LV1: {
                UPGRADE_COST: "Upgrade Cost: " + 200,
                SELL_AMOUNT: "Sell Amount: " + 80,
                STAT_INCREASE: "Attack Speed : 1.15",
            },
            LV2: {
                UPGRADE_COST: null,
                SELL_AMOUNT: "Sell Amount: " + 150,
                STAT_INCREASE: null
            }
        }
    }
}

export const WAVES_INFO = {
    WAVE_1: {
        GOBLIMON: { count: 5, delay: 2500 },   // more goblins, spawn faster
        RED_PANTHER: { count: 6, delay: 1800 },   // 1 extra panther, faster spawn
    },
    WAVE_2: {
        GAURDAMON: { count: 3, delay: 2800 },   // +1 gaurdamon, slightly faster
        DEMOGORGON: { count: 3, delay: 3500 },   // +1 demogorgon, spawns sooner
    },
    WAVE_3: {
        RED_PANTHER: { count: 6, delay: 1300 },   // stronger panther rush
        FLORAMON: { count: 3, delay: 2200 },   // +1 floramon, faster
        GOBLIMON: { count: 5, delay: 1800 },   // more goblins
    },
    WAVE_4: {
        GAURDAMON: { count: 4, delay: 2500 },   // bigger gaurdamon group
        DEMOGORGON: { count: 4, delay: 3200 },   // +1 demogorgon, faster
        RED_PANTHER: { count: 3, delay: 1500 },   // extra panther, quicker rush
    },
    WAVE_5: {
        FLORAMON: { count: 5, delay: 3500 },   // more floramons, quicker
        GOBLIMON: { count: 6, delay: 2000 },   // extra goblins, faster spawn
        DEMOGORGON: { count: 5, delay: 5000 },   // +1 demogorgon
        RED_PANTHER: { count: 4, delay: 4000 },   // +2 panthers, spawn sooner
    },
};


export const ENEMIES_STATS = {
    GOBLIMON: {
        HEALTH: 200,
        DAMAGE_PER_SECOND: 55,
        KILL_COINS: 5,
        SPEED: 2.2,
        SCALE: 0.3,
    },
    GAURDAMON: {
        HEALTH: 400,
        DAMAGE_PER_SECOND: 70,
        KILL_COINS: 10,
        SPEED: 2,
        SCALE: 0.5,
    },
    RED_PANTHER: {
        HEALTH: 650,
        DAMAGE_PER_SECOND: 100,
        KILL_COINS: 20,
        SPEED: 1,
        SCALE: 0.35,
    },
    FLORAMON: {
        HEALTH: 400,
        DAMAGE_PER_SECOND: 70,
        KILL_COINS: 10,
        SPEED: 1.2,
        SCALE: 0.25,
    },
    DEMOGORGON: {
        HEALTH: 1200,
        DAMAGE_PER_SECOND: 120,
        KILL_COINS: 75,
        SPEED: 0.75,
        SCALE: 0.005,
    },
    OBLIVIRON: {
        HEALTH: 2000,
        DAMAGE_PER_SECOND: 150,
        KILL_COINS: 150,
        SPEED: 0.5,
        SCALE: 0.5,
    }
}