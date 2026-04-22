/**
 * mining.js - Rock smash mini-game with zone selection
 */

const MINING_ZONES = [
    {
        id: 'grassland',
        blockTypes: ['wood', 'stone'],
        weights:    [60,     40],
        rocksTotal: 10,
    },
    {
        id: 'mountain',
        blockTypes: ['stone', 'iron'],
        weights:    [40,      60],
        rocksTotal: 7,
    },
    {
        id: 'cave',
        blockTypes: ['iron', 'gold', 'diamond'],
        weights:    [20,     50,     30],
        rocksTotal: 5,
    },
];

const ROCK_HITS = {
    wood: 3, stone: 5, iron: 8, gold: 11, diamond: 14,
};

class MiningSystem {
    constructor(mathEngine, effects, sound, inventory) {
        this.effects = effects;
        this.sound = sound;
        this.inventory = inventory;

        this.zone = null;
        this.rocksTotal = 0;
        this.rocksDone = 0;
        this.pickaxeDurability = 0;
        this.pickaxeMax = 0;
        this.miningActive = false;
        this.isBreaking = false;
        this.sessionResources = {};

        this.currentRock = null;
        this.currentHits = 0;
        this.hitsRequired = 0;

        this.onComplete = null;

        this.els = {
            zoneSelect: document.getElementById('zone-select'),
            rockArea: document.getElementById('rock-area'),
            durability: document.getElementById('pickaxe-durability'),
            durabilityBar: document.getElementById('pickaxe-bar-fill'),
            rockBtn: document.getElementById('rock-btn'),
            rockSprite: document.getElementById('rock-sprite'),
            rockLabel: document.getElementById('rock-resource-label'),
            rockCounter: document.getElementById('rock-counter'),
            rockProgressBar: document.getElementById('rock-progress-bar'),
            rockHitsLabel: document.getElementById('rock-hits-label'),
            crack1: document.getElementById('rock-crack-1'),
            crack2: document.getElementById('rock-crack-2'),
            crack3: document.getElementById('rock-crack-3'),
            inventoryBar: document.getElementById('mining-inv-bar'),
            messageOverlay: document.getElementById('mining-message'),
            messageText: document.getElementById('mining-message-text'),
        };

        this.els.rockBtn.addEventListener('click', () => this.onRockHit());

        document.querySelectorAll('.zone-card').forEach(card => {
            card.addEventListener('click', () => {
                this.sound.playButtonPress();
                this.selectZone(card.dataset.zone);
            });
        });
    }

    startMining() {
        this.miningActive = false;
        this.isBreaking = false;
        this.sessionResources = {};

        // ゾーン選択画面を表示
        this.els.zoneSelect.style.display = '';
        this.els.rockArea.style.display = 'none';
        this.updateInventoryBar();
    }

    selectZone(zoneId) {
        this.zone = MINING_ZONES.find(z => z.id === zoneId);
        this.rocksTotal = this.zone.rocksTotal;
        this.pickaxeMax = this.rocksTotal;
        this.pickaxeDurability = this.pickaxeMax;
        this.rocksDone = 0;
        this.miningActive = true;
        this.sessionResources = {};

        this.els.zoneSelect.style.display = 'none';
        this.els.rockArea.style.display = '';

        this.updateUI();
        this.nextRock();
    }

    nextRock() {
        this.currentRock = this.pickRock();
        this.currentHits = 0;
        this.hitsRequired = ROCK_HITS[this.currentRock.type];

        const resInfo = RESOURCE_INFO[this.currentRock.type];
        this.els.rockSprite.textContent = '🪨';
        this.els.rockSprite.style.transform = '';
        this.els.rockBtn.style.background = this.currentRock.color;
        this.els.rockBtn.disabled = false;
        this.els.rockLabel.textContent = `${resInfo.icon} ${resInfo.name}`;
        this.els.rockCounter.textContent = `のこり ${this.rocksTotal - this.rocksDone}こ`;
        this.els.crack1.classList.remove('active');
        this.els.crack2.classList.remove('active');
        this.els.crack3.classList.remove('active');

        this.updateProgressBar();
        this.updateInventoryBar();
    }

