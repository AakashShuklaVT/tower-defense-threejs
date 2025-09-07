export const DEFENSE_TYPES = [
    'fireWizard', 
    'cannonDefense', 
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

// export const FIRE_WIZARD_DAMAGE = 100;
export const CANNON_DAMAGE = 150;

export const GOBLIMON_HEALTH = 100;
export const GAURDAMON_HEALTH = 300;
export const RED_PANTHER_HEALTH = 500;
export const DEMOGORGON_HEALTH = 250;
export const FLORAMON_HEALTH = 350;
export const OBLIVIRON_HEALTH = 2000;

// export const FIRE_WIZARD_ATTACK_SPEED = 25;
export const CANNON_ATTACK_SPEED = 10;

// export const FIRE_WIZARD_SPLASH_DAMAGE_RADIUS = 2;

// export const FIREWIZARD_LEVEL1_ATTACK_SPEED = 0.5;
// export const FIREWIZARD_LEVEL2_ATTACK_SPEED = 1.5;

// export const FIRE_WIZARD_RANGE = 5;
export const CANNON_RANGE = 7;

export const INITIAL_COINS_AMOUNT = 300;
export const INITIAL_TOWER_HEALTH = 5000;

// export const COST_OF_BUILDINGS = {
//     FIRE_WIZARD: {
//         LEVEL_1: 100,
//         LEVEL_2: 200,
//     },
//     CANNON_TOWER: {
//         LEVEL_1: 150,
//         LEVEL_2: 300,
//         LEVEL_3: 450,
//     }
// }
export const GOBLIMON_DPS = 35;
export const GAURDAMON_DPS = 50;
export const RED_PANTHER_DPS = 80;
export const FLORAMON_DPS = 100;
export const DEMOGORGON_DPS = 120;
export const OBLIVIRON_DPS = 150;

// export const FIRE_WIZARD_LV1_SELL_AMOUNT = 80;
// export const FIRE_WIZARD_LV2_SELL_AMOUNT = 150;
export const CANNON_TOWER_LV2_SELL_AMOUNT = 80;


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
        }
    }
}