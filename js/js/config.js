
// Styles
const NUMBERS_STYLE = { font: "58px Calibri", fill: "#ffffff", align: "center" };
const STRIKE_OUT_STYLE = { font: "58px Calibri", fill: "green", align: "center" };

const MENU_UP_STYLE = { font: "158px Calibri", fill: "#ffffff", align: "center" };
const MENU_OVER_STYLE = { font: "158px Calibri", fill: "green", align: "center" };

// Map tiles
const ROAD_TILE = 1;
const BLANK_TILE = 2;
const BAD_FOG_TILE = 3;
const FOG_TILE = 4;

// Enemy params
const WAVES = [
    {
        time_till_wave: 30000,
        rate: 3000,
        count: 5,
        speed: 800,
        health: 3,
        tint: 0xffffff
    },
    {
        time_till_wave: 30000,
        rate: 2800,
        count: 10,
        speed: 700,
        health: 3,
        tint: 0x654321
    },
    {
        time_till_wave: 30000,
        rate: 1500,
        count: 25,
        speed: 400,
        health: 1,
        tint: 0x00ffff
    },
    {
        time_till_wave: 30000,
        rate: 2500,
        count: 10,
        speed: 600,
        health: 5,
        tint: 0xff0022
    },
    {
        time_till_wave: 40000,
        rate: 1200,
        count: 30,
        speed: 800,
        health: 3,
        tint: 0xffffff
    },
    {
        time_till_wave: 20000,
        rate: 1200,
        count: 20,
        speed: 500,
        health: 6,
        tint: 0
    }
];

//const ENEMY_START_SPEED = 800;
//const ENEMY_SPEED_INCREASE_TIME = Phaser.Timer.SECOND * 30;
//const ENEMY_SPEED_INCREASE_AMOUNT = 1.1;
//const ENEMY_UPGRADE_AMOUNT = 5;
//const STARTING_HEALTH = 3;
//const ENEMY_HEALTH_INCREASE_AMOUNT = 1;
//const ENEMY_START_RATE = Phaser.Timer.SECOND * 3;
//const ENEMY_RATE_INCREASE_AMOUNT = 1.3;
//const ENEMY_TINT_AMOUNT = 0xffffff / 0xeeeeee;

// Towers
const TOWER_COOLDOWN = Phaser.Timer.HALF;
const TOWER_STRENGTH = 1;

// Scoring
const BAD_SELECTION_PUNISHMENT = 3;

//const COMPLETED_NUMBER_BONUS = 2;
//const COMPLETED_ROW_BONUS = 3;