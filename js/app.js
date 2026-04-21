/**
 * app.js - Main application controller (Phase 1 + Phase 2 + Phase 3)
 */

class GameApp {
    constructor() {
        this.inventory = new Inventory();
        this.mathEngine = new MathEngine();
        this.effects = new EffectsManager();
        this.sound = new SoundManager();
        this.battle = new BattleSystem(this.mathEngine, this.effects, this.sound);
        this.mining = new MiningSystem(this.mathEngine, this.effects, this.sound, this.inventory);
        this.cooking = new CookingSystem(this.effects, this.sound, this.inventory);

        // Game state
        this.currentScreen = 'title';
        this.currentStage = 0;
        this.totalScore = 0;
        this.bestStage = 0;

        // Dialogue state
        this.dialogueQueue = [];
        this.dialogueCallback = null;
        this.shownDialogues = new Set();

        // Screen elements
        this.screens = {
            title: document.getElementById('title-screen'),
            hub: document.getElementById('hub-screen'),
            battle: document.getElementById('battle-screen'),
            mining: document.getElementById('mining-screen'),
            crafting: document.getElementById('crafting-screen'),
            result: document.getElementById('result-screen'),
            miningResult: document.getElementById('mining-result-screen'),
            map: document.getElementById('map-screen'),
        };

        // Result elements
        this.resultEls = {
            icon: document.getElementById('result-icon'),
            title: document.getElementById('result-title'),
            score: document.getElementById('result-score'),
            accuracy: document.getElementById('result-accuracy'),
            combo: document.getElementById('result-combo'),
            level: document.getElementById('result-level'),
            levelDetail: document.getElementById('level-up-detail'),
            loot: document.getElementById('result-loot'),
            lootItems: document.getElementById('loot-items'),
            btnNext: document.getElementById('btn-next'),
            btnNextBattle: document.getElementById('btn-next-battle'),
            btnRetry: document.getElementById('btn-retry'),
            btnTitle: document.getElementById('btn-title'),
        };

        this.init();
    }

    init() {
        this.loadProgress();
        this.effects.createFloatingBlocks();
        this.effects.createStars('title-stars');

        // Battle callbacks
        this.battle.onVictory = (data) => this.onBattleVictory(data);
        this.battle.onDefeat = (data) => this.onBattleDefeat(data);

        // Mining callbacks
        this.mining.onComplete = (data) => this.onMiningComplete(data);

        // Cooking callbacks
        this.cooking.onComplete = (data) => this.onCookingComplete(data);

        this.bindEvents();
    }

