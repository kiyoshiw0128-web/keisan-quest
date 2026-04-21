/**
 * monsters.js - Monster definitions and stage data
 */

const AREAS = [
    { name: '🌿 草原エリア', bg: '#1a3a1a' },
    { name: '🏔️ 山岳エリア', bg: '#2a2a3a' },
    { name: '🌋 火山エリア', bg: '#3a1a1a' },
    { name: '🏜️ 砂漠エリア', bg: '#3a2a1a' },
    { name: '🧊 氷の洞窟エリア', bg: '#1a2a3a' },
    { name: '🏰 闇の城エリア', bg: '#1a1a2a' },
];

const MONSTERS = [
    // Stage 1-3: Grassland (Easy)
    {
        name: 'スライム',
        sprite: '🟢',
        hp: 30,
        attack: 8,
        area: 0,
        isBoss: false,
        color: '#4caf50',
        deathMessage: 'スライムを たおした！',
    },
    {
        name: 'キノコマン',
        sprite: '🍄',
        hp: 35,
        attack: 10,
        area: 0,
        isBoss: false,
        color: '#e06c9f',
        deathMessage: 'キノコマンを たおした！',
    },
    {
        name: 'ゾンビ',
        sprite: '🧟',
        hp: 60,
        attack: 14,
        area: 0,
        isBoss: true,
        color: '#66bb6a',
        deathMessage: '⭐ ボス「ゾンビ」を たおした！',
    },

    // Stage 4-6: Mountain (Medium)
    {
        name: 'クモ',
        sprite: '🕷️',
        hp: 45,
        attack: 12,
        area: 1,
        isBoss: false,
        color: '#8d6e63',
        deathMessage: 'クモを たおした！',
    },
    {
        name: 'スケルトン',
        sprite: '💀',
        hp: 50,
        attack: 14,
        area: 1,
        isBoss: false,
        color: '#bdbdbd',
        deathMessage: 'スケルトンを たおした！',
    },
    {
        name: 'クリーパー',
        sprite: '💚',
        hp: 80,
        attack: 18,
        area: 1,
        isBoss: true,
        color: '#43a047',
        deathMessage: '⭐ ボス「クリーパー」を たおした！',
    },

    // Stage 7-9: Volcano (Hard)
    {
        name: 'エンダーマン',
        sprite: '👾',
        hp: 55,
        attack: 16,
        area: 2,
        isBoss: false,
        color: '#7e57c2',
        deathMessage: 'エンダーマンを たおした！',
    },
    {
        name: 'ブレイズ',
        sprite: '🔥',
        hp: 60,
        attack: 18,
        area: 2,
        isBoss: false,
        color: '#ff9800',
        deathMessage: 'ブレイズを たおした！',
    },
    {
        name: 'ドラゴン',
        sprite: '🐉',
        hp: 120,
        attack: 22,
        area: 2,
        isBoss: true,
        color: '#e53935',
        deathMessage: '⭐ ボス「ドラゴン」を たおした！',
    },

    // Stage 10-12: Desert (Very Hard)
    {
        name: 'サソリ',
        sprite: '🦂',
        hp: 70,
        attack: 20,
        area: 3,
        isBoss: false,
        color: '#c49a3c',
        deathMessage: 'サソリを たおした！',
    },
    {
        name: 'ミイラ',
        sprite: '🧌',
        hp: 80,
        attack: 22,
        area: 3,
        isBoss: false,
        color: '#a08050',
        deathMessage: 'ミイラを たおした！',
    },
    {
        name: 'スフィンクス',
        sprite: '🦁',
        hp: 150,
        attack: 26,
        area: 3,
        isBoss: true,
        color: '#d4a437',
        deathMessage: '⭐ ボス「スフィンクス」を たおした！',
    },

    // Stage 13-15: Ice Cavern (Super Hard)
    {
        name: 'アイスゴーレム',
        sprite: '🥶',
        hp: 90,
        attack: 24,
        area: 4,
        isBoss: false,
        color: '#64b5f6',
        deathMessage: 'アイスゴーレムを たおした！',
    },
    {
        name: 'ゆきおんな',
        sprite: '👻',
        hp: 95,
        attack: 26,
        area: 4,
        isBoss: false,
        color: '#90caf9',
        deathMessage: 'ゆきおんなを たおした！',
    },
    {
        name: 'フロストドラゴン',
        sprite: '❄️',
        hp: 180,
        attack: 30,
        area: 4,
        isBoss: true,
        color: '#29b6f6',
        deathMessage: '⭐ ボス「フロストドラゴン」を たおした！',
    },

    // Stage 16-18: Dark Castle (Ultimate)
    {
        name: 'ダークナイト',
        sprite: '🗡️',
        hp: 110,
        attack: 28,
        area: 5,
        isBoss: false,
        color: '#5c3d8f',
        deathMessage: 'ダークナイトを たおした！',
    },
    {
        name: 'デーモン',
        sprite: '👹',
        hp: 120,
        attack: 30,
        area: 5,
        isBoss: false,
        color: '#c62828',
        deathMessage: 'デーモンを たおした！',
    },
    {
        name: 'まおう',
        sprite: '😈',
        hp: 250,
        attack: 35,
        area: 5,
        isBoss: true,
        color: '#4a148c',
        deathMessage: '🎊 ラスボス「まおう」を たおした！！',
    },
];

/**
 * Get monster data for a given stage (0-indexed).
 * If stage exceeds defined monsters, scale up the last boss.
 */
function getMonster(stageIndex) {
    if (stageIndex < MONSTERS.length) {
        return { ...MONSTERS[stageIndex] };
    }
    // Endless mode: repeat bosses with scaling
    const base = { ...MONSTERS[MONSTERS.length - 1] };
    const scale = 1 + (stageIndex - MONSTERS.length + 1) * 0.3;
    base.hp = Math.floor(base.hp * scale);
    base.attack = Math.floor(base.attack * scale);
    base.name = `${base.name} Lv.${stageIndex - MONSTERS.length + 2}`;
    return base;
}

/**
 * Get area info for a given stage (0-indexed).
 */
function getArea(stageIndex) {
    if (stageIndex < MONSTERS.length) {
        return AREAS[MONSTERS[stageIndex].area];
    }
    return AREAS[AREAS.length - 1];
}

// Player damage per correct answer
const PLAYER_ATTACK_BASE = 10;
const COMBO_BONUS = 2; // Extra damage per combo

// Time limit per area (seconds)
// 草原 = 15s, 山岳 = 12s, 火山 = 10s, エンドレス = 8s
const TIME_LIMITS = [15, 12, 10];
const TIME_LIMIT_ENDLESS = 8;

/**
 * Get time limit (in seconds) for a given stage.
 */
function getTimeLimit(stageIndex) {
    if (stageIndex < MONSTERS.length) {
        const areaIndex = MONSTERS[stageIndex].area;
        return TIME_LIMITS[areaIndex];
    }
    return TIME_LIMIT_ENDLESS;
}