    onRockHit() {
        if (!this.miningActive || this.isBreaking) return;

        this.currentHits++;
        this.sound.playButtonPress();

        // 揺れアニメーション
        this.els.rockSprite.classList.remove('rock-shake');
        void this.els.rockSprite.offsetWidth;
        this.els.rockSprite.classList.add('rock-shake');

        // ヒビの進行
        const pct = this.currentHits / this.hitsRequired;
        if (pct >= 0.33) this.els.crack1.classList.add('active');
        if (pct >= 0.66) this.els.crack2.classList.add('active');
        if (pct >= 0.90) this.els.crack3.classList.add('active');

        this.updateProgressBar();

        if (this.currentHits >= this.hitsRequired) {
            this.breakRock();
        }
    }

    breakRock() {
        this.isBreaking = true;
        this.els.rockBtn.disabled = true;
        this.sound.playCorrect();

        this.els.rockSprite.classList.add('rock-break');
        this.effects.correctEffect(this.els.rockBtn);

        this.inventory.addResource(this.currentRock.type, 1);
        this.sessionResources[this.currentRock.type] = (this.sessionResources[this.currentRock.type] || 0) + 1;

        const resInfo = RESOURCE_INFO[this.currentRock.type];
        this.showMessage(`${resInfo.icon} ${resInfo.name} ゲット！`, 'correct');

        this.pickaxeDurability--;
        this.rocksDone++;
        this.updateUI();

        setTimeout(() => {
            this.els.rockSprite.classList.remove('rock-break', 'rock-shake');
            this.isBreaking = false;

            if (this.rocksDone >= this.rocksTotal) {
                this.completeMining();
            } else {
                this.nextRock();
            }
        }, 600);
    }

    completeMining() {
        this.miningActive = false;
        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete({
                    minedCount: this.rocksDone,
                    resources: { ...this.sessionResources },
                });
            }
        }, 400);
    }

    pickRock() {
        const zone = this.zone;
        const totalWeight = zone.weights.reduce((s, w) => s + w, 0);
        let rand = Math.random() * totalWeight;
        for (let i = 0; i < zone.blockTypes.length; i++) {
            rand -= zone.weights[i];
            if (rand <= 0) {
                const typeName = zone.blockTypes[i];
                return BLOCK_TYPES.find(b => b.type === typeName);
            }
        }
        return BLOCK_TYPES.find(b => b.type === zone.blockTypes[0]);
    }

    updateProgressBar() {
        const pct = Math.min((this.currentHits / this.hitsRequired) * 100, 100);
        this.els.rockProgressBar.style.width = `${pct}%`;
        this.els.rockHitsLabel.textContent = `${this.currentHits} / ${this.hitsRequired} ヒット`;

        if (pct < 50) {
            this.els.rockProgressBar.style.background = 'linear-gradient(90deg, #58d6f0, #4fc3f7)';
        } else if (pct < 80) {
            this.els.rockProgressBar.style.background = 'linear-gradient(90deg, #ffb300, #ffd54f)';
        } else {
            this.els.rockProgressBar.style.background = 'linear-gradient(90deg, #f44336, #ff6b6b)';
        }
    }

    updateUI() {
        this.els.durability.textContent = `${this.pickaxeDurability}/${this.pickaxeMax}`;
        const pct = (this.pickaxeDurability / this.pickaxeMax) * 100;
        this.els.durabilityBar.style.width = `${pct}%`;
        this.els.durabilityBar.style.background = pct <= 25
            ? 'linear-gradient(90deg, #f44336, #ff6b6b)'
            : '';
        this.updateInventoryBar();
    }

    updateInventoryBar() {
        this.els.inventoryBar.innerHTML = Object.entries(RESOURCE_INFO).map(([type, info]) =>
            `<span class="inv-item"><span class="inv-icon">${info.icon}</span><span class="inv-count">${this.inventory.resources[type]}</span></span>`
        ).join('');
    }

    showMessage(text, type) {
        this.els.messageText.textContent = text;
        this.els.messageText.className = `message-text ${type}`;
        this.els.messageOverlay.classList.add('show');
        setTimeout(() => this.els.messageOverlay.classList.remove('show'), 800);
    }
}
