/**
 * mining.js - Mining mini-game system
 */

class MiningSystem {
    constructor(mathEngine, effects, sound, inventory) {
        this.math = mathEngine;
        this.effects = effects;
        this.sound = sound;
        this.inventory = inventory;

        // State
        this.grid = [];
        this.gridSize = { cols: 4, rows: 4 };
        this.pickaxeDurability = 10;
        this.pickaxeMax = 10;
        this.currentBlock = null;
        this.currentProblem = null;
        this.inputValue = '';
        this.isProcessing = false;
        this.miningActive = false;
        this.minedCount = 0;
        this.sessionResources = {};

        // Callbacks
        this.onComplete = null;

        // DOM
        this.els = {
            grid: document.getElementById('mine-grid'),
            durability: document.getElementById('pickaxe-durability'),
            durabilityBar: document.getElementById('pickaxe-bar-fill'),
            problemArea: document.getElementById('mining-problem-area'),
            numA: document.getElementById('mine-num-a'),
            numB: document.getElementById('mine-num-b'),
            answerDisplay: document.getElementById('mine-answer-display'),
            inventoryBar: document.getElementById('mining-inv-bar'),
            messageOverlay: document.getElementById('mining-message'),
            messageText: document.getElementById('mining-message-text'),
        };
    }

    /**
     * Start a new mining session.
     */
    startMining() {
        this.pickaxeDurability = this.pickaxeMax;
        this.currentBlock = null;
        this.currentProblem = null;
        this.inputValue = '';
        this.isProcessing = false;
        this.miningActive = true;
        this.minedCount = 0;
        this.sessionResources = {};
        this.math.resetStage();

        this.generateGrid();
        this.renderGrid();
        this.updateUI();
        this.hideProblem();
    }

    /**
     * Generate random block grid.
     */
    generateGrid() {
        this.grid = [];
        const totalWeight = BLOCK_TYPES.reduce((sum, b) => sum + b.weight, 0);

        for (let r = 0; r < this.gridSize.rows; r++) {
            const row = [];
            for (let c = 0; c < this.gridSize.cols; c++) {
                let rand = Math.random() * totalWeight;
                let blockType = BLOCK_TYPES[0];
                for (const bt of BLOCK_TYPES) {
                    rand -= bt.weight;
                    if (rand <= 0) {
                        blockType = bt;
                        break;
                    }
                }
                row.push({
                    type: blockType.type,
                    name: blockType.name,
                    icon: blockType.icon,
                    color: blockType.color,
                    mined: false,
                    row: r,
                    col: c,
                });
            }
            this.grid.push(row);
        }
    }

    /**
     * Render the block grid.
     */
    renderGrid() {
        this.els.grid.innerHTML = '';
        this.els.grid.style.gridTemplateColumns = `repeat(${this.gridSize.cols}, 1fr)`;

        for (let r = 0; r < this.gridSize.rows; r++) {
            for (let c = 0; c < this.gridSize.cols; c++) {
                const block = this.grid[r][c];
                const el = document.createElement('button');
                el.className = 'mine-block';
                el.dataset.row = r;
                el.dataset.col = c;

                if (block.mined) {
                    el.classList.add('mined');
                    el.innerHTML = '';
                } else {
                    el.style.background = block.color;
                    el.style.boxShadow = `inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.15)`;
                    el.innerHTML = `<span class="block-icon">${block.icon}</span>`;
                }

                el.addEventListener('click', () => this.onBlockClick(r, c));
                this.els.grid.appendChild(el);
            }
        }
    }

    /**
     * Handle block click.
     */
    onBlockClick(row, col) {
        if (this.isProcessing || !this.miningActive) return;
        const block = this.grid[row][col];
        if (block.mined) return;

        this.sound.playButtonPress();
        this.currentBlock = block;
        this.currentProblem = this.math.generateProblem();
        this.inputValue = '';

        // Highlight selected block
        document.querySelectorAll('.mine-block').forEach(el => el.classList.remove('selected'));
        const blockEl = this.els.grid.children[row * this.gridSize.cols + col];
        blockEl.classList.add('selected');

        this.showProblem();
    }

    /**
     * Show problem UI.
     */
    showProblem() {
        this.els.numA.textContent = this.currentProblem.a;
        this.els.numB.textContent = this.currentProblem.b;
        this.els.answerDisplay.textContent = '?';
        this.els.answerDisplay.style.color = '';
        this.els.problemArea.classList.add('active');
    }