    bindEvents() {
        // --- Title ---
        document.getElementById('btn-start').addEventListener('click', () => {
            this.sound.ensureContext();
            this.sound.playButtonPress();
            this.startNewGame();
        });
        document.getElementById('btn-continue').addEventListener('click', () => {
            this.sound.ensureContext();
            this.sound.playButtonPress();
            this.goToHub();
        });

        // --- Hub ---
        document.getElementById('btn-hub-battle').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.startBattle();
        });
        document.getElementById('btn-hub-mining').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.startMining();
        });
        document.getElementById('btn-hub-crafting').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.showCrafting();
        });
        document.getElementById('btn-hub-map').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.showWorldMap();
        });
        document.getElementById('btn-map-back').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });

        // --- Dialogue ---
        document.getElementById('dialogue-overlay').addEventListener('click', () => {
            this.advanceDialogue();
        });

        // --- Battle Quit (途中でやめる) ---
        document.getElementById('btn-battle-quit').addEventListener('click', () => {
            this.sound.playButtonPress();
            if (this.battle.battleActive) {
                this.battle.battleActive = false;
                this.battle.stopTimer();
            }
            this.goToHub();
        });

        // --- Battle numpad ---
        document.getElementById('numpad').addEventListener('click', (e) => {
            const btn = e.target.closest('.num-btn');
            if (!btn) return;
            if (btn.dataset.num !== undefined) this.battle.handleInput(btn.dataset.num);
            else if (btn.dataset.action === 'delete') this.battle.handleDelete();
            else if (btn.dataset.action === 'submit') this.battle.handleSubmit();
        });

        // --- Mining numpad ---
        document.getElementById('mining-numpad').addEventListener('click', (e) => {
            const btn = e.target.closest('.num-btn');
            if (!btn) return;
            if (btn.dataset.num !== undefined) this.mining.handleInput(btn.dataset.num);
            else if (btn.dataset.action === 'delete') this.mining.handleDelete();
            else if (btn.dataset.action === 'submit') this.mining.handleSubmit();
        });

        // --- Keyboard ---
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'battle') {
                if (e.key >= '0' && e.key <= '9') this.battle.handleInput(e.key);
                else if (e.key === 'Backspace') { e.preventDefault(); this.battle.handleDelete(); }
                else if (e.key === 'Enter') { e.preventDefault(); this.battle.handleSubmit(); }
            } else if (this.currentScreen === 'mining') {
                if (e.key >= '0' && e.key <= '9') this.mining.handleInput(e.key);
                else if (e.key === 'Backspace') { e.preventDefault(); this.mining.handleDelete(); }
                else if (e.key === 'Enter') { e.preventDefault(); this.mining.handleSubmit(); }
            } else if (this.currentScreen === 'crafting' && this.cooking.cookingActive) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.cooking.onTap();
                }
            }
        });

        // --- Results ---
        this.resultEls.btnNext.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });
        this.resultEls.btnNextBattle.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.startBattle();
        });
        this.resultEls.btnRetry.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.retryStage();
        });
        this.resultEls.btnTitle.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToTitle();
        });

        // --- Crafting ---
        document.getElementById('btn-crafting-back').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });

        // --- Crafting Tabs ---
        document.querySelectorAll('.craft-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.sound.playButtonPress();
                document.querySelectorAll('.craft-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabName = tab.dataset.tab;
                document.getElementById('crafting-tab-equip').style.display = tabName === 'equip' ? '' : 'none';
                document.getElementById('crafting-tab-food').style.display = tabName === 'food' ? '' : 'none';
                if (tabName === 'equip') {
                    document.getElementById('crafting-title').textContent = '🔨 クラフト';
                } else {
                    document.getElementById('crafting-title').textContent = '🍳 りょうり';
                    // Cancel any active cooking when switching tabs
                    if (this.cooking.cookingActive) {
                        this.cooking.cancel();
                    }
                    document.getElementById('cooking-result-overlay').style.display = 'none';
                    this.renderFoodRecipes();
                }
            });
        });

        // --- Mining Quit (途中でやめる) ---
        document.getElementById('btn-mining-quit').addEventListener('click', () => {
            this.sound.playButtonPress();
            if (this.mining.miningActive) {
                this.mining.miningActive = false;
                this.onMiningComplete({
                    minedCount: this.mining.minedCount,
                    resources: { ...this.mining.sessionResources },
                });
            } else {
                this.goToHub();
            }
        });

        // --- Mining Result ---
        document.getElementById('btn-mining-back').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });

        // --- Cooking (within crafting screen) ---
        document.getElementById('cooking-tap-btn').addEventListener('click', () => {
            this.cooking.onTap();
        });
        document.getElementById('btn-cooking-result-ok').addEventListener('click', () => {
            this.sound.playButtonPress();
            document.getElementById('cooking-result-overlay').style.display = 'none';
            this.renderCraftingScreen();
        });
    }

    // --- Screen Management ---

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[name].classList.add('active');
        this.currentScreen = name;

        if (name === 'battle') this.effects.createStars('battle-stars');
        else if (name === 'result') this.effects.createStars('result-stars');
        else if (name === 'hub') this.effects.createStars('hub-stars');
        else if (name === 'mining') this.effects.createStars('mining-stars');
        else if (name === 'map') this.effects.createStars('map-stars');
        else if (name === 'crafting') this.effects.createStars('crafting-stars');
        else if (name === 'miningResult') this.effects.createStars('mining-result-stars');
    }

    // --- Game Flow ---

    startNewGame() {
        this.currentStage = 0;
        this.totalScore = 0;
        this.mathEngine.resetAll();
        this.inventory.reset();
        this.shownDialogues = new Set();

        // Show intro dialogue, then first area entrance
        this.showDialogue(STORY_DIALOGUES.intro, () => {
            this.showDialogue(STORY_DIALOGUES.area0_enter, () => {
                this.goToHub();
            });
        });
    }

    goToHub() {
        // Cancel active cooking if leaving crafting
        if (this.cooking.cookingActive) {
            this.cooking.cancel();
        }
        document.getElementById('cooking-result-overlay').style.display = 'none';

        // Show pending story dialogues from victory
        if (this._pendingClearDialogue) {
            const key = this._pendingClearDialogue;
            this._pendingClearDialogue = null;
            const dialogues = STORY_DIALOGUES[key];
            if (dialogues) {
                this.showDialogue(dialogues, () => {
                    if (this._pendingEnterDialogue) {
                        const enterKey = this._pendingEnterDialogue;
                        this._pendingEnterDialogue = null;
                        const enterDialogues = STORY_DIALOGUES[enterKey];
                        if (enterDialogues) {
                            this.showDialogue(enterDialogues, () => {
                                this.updateHubScreen();
                                this.showScreen('hub');
                            });
                            return;
                        }
                    }
                    this.updateHubScreen();
                    this.showScreen('hub');
                });
                return;
            }
        }
        if (this._pendingEnterDialogue) {
            const key = this._pendingEnterDialogue;
            this._pendingEnterDialogue = null;
            const dialogues = STORY_DIALOGUES[key];
            if (dialogues) {
                this.showDialogue(dialogues, () => {
                    this.updateHubScreen();
                    this.showScreen('hub');
                });
                return;
            }
        }
        this.updateHubScreen();
        this.showScreen('hub');
    }

    goToTitle() {
        this.saveProgress();
        this.showScreen('title');
        this.updateTitleScreen();
    }

    // --- Hub ---

    updateHubScreen() {
        document.getElementById('hub-stage').textContent = this.currentStage + 1;
        document.getElementById('hub-score').textContent = this.totalScore.toLocaleString();

        // Equipment
        const weapon = this.inventory.equippedWeapon;
        const armor = this.inventory.equippedArmor;
        document.getElementById('hub-weapon').textContent = weapon
            ? `${weapon.icon} ${weapon.name} (${weapon.description})`
            : 'なし';
        document.getElementById('hub-armor').textContent = armor
            ? `${armor.icon} ${armor.name} (${armor.description})`
            : 'なし';

        // Inventory bar
        this.renderInventoryBar(document.getElementById('hub-inventory'));

        // Food buff status
        const buffs = this.inventory.getFoodBuffs();
        const buffEl = document.getElementById('hub-food-buff');
        if (buffs.hpBonus > 0 || buffs.attackBonus > 0) {
            let buffText = '🍽️ バフ: ';
            if (buffs.hpBonus > 0) buffText += `HP +${buffs.hpBonus} `;
            if (buffs.attackBonus > 0) buffText += `こうげき +${buffs.attackBonus}`;
            buffEl.textContent = buffText;
            buffEl.style.display = '';
        } else {
            buffEl.style.display = 'none';
        }

        // Quest banner
        const quest = getCurrentQuest(this.currentStage);
        const banner = document.getElementById('hub-quest-banner');
        if (quest) {
            banner.style.display = '';
            document.getElementById('hub-quest-icon').textContent = quest.icon;
            document.getElementById('hub-quest-title').textContent = quest.isBoss ? '⭐ ボスクエスト' : '📋 つぎのクエスト';
            document.getElementById('hub-quest-desc').textContent = quest.description;
        } else {
            banner.style.display = 'none';
        }
    }

    renderInventoryBar(container) {
        container.innerHTML = Object.entries(RESOURCE_INFO).map(([type, info]) =>
            `<span class="inv-item"><span class="inv-icon">${info.icon}</span><span class="inv-count">${this.inventory.resources[type]}</span></span>`
        ).join('');
    }

    // --- Battle ---

    startBattle() {
        // Check for boss story trigger
        const trigger = getStoryTrigger(this.currentStage);
        if (trigger && trigger.endsWith('_boss') && !this.shownDialogues.has(trigger)) {
            this.shownDialogues.add(trigger);
            const dialogues = STORY_DIALOGUES[trigger];
            if (dialogues) {
                this.showDialogue(dialogues, () => {
                    this._launchBattle();
                });
                return;
            }
        }
        this._launchBattle();
    }

    _launchBattle() {
        // Apply equipment + food bonuses
        const hpBonus = this.inventory.getHpBonus();
        const foodBuffs = this.inventory.getFoodBuffs();
        this.battle.playerMaxHp = 100 + hpBonus + foodBuffs.hpBonus;
        this.battle.foodAttackBonus = foodBuffs.attackBonus;

        // Clear food buffs (one-time use)
        this.inventory.clearFoodBuffs();

        this.showScreen('battle');
        this.battle.score = 0;
        this.battle.startBattle(this.currentStage);
    }

    retryStage() {
        const hpBonus = this.inventory.getHpBonus();
        const foodBuffs = this.inventory.getFoodBuffs();
        this.battle.playerMaxHp = 100 + hpBonus + foodBuffs.hpBonus;
        this.battle.foodAttackBonus = foodBuffs.attackBonus;
        this.inventory.clearFoodBuffs();

        this.battle.score = Math.max(0, this.battle.score - 200);
        this.showScreen('battle');
        this.battle.startBattle(this.currentStage);
    }

    onBattleVictory(data) {
        this.totalScore += data.score;
        if (data.stage + 1 > this.bestStage) {
            this.bestStage = data.stage + 1;
        }
        this.currentStage++;

        // Check for area clear story
        const clearTrigger = getStoryTrigger(this.currentStage, data.stage);
        if (clearTrigger && clearTrigger.endsWith('_clear') && !this.shownDialogues.has(clearTrigger)) {
            this.shownDialogues.add(clearTrigger);
            this._pendingClearDialogue = clearTrigger;
        }

        // Check for new area entrance story
        const enterTrigger = getStoryTrigger(this.currentStage);
        if (enterTrigger && enterTrigger.endsWith('_enter') && !this.shownDialogues.has(enterTrigger)) {
            this.shownDialogues.add(enterTrigger);
            this._pendingEnterDialogue = enterTrigger;
        }

        // Drop resources as reward
        const loot = this.generateBattleLoot(data.stage);
        Object.entries(loot).forEach(([type, amount]) => {
            this.inventory.addResource(type, amount);
        });

        this.saveProgress();

        // Result screen
        this.resultEls.icon.textContent = '🎉';
        this.resultEls.title.textContent = 'しょうり！';
        this.resultEls.title.className = 'result-title victory';
        this.resultEls.score.textContent = data.score.toLocaleString();
        this.resultEls.accuracy.textContent = `${data.accuracy}%`;
        this.resultEls.combo.textContent = `${data.maxCombo}x`;
        this.resultEls.btnNext.style.display = '';
        this.resultEls.btnNextBattle.style.display = '';
        this.resultEls.btnRetry.style.display = 'none';

        // Show loot
        if (Object.keys(loot).length > 0) {
            this.resultEls.loot.style.display = '';
            this.resultEls.lootItems.innerHTML = Object.entries(loot).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                return `<div class="loot-item"><span class="loot-item-icon">${info.icon}</span><span class="loot-item-count">×${amount}</span></div>`;
            }).join('');
        } else {
            this.resultEls.loot.style.display = 'none';
        }

        // Level info
        if (data.levelChanged) {
            this.resultEls.level.style.display = '';
            this.resultEls.levelDetail.textContent = this.mathEngine.getLevelName();
        } else {
            this.resultEls.level.style.display = 'none';
        }

        this.showScreen('result');
        this.sound.playVictory();
        this.effects.victoryCelebration();
    }

    onBattleDefeat(data) {
        this.totalScore += Math.floor(data.score * 0.5);
        this.saveProgress();

        this.resultEls.icon.textContent = '😢';
        this.resultEls.title.textContent = 'ざんねん…';
        this.resultEls.title.className = 'result-title defeat';
        this.resultEls.score.textContent = data.score.toLocaleString();
        this.resultEls.accuracy.textContent = `${data.accuracy}%`;
        this.resultEls.combo.textContent = `${data.maxCombo}x`;
        this.resultEls.btnNext.style.display = 'none';
        this.resultEls.btnNextBattle.style.display = 'none';
        this.resultEls.btnRetry.style.display = '';
        this.resultEls.loot.style.display = 'none';
        this.resultEls.level.style.display = 'none';

        this.showScreen('result');
        this.sound.playDefeat();
    }

    /**
     * Generate resource drops from battle victory.
     */
    generateBattleLoot(stage) {
        const loot = {};
        // Base: wood + stone
        loot.wood = 1 + Math.floor(Math.random() * 3);
        loot.stone = 1 + Math.floor(Math.random() * 2);

        // Higher stages drop rarer items
        if (stage >= 2 && Math.random() < 0.5) loot.iron = 1 + Math.floor(Math.random() * 2);
        if (stage >= 4 && Math.random() < 0.4) loot.gold = 1;
        if (stage >= 6 && Math.random() < 0.3) loot.diamond = 1;

        // New areas: increased drops
        if (stage >= 9) {
            loot.iron = (loot.iron || 0) + 1 + Math.floor(Math.random() * 2);
            if (Math.random() < 0.5) loot.gold = (loot.gold || 0) + 1;
        }
        if (stage >= 12) {
            loot.gold = (loot.gold || 0) + 1;
            if (Math.random() < 0.4) loot.diamond = (loot.diamond || 0) + 1;
        }
        if (stage >= 15) {
            loot.diamond = (loot.diamond || 0) + 1;
            if (Math.random() < 0.5) loot.diamond += 1;
        }

        return loot;
    }

    // --- Mining ---

    startMining() {
        this.showScreen('mining');
        this.mining.startMining();
    }

    onMiningComplete(data) {
        this.saveProgress();

        // Show mining result
        const lootContainer = document.getElementById('mining-loot-items');
        if (Object.keys(data.resources).length > 0) {
            lootContainer.innerHTML = Object.entries(data.resources).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                return `<div class="loot-item"><span class="loot-item-icon">${info.icon}</span><span class="loot-item-count">×${amount}</span></div>`;
            }).join('');
        } else {
            lootContainer.innerHTML = '<p style="color:#8b949e;font-size:0.85rem">なにもとれなかった…</p>';
        }

        this.showScreen('miningResult');
        this.sound.playVictory();
    }

    // --- Cooking (integrated into crafting) ---

    startCookingMinigame(recipe) {
        this.cooking.startCooking(recipe);
    }

    onCookingComplete(data) {
        this.saveProgress();
        const item = data.item;

        // Show inline result overlay within crafting screen
        document.getElementById('cooking-result-icon').textContent = item.icon;
        document.getElementById('cooking-result-title').textContent = item.quality;
        document.getElementById('cooking-result-title').className = `result-title ${item.stars >= 2 ? 'victory' : 'defeat'}`;
        document.getElementById('cooking-result-stars-display').textContent = '⭐'.repeat(item.stars) + '☆'.repeat(3 - item.stars);
        document.getElementById('cooking-result-item-icon').textContent = item.icon;
        document.getElementById('cooking-result-item-name').textContent = item.name;

        let effectText = `HP +${item.heal} かいふく`;
        if (item.buff && item.buff.attack) {
            effectText += ` / こうげき +${item.buff.attack}`;
        }
        document.getElementById('cooking-result-effect').textContent = effectText;

        document.getElementById('cooking-result-overlay').style.display = '';
        this.sound.playVictory();
        if (item.stars >= 3) this.effects.victoryCelebration();

        // Update inventory bar
        this.renderInventoryBar(document.getElementById('crafting-inv'));
    }

    // --- Crafting ---

    showCrafting() {
        this.renderCraftingScreen();
        this.showScreen('crafting');
    }

    renderCraftingScreen() {
        // Inventory bar
        this.renderInventoryBar(document.getElementById('crafting-inv'));

        // Equipment display
        const weapon = this.inventory.equippedWeapon;
        const armor = this.inventory.equippedArmor;
        document.getElementById('craft-equipped-weapon').textContent = weapon
            ? `🗡️ ${weapon.name}`
            : '🗡️ なし';
        document.getElementById('craft-equipped-armor').textContent = armor
            ? `🛡️ ${armor.name}`
            : '🛡️ なし';

        // Equipment Recipes
        const container = document.getElementById('crafting-recipes');
        container.innerHTML = '';

        RECIPES.forEach(recipe => {
            const hasCrafted = this.inventory.hasCrafted(recipe.id);
            const canCraft = !hasCrafted && this.inventory.hasResources(recipe.cost);

            const card = document.createElement('div');
            card.className = `recipe-card ${canCraft ? 'craftable' : ''} ${hasCrafted ? 'crafted' : ''}`;

            const costHtml = Object.entries(recipe.cost).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                const has = this.inventory.resources[type] >= amount;
                return `<span class="cost-item ${has ? 'has' : 'missing'}">${info.icon}×${amount}</span>`;
            }).join('');

            card.innerHTML = `
        <div class="recipe-icon">${recipe.icon}</div>
        <div class="recipe-info">
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-desc">${recipe.description}</div>
          <div class="recipe-cost">${costHtml}</div>
        </div>
        <div class="recipe-action">
          ${hasCrafted
                    ? '<button class="craft-btn crafted-btn" disabled>そうびちゅう</button>'
                    : `<button class="craft-btn" ${canCraft ? '' : 'disabled'}>つくる</button>`
                }
        </div>
      `;

            if (!hasCrafted && canCraft) {
                card.querySelector('.craft-btn').addEventListener('click', () => {
                    this.craftItem(recipe);
                });
            }

            container.appendChild(card);
        });

        // Food Recipes
        this.renderFoodRecipes();
    }

    renderFoodRecipes() {
        const foodContainer = document.getElementById('food-recipes');
        foodContainer.innerHTML = '';
        foodContainer.style.display = '';

        // Show current buff status
        const buffStatus = document.getElementById('food-buff-status');
        const buffs = this.inventory.getFoodBuffs();
        if (buffs.hpBonus > 0 || buffs.attackBonus > 0) {
            let buffText = '🍽️ つぎのバトルのバフ: ';
            if (buffs.hpBonus > 0) buffText += `HP +${buffs.hpBonus} `;
            if (buffs.attackBonus > 0) buffText += `こうげき +${buffs.attackBonus}`;
            buffStatus.textContent = buffText;
            buffStatus.style.display = '';
        } else {
            buffStatus.textContent = '';
            buffStatus.style.display = 'none';
        }

        // --- Owned food items (can eat) ---
        const ownedRecipeIds = Object.keys(this.inventory.foodItems).filter(id => this.inventory.getFoodCount(id) > 0);
        if (ownedRecipeIds.length > 0) {
            const ownedHeader = document.createElement('div');
            ownedHeader.className = 'food-section-header';
            ownedHeader.textContent = '🍽️ もちもの';
            foodContainer.appendChild(ownedHeader);

            ownedRecipeIds.forEach(recipeId => {
                const count = this.inventory.getFoodCount(recipeId);
                const itemData = this.inventory.getCookedItemData(recipeId);
                if (!itemData) return;

                const card = document.createElement('div');
                card.className = 'recipe-card craftable';

                let desc = `HP +${itemData.heal} かいふく`;
                if (itemData.buff && itemData.buff.attack) desc += ` / こうげき +${itemData.buff.attack}`;

                card.innerHTML = `
            <div class="recipe-icon">${itemData.icon}</div>
            <div class="recipe-info">
              <div class="recipe-name">${itemData.name} <span class="food-count">×${count}</span></div>
              <div class="recipe-desc">${desc}</div>
              <div class="recipe-cost">${'⭐'.repeat(itemData.stars || 1)}</div>
            </div>
            <div class="recipe-action recipe-action--food">
              <button class="craft-btn craft-btn--eat">たべる</button>
            </div>
          `;

                card.querySelector('.craft-btn--eat').addEventListener('click', () => {
                    this.eatFood(recipeId);
                });

                foodContainer.appendChild(card);
            });
        }

        // --- Cooking recipes (can cook via minigame) ---
        const cookHeader = document.createElement('div');
        cookHeader.className = 'food-section-header';
        cookHeader.textContent = '🍳 つくる';
        foodContainer.appendChild(cookHeader);

        COOKING_RECIPES.forEach(recipe => {
            const canCook = this.inventory.hasResources(recipe.cost);

            const card = document.createElement('div');
            card.className = `recipe-card ${canCook ? 'craftable' : ''}`;

            const costHtml = Object.entries(recipe.cost).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                const has = this.inventory.resources[type] >= amount;
                return `<span class="cost-item ${has ? 'has' : 'missing'}">${info.icon}×${amount}</span>`;
            }).join('');

            card.innerHTML = `
        <div class="recipe-icon">${recipe.icon}</div>
        <div class="recipe-info">
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-desc">${recipe.description}</div>
          <div class="recipe-cost">${costHtml}</div>
        </div>
        <div class="recipe-action recipe-action--food">
          <button class="craft-btn craft-btn--cook" ${canCook ? '' : 'disabled'}>つくる</button>
          <span class="recipe-difficulty">${'⏱️'.repeat(recipe.attempts)}</span>
        </div>
      `;

            if (canCook) {
                card.querySelector('.craft-btn--cook').addEventListener('click', () => {
                    this.sound.playButtonPress();
                    this.startCookingMinigame(recipe);
                });
            }

            foodContainer.appendChild(card);
        });
    }

    craftItem(recipe) {
        if (this.inventory.craft(recipe)) {
            this.sound.playLevelUp();
            this.effects.victoryCelebration();
            this.renderCraftingScreen(); // Re-render
        }
    }

    eatFood(recipeId) {
        if (this.inventory.useFood(recipeId)) {
            this.sound.playLevelUp();
            this.effects.victoryCelebration();
            this.renderCraftingScreen();
        }
    }

    // --- Save/Load ---

    saveProgress() {
        const data = {
            bestStage: this.bestStage,
            currentStage: this.currentStage,
            totalScore: this.totalScore,
            mathLevel: this.mathEngine.level,
            shownDialogues: [...this.shownDialogues],
        };
        try {
            localStorage.setItem('keisan-quest-save', JSON.stringify(data));
        } catch (e) { }
    }

    loadProgress() {
        try {
            const raw = localStorage.getItem('keisan-quest-save');
            if (raw) {
                const data = JSON.parse(raw);
                this.bestStage = data.bestStage || 0;
                this.currentStage = data.currentStage || 0;
                this.totalScore = data.totalScore || 0;
                if (data.mathLevel) this.mathEngine.level = data.mathLevel;
                if (data.shownDialogues) this.shownDialogues = new Set(data.shownDialogues);
                this.updateTitleScreen();
            }
        } catch (e) { }
    }

    updateTitleScreen() {
        const stats = document.getElementById('title-stats');
        const bestStageEl = document.getElementById('best-stage');
        const btnContinue = document.getElementById('btn-continue');

        if (this.bestStage > 0) {
            stats.style.display = '';
            bestStageEl.textContent = this.bestStage;
            btnContinue.style.display = '';
        } else {
            stats.style.display = 'none';
            btnContinue.style.display = 'none';
        }
    }

    // --- Dialogue System ---

    showDialogue(messages, callback) {
        this.dialogueQueue = [...messages];
        this.dialogueCallback = callback || null;
        this._showNextDialogueLine();
    }

    _showNextDialogueLine() {
        if (this.dialogueQueue.length === 0) {
            document.getElementById('dialogue-overlay').classList.remove('active');
            if (this.dialogueCallback) {
                const cb = this.dialogueCallback;
                this.dialogueCallback = null;
                cb();
            }
            return;
        }

        const line = this.dialogueQueue.shift();
        document.getElementById('dialogue-speaker-icon').textContent = line.speaker;
        document.getElementById('dialogue-speaker-name').textContent = line.name;
        document.getElementById('dialogue-text').textContent = line.text;
        document.getElementById('dialogue-overlay').classList.add('active');
        this.sound.playButtonPress();
    }

    advanceDialogue() {
        this._showNextDialogueLine();
    }

    // --- World Map ---

    showWorldMap() {
        this.renderWorldMap();
        this.showScreen('map');
    }

    renderWorldMap() {
        const container = document.getElementById('map-world');
        container.innerHTML = '';
        const areas = getAreaProgress(this.currentStage);

        areas.forEach((area, idx) => {
            // Path connector between areas
            if (idx > 0) {
                const path = document.createElement('div');
                path.className = 'map-path';
                container.appendChild(path);
            }

            const node = document.createElement('div');
            node.className = 'map-area-node';
            if (!area.isUnlocked) node.classList.add('locked');
            else if (area.currentInArea) node.classList.add('current');
            else if (area.isCompleted) node.classList.add('completed');

            const progressPct = (area.stagesCompleted / area.totalStages) * 100;
            const statusIcon = area.isCompleted ? '✅' : area.currentInArea ? '⚔️' : area.isUnlocked ? '' : '🔒';

            node.innerHTML = `
                <div class="map-area-icon">${area.icon}</div>
                <div class="map-area-info">
                    <div class="map-area-name">${area.name}</div>
                    <div class="map-area-progress">${area.stagesCompleted}/${area.totalStages} クリア</div>
                    <div class="map-area-progress-bar">
                        <div class="map-area-progress-fill" style="width:${progressPct}%; background:${area.color}"></div>
                    </div>
                </div>
                <div class="map-area-status">${statusIcon}</div>
            `;

            container.appendChild(node);
        });
    }
}

// --- Start ---
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameApp();
});
