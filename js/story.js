/**
 * story.js - Story dialogues, quest objectives, and world map data
 */

// --- Story Dialogues ---
// Shown when entering a new area or at key moments

const STORY_DIALOGUES = {
    // Opening - First time starting
    intro: [
        { speaker: '👴', name: 'そんちょう', text: 'ゆうしゃよ、まものがブロックワールドをおそっている！' },
        { speaker: '👴', name: 'そんちょう', text: 'きみの「けいさんのちから」で まものをたおしてくれ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'まかせて！ぼうけんにでかけよう！' },
    ],

    // Area 0: Grassland
    area0_enter: [
        { speaker: '🧚', name: 'ようせい', text: 'ここは「草原エリア」だよ。' },
        { speaker: '🧚', name: 'ようせい', text: 'まだやさしいまものたちがいるから、れんしゅうにぴったり！' },
        { speaker: '🧚', name: 'ようせい', text: 'ひきざんでこうげきして、まものをたおそう！' },
    ],
    area0_boss: [
        { speaker: '🧚', name: 'ようせい', text: 'きをつけて！ゾンビのボスがあらわれたよ！' },
        { speaker: '🧚', name: 'ようせい', text: 'でもきみならだいじょうぶ。おちついてこたえよう！' },
    ],
    area0_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'すばらしい！草原エリアをクリアしたぞ！' },
        { speaker: '👴', name: 'そんちょう', text: 'つぎは山岳エリアだ。もっとつよいまものがいるぞ。' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'よーし、がんばるぞ！' },
    ],

    // Area 1: Mountain
    area1_enter: [
        { speaker: '⛰️', name: 'やまのせい', text: 'ようこそ、山岳エリアへ。' },
        { speaker: '⛰️', name: 'やまのせい', text: 'ここのまものはすこしつよいぞ。さいくつもわすれずにな。' },
        { speaker: '⛰️', name: 'やまのせい', text: 'そうびをつくれば、もっとつよくなれるぞ！' },
    ],
    area1_boss: [
        { speaker: '⛰️', name: 'やまのせい', text: 'クリーパーだ！ばくはつするまえにたおせ！' },
    ],
    area1_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'やったな！山岳エリアもクリアだ！' },
        { speaker: '👴', name: 'そんちょう', text: 'さいごは火山エリア…ドラゴンがまっているぞ。' },
    ],

    // Area 2: Volcano
    area2_enter: [
        { speaker: '🔥', name: 'ほのおのせい', text: 'ここは火山エリア…あついたたかいだ。' },
        { speaker: '🔥', name: 'ほのおのせい', text: 'ドラゴンをたおして、つぎのエリアへすすめ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'ぜったい、まけない！' },
    ],
    area2_boss: [
        { speaker: '🔥', name: 'ほのおのせい', text: 'ドラゴンだ！ぜんりょくでいけ！！' },
    ],
    area2_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'ドラゴンをたおしたぞ！すごいな！' },
        { speaker: '👴', name: 'そんちょう', text: 'しかし…まだへいわはもどっていない。あたらしいまものがあらわれた！' },
        { speaker: '🧚', name: 'ようせい', text: '砂漠エリアにつよいまものたちがいるよ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'まだまだ ぼうけんはおわらないぞ！' },
    ],

    // Area 3: Desert
    area3_enter: [
        { speaker: '🏜️', name: 'すなのせい', text: 'ようこそ、砂漠エリアへ。あついぞ！' },
        { speaker: '🏜️', name: 'すなのせい', text: 'ここのまものはとてもつよい。きをつけろ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'あつくても、がんばる！' },
    ],
    area3_boss: [
        { speaker: '🏜️', name: 'すなのせい', text: 'スフィンクスだ！なぞをとけ！' },
        { speaker: '🏜️', name: 'すなのせい', text: 'けいさんでこたえれば、かてるぞ！' },
    ],
    area3_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'すごい！砂漠エリアもクリアだ！' },
        { speaker: '👴', name: 'そんちょう', text: 'つぎは氷の洞窟エリアだ。さむいぞ、きをつけろ！' },
    ],

    // Area 4: Ice Cavern
    area4_enter: [
        { speaker: '🧊', name: 'こおりのせい', text: 'ここは氷の洞窟エリア…さむいぞ。' },
        { speaker: '🧊', name: 'こおりのせい', text: 'こおりのまものたちが きみをまっている！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'さむくても、まけないぞ！' },
    ],
    area4_boss: [
        { speaker: '🧊', name: 'こおりのせい', text: 'フロストドラゴンだ！こおりのブレスに きをつけろ！' },
    ],
    area4_clear: [
        { speaker: '👴', name: 'そんちょう', text: 'やったな！氷の洞窟をクリアだ！' },
        { speaker: '👴', name: 'そんちょう', text: 'さいごは闇の城…まおうがまっているぞ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'いよいよ さいしゅうけっせんだ！' },
    ],

    // Area 5: Dark Castle
    area5_enter: [
        { speaker: '🏰', name: 'やみのせい', text: 'ここは闇の城…さいごのたたかいだ。' },
        { speaker: '🏰', name: 'やみのせい', text: 'まおうをたおせば、ほんとうのへいわがもどる！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'ぜったい、へいわをとりもどす！' },
    ],
    area5_boss: [
        { speaker: '🏰', name: 'やみのせい', text: 'まおうだ！！さいごのたたかい！！' },
        { speaker: '🏰', name: 'やみのせい', text: 'けいさんのちからを しんじろ！！' },
    ],
    area5_clear: [
        { speaker: '👴', name: 'そんちょう', text: '🎊 おめでとう！まおうをたおした！！' },
        { speaker: '👴', name: 'そんちょう', text: 'ブロックワールドにほんとうのへいわがもどったぞ！' },
        { speaker: '🧚', name: 'ようせい', text: 'ゆうしゃさん、ありがとう！きみはでんせつのゆうしゃだ！' },
        { speaker: '🧑‍🦰', name: 'ゆうしゃ', text: 'やったー！！けいさんのちからで せかいをすくった！' },
    ],
};

// --- Quest System ---

const QUESTS = [
    // Area 0 quests
    {
        id: 'q_grass_1',
        area: 0,
        title: '草原のまもの',
        description: 'スライムをたおそう！',
        targetStage: 0,
        icon: '🟢',
    },
    {
        id: 'q_grass_2',
        area: 0,
        title: 'キノコのもり',
        description: 'キノコマンをたおそう！',
        targetStage: 1,
        icon: '🍄',
    },
    {
        id: 'q_grass_boss',
        area: 0,
        title: '草原のボス',
        description: 'ゾンビをたおして草原をすくえ！',
        targetStage: 2,
        icon: '🧟',
        isBoss: true,
    },

    // Area 1 quests
    {
        id: 'q_mountain_1',
        area: 1,
        title: 'やまのどうくつ',
        description: 'クモをたおそう！',
        targetStage: 3,
        icon: '🕷️',
    },
    {
        id: 'q_mountain_2',
        area: 1,
        title: 'ほねのせんし',
        description: 'スケルトンをたおそう！',
        targetStage: 4,
        icon: '💀',
    },
    {
        id: 'q_mountain_boss',
        area: 1,
        title: '山のボス',
        description: 'クリーパーをたおして山をすくえ！',
        targetStage: 5,
        icon: '💚',
        isBoss: true,
    },

    // Area 2 quests
    {
        id: 'q_volcano_1',
        area: 2,
        title: 'やみのせかい',
        description: 'エンダーマンをたおそう！',
        targetStage: 6,
        icon: '👾',
    },
    {
        id: 'q_volcano_2',
        area: 2,
        title: 'ほのおのしれん',
        description: 'ブレイズをたおそう！',
        targetStage: 7,
        icon: '🔥',
    },
    {
        id: 'q_volcano_boss',
        area: 2,
        title: 'ドラゴンとのたたかい',
        description: 'ドラゴンをたおしてつぎへすすめ！',
        targetStage: 8,
        icon: '🐉',
        isBoss: true,
    },

    // Area 3 quests
    {
        id: 'q_desert_1',
        area: 3,
        title: 'どくのしっぽ',
        description: 'サソリをたおそう！',
        targetStage: 9,
        icon: '🦂',
    },
    {
        id: 'q_desert_2',
        area: 3,
        title: 'いにしえのはか',
        description: 'ミイラをたおそう！',
        targetStage: 10,
        icon: '🧌',
    },
    {
        id: 'q_desert_boss',
        area: 3,
        title: '砂漠のボス',
        description: 'スフィンクスをたおして砂漠をすくえ！',
        targetStage: 11,
        icon: '🦁',
        isBoss: true,
    },

    // Area 4 quests
    {
        id: 'q_ice_1',
        area: 4,
        title: 'こおりのばんにん',
        description: 'アイスゴーレムをたおそう！',
        targetStage: 12,
        icon: '🥶',
    },
    {
        id: 'q_ice_2',
        area: 4,
        title: 'ふぶきのかげ',
        description: 'ゆきおんなをたおそう！',
        targetStage: 13,
        icon: '👻',
    },
    {
        id: 'q_ice_boss',
        area: 4,
        title: '氷のボス',
        description: 'フロストドラゴンをたおして洞窟をすくえ！',
        targetStage: 14,
        icon: '❄️',
        isBoss: true,
    },

    // Area 5 quests
    {
        id: 'q_dark_1',
        area: 5,
        title: 'やみのきし',
        description: 'ダークナイトをたおそう！',
        targetStage: 15,
        icon: '🗡️',
    },
    {
        id: 'q_dark_2',
        area: 5,
        title: 'じごくのまもの',
        description: 'デーモンをたおそう！',
        targetStage: 16,
        icon: '👹',
    },
    {
        id: 'q_dark_boss',
        area: 5,
        title: 'さいしゅうけっせん',
        description: 'まおうをたおしてへいわをとりもどせ！',
        targetStage: 17,
        icon: '😈',
        isBoss: true,
    },
];

// --- World Map Area Data ---

const WORLD_MAP_AREAS = [
    {
        id: 0,
        name: '草原エリア',
        icon: '🌿',
        color: '#4caf50',
        bgColor: '#1a3a1a',
        stages: [0, 1, 2],
        position: { x: 15, y: 80 },
    },
    {
        id: 1,
        name: '山岳エリア',
        icon: '🏔️',
        color: '#78909c',
        bgColor: '#2a2a3a',
        stages: [3, 4, 5],
        position: { x: 30, y: 65 },
    },
    {
        id: 2,
        name: '火山エリア',
        icon: '🌋',
        color: '#e53935',
        bgColor: '#3a1a1a',
        stages: [6, 7, 8],
        position: { x: 45, y: 50 },
    },
    {
        id: 3,
        name: '砂漠エリア',
        icon: '🏜️',
        color: '#d4a437',
        bgColor: '#3a2a1a',
        stages: [9, 10, 11],
        position: { x: 55, y: 38 },
    },
    {
        id: 4,
        name: '氷の洞窟エリア',
        icon: '🧊',
        color: '#29b6f6',
        bgColor: '#1a2a3a',
        stages: [12, 13, 14],
        position: { x: 68, y: 25 },
    },
    {
        id: 5,
        name: '闇の城エリア',
        icon: '🏰',
        color: '#7e57c2',
        bgColor: '#1a1a2a',
        stages: [15, 16, 17],
        position: { x: 82, y: 12 },
    },
];

// Number of stages per area (always 3)
const STAGES_PER_AREA = 3;
// Total number of areas
const NUM_AREAS = WORLD_MAP_AREAS.length;

/**
 * Get the story dialogue key for the current game state.
 * Dynamically computed based on STAGES_PER_AREA.
 */
function getStoryTrigger(stage, previousStage) {
    const areaIndex = Math.floor(stage / STAGES_PER_AREA);
    const positionInArea = stage % STAGES_PER_AREA;

    // Just cleared a boss? (stage is the first stage of the NEXT area)
    if (positionInArea === 0 && previousStage !== undefined) {
        const clearedArea = areaIndex - 1;
        if (clearedArea >= 0 && clearedArea < NUM_AREAS) {
            return `area${clearedArea}_clear`;
        }
    }

    // Game fully cleared? (stage goes beyond all defined stages)
    if (stage >= NUM_AREAS * STAGES_PER_AREA && previousStage !== undefined) {
        const clearedArea = NUM_AREAS - 1;
        return `area${clearedArea}_clear`;
    }

    // Entering a new area? (first stage of an area)
    if (positionInArea === 0 && areaIndex < NUM_AREAS) {
        return `area${areaIndex}_enter`;
    }

    // About to face a boss? (last stage of an area)
    if (positionInArea === STAGES_PER_AREA - 1 && areaIndex < NUM_AREAS) {
        return `area${areaIndex}_boss`;
    }

    return null;
}

/**
 * Get the current quest for a given stage.
 */
function getCurrentQuest(stage) {
    return QUESTS.find(q => q.targetStage === stage) || null;
}

/**
 * Get area progress: which areas are unlocked and which stages completed.
 */
function getAreaProgress(currentStage) {
    return WORLD_MAP_AREAS.map(area => {
        const maxStage = area.stages[area.stages.length - 1];
        const minStage = area.stages[0];
        const isUnlocked = currentStage >= minStage;
        const isCompleted = currentStage > maxStage;
        const currentInArea = currentStage >= minStage && currentStage <= maxStage;
        const stagesCompleted = Math.max(0, Math.min(currentStage - minStage, area.stages.length));

        return {
            ...area,
            isUnlocked,
            isCompleted,
            currentInArea,
            stagesCompleted,
            totalStages: area.stages.length,
        };
    });
}