    hideProblem() {
        this.els.problemArea.classList.remove('active');
    }

    /**
     * Handle numpad input.
     */
    handleInput(num) {
        if (this.isProcessing || !this.miningActive || !this.currentBlock) return;
        this.sound.playButtonPress();
        if (this.inputValue.length < 3) {
            this.inputValue += num;
            this.els.answerDisplay.textContent = this.inputValue;
        }
    }

    handleDelete() {
        if (this.isProcessing || !this.miningActive) return;
        this.sound.playButtonPress();
        this.inputValue = this.inputValue.slice(0, -1);
        this.els.answerDisplay.textContent = this.inputValue || '?';
    }

    handleSubmit() {
        if (this.isProcessing || !this.miningActive || this.inputValue === '' || !this.currentBlock) return;
        this.isProcessing = true;

        const userAnswer = parseInt(this.inputValue, 10);
        const isCorrect = userAnswer === this.currentProblem.answer;

        if (isCorrect) {
            this.onCorrectMine();
        } else {
            this.onWrongMine();
        }
    }

    /**
     * Correct answer - mine the block.
     */
    onCorrectMine() {
        const block = this.currentBlock;
        block.mined = true;
        this.minedCount++;

        // Add resource
        this.inventory.addResource(block.type, 1);
        this.sessionResources[block.type] = (this.sessionResources[block.type] || 0) + 1;

        // Sound + effects
        this.sound.playCorrect();
        const blockIndex = block.row * this.gridSize.cols + block.col;
        const blockEl = this.els.grid.children[blockIndex];
        this.effects.correctEffect(blockEl);

        // Show answer
        this.els.answerDisplay.textContent = this.currentProblem.answer;
        this.els.answerDisplay.style.color = '#58d6f0';

        // Show message
        const resInfo = RESOURCE_INFO[block.type];
        this.showMessage(`${resInfo.icon} ${resInfo.name} ゲット！`, 'correct');

        // Animate block break
        blockEl.classList.add('breaking');
        setTimeout(() => {
            blockEl.classList.add('mined');
            blockEl.classList.remove('breaking', 'selected');
            blockEl.innerHTML = '';
            blockEl.style.background = '';
            blockEl.style.boxShadow = '';
        }, 400);

        this.updateUI();

        setTimeout(() => {
            this.isProcessing = false;
            this.currentBlock = null;
            this.hideProblem();
            this.checkMiningComplete();
        }, 800);
    }

    /**
     * Wrong answer - lose pickaxe durability.
     */
    onWrongMine() {
        this.pickaxeDurability--;

        this.sound.playWrong();
        this.effects.wrongEffect();

        // Show correct answer
        this.els.answerDisplay.textContent = this.currentProblem.answer;
        this.els.answerDisplay.style.color = '#f44336';

        this.showMessage('ざんねん…💦', 'wrong');
        this.updateUI();

        setTimeout(() => {
            this.isProcessing = false;
            this.currentBlock = null;
            this.hideProblem();
            document.querySelectorAll('.mine-block').forEach(el => el.classList.remove('selected'));

            if (this.pickaxeDurability <= 0) {
                this.completeMining();
            }
        }, 1000);
    }

    /**
     * Check if mining is complete.
     */
    checkMiningComplete() {
        const allMined = this.grid.every(row => row.every(b => b.mined));
        if (allMined) {
            this.completeMining();
        }
    }

    /**
     * End mining session.
     */
    completeMining() {
        this.miningActive = false;

        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete({
                    minedCount: this.minedCount,
                    resources: { ...this.sessionResources },
                });
            }
        }, 500);
    }

    // --- UI ---

    updateUI() {
        this.els.durability.textContent = `${this.pickaxeDurability}/${this.pickaxeMax}`;
        const pct = (this.pickaxeDurability / this.pickaxeMax) * 100;
        this.els.durabilityBar.style.width = `${pct}%`;
        if (pct <= 30) {
            this.els.durabilityBar.style.background = 'linear-gradient(90deg, #f44336, #ff6b6b)';
        } else {
            this.els.durabilityBar.style.background = '';
        }
        this.updateInventoryBar();
    }

    updateInventoryBar() {
        const bar = this.els.inventoryBar;
        bar.innerHTML = Object.entries(RESOURCE_INFO).map(([type, info]) =>
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
