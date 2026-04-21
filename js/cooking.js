/**
 * cooking.js - Cooking mini-game system with timing bar mechanic
 * Integrated into crafting screen's food tab.
 */

// --- Cooking Recipes ---
const COOKING_RECIPES = [
    {
        id: 'yakiimo',
        name: 'やきいも',
        icon: '🍠',
        cost: { wood: 2 },
        attempts: 3,
        speed: 1.2,
        targetWidth: 30,
        heal: { base: 20, star3: 40 },
        description: 'HP +20〜40',
    },
    {
        id: 'steak',
        name: 'いしやきステーキ',
        icon: '🥩',
        cost: { stone: 3, wood: 1 },
        attempts: 4,
        speed: 1.5,
        targetWidth: 25,
        heal: { base: 35, star3: 60 },
        description: 'HP +35〜60',
    },
    {
        id: 'gold_soup',
        name: 'きんのスープ',
        icon: '🍲',
        cost: { gold: 2, stone: 1 },
        attempts: 4,
        speed: 1.8,
        targetWidth: 22,
        heal: { base: 50, star3: 80 },
        description: 'HP +50〜80',
    },
    {
        id: 'diamond_course',
        name: 'ダイヤのフルコース',
        icon: '✨',
        cost: { diamond: 1, gold: 2, iron: 1 },
        attempts: 5,
        speed: 2.2,
        targetWidth: 18,
        heal: { base: 70, star3: 120 },
        buff: { attack: 5 },
        description: 'HP +70〜120, 攻撃+5',
    },
];

class CookingSystem {
    constructor(effects, sound, inventory) {
        this.effects = effects;
        this.sound = sound;
        this.inventory = inventory;

        // State
        this.currentRecipe = null;
        this.totalAttempts = 0;
        this.successes = 0;
        this.currentAttempt = 0;
        this.markerPosition = 0;   // 0 - 100
        this.markerDirection = 1;   // 1 or -1
        this.markerSpeed = 2.0;
        this.targetStart = 35;
        this.targetEnd = 65;
        this.isOscillating = false;
        this.animId = null;
        this.lastTimestamp = 0;
        this.cookingActive = false;
        this.phase = 'idle';     // 'idle' | 'timing' | 'done'

        // Callbacks
        this.onComplete = null;

        // DOM references (within crafting screen's food tab)
        this.els = {
            timingArea: document.getElementById('cooking-timing-area'),
            timingBar: document.getElementById('timing-bar'),
            timingMarker: document.getElementById('timing-marker'),
            timingTarget: document.getElementById('timing-target'),
            tapBtn: document.getElementById('cooking-tap-btn'),
            progress: document.getElementById('cooking-progress'),
            recipeName: document.getElementById('cooking-recipe-name'),
            recipeIcon: document.getElementById('cooking-recipe-icon'),
            messageOverlay: document.getElementById('cooking-message'),
            messageText: document.getElementById('cooking-message-text'),
            foodRecipes: document.getElementById('food-recipes'),
        };
    }

    /**
     * Start timing mini-game for a recipe (called from crafting tab).
     */
    startCooking(recipe) {
        if (!this.inventory.spendResources(recipe.cost)) return;

        this.currentRecipe = recipe;
        this.totalAttempts = recipe.attempts;
        this.successes = 0;
        this.currentAttempt = 0;
        this.markerSpeed = recipe.speed;
        this.phase = 'timing';
        this.cookingActive = true;

        // Calculate target zone
        const halfWidth = recipe.targetWidth / 2;
        this.targetStart = 50 - halfWidth;
        this.targetEnd = 50 + halfWidth;

        // Switch UI: hide recipe list, show timing area
        this.els.foodRecipes.style.display = 'none';
        this.els.timingArea.style.display = '';
        this.els.recipeName.textContent = recipe.name;
        this.els.recipeIcon.textContent = recipe.icon;

        // Set target zone visual
        this.els.timingTarget.style.left = `${this.targetStart}%`;
        this.els.timingTarget.style.width = `${recipe.targetWidth}%`;

        this.updateProgress();
        this.startOscillation();
    }

    startOscillation() {
        this.stopOscillation();
        this.markerPosition = 0;
        this.markerDirection = 1;
        this.isOscillating = true;
        this.lastTimestamp = performance.now();

        const animate = (now) => {
            if (!this.isOscillating) return;

            const dt = (now - this.lastTimestamp) / 1000;
            this.lastTimestamp = now;

            // Move marker
            this.markerPosition += this.markerDirection * this.markerSpeed * dt * 100;

            // Bounce at edges
            if (this.markerPosition >= 100) {
                this.markerPosition = 100;
                this.markerDirection = -1;
            } else if (this.markerPosition <= 0) {
                this.markerPosition = 0;
                this.markerDirection = 1;
            }

            // Update visual
            this.els.timingMarker.style.left = `${this.markerPosition}%`;

            this.animId = requestAnimationFrame(animate);
        };

        this.animId = requestAnimationFrame(animate);
    }

    stopOscillation() {
        this.isOscillating = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    /**
     * Handle player tap.
     */
    onTap() {
        if (!this.isOscillating || this.phase !== 'timing') return;

        this.stopOscillation();
        this.currentAttempt++;

        // Check if marker is in target zone
        const isHit = this.markerPosition >= this.targetStart && this.markerPosition <= this.targetEnd;

        if (isHit) {
            this.successes++;
            this.sound.playCorrect();
            this.showMessage('グッド！✨', 'correct');
            this.els.timingMarker.classList.add('hit');
        } else {
            this.sound.playWrong();
            this.showMessage('ミス…💦', 'wrong');
            this.els.timingMarker.classList.add('miss');
        }

        this.updateProgress();

        // Next attempt or finish
        setTimeout(() => {
            this.els.timingMarker.classList.remove('hit', 'miss');

            if (this.currentAttempt >= this.totalAttempts) {
                this.evaluateResult();
            } else {
                // Increase speed slightly each attempt
                this.markerSpeed += 0.15;
                this.startOscillation();
            }
        }, 800);
    }

    evaluateResult() {
        this.phase = 'done';
        this.cookingActive = false;

        const ratio = this.successes / this.totalAttempts;
        let quality, stars, healAmount;

        if (ratio >= 1.0) {
            quality = 'だいせいこう！';
            stars = 3;
            healAmount = this.currentRecipe.heal.star3;
        } else if (ratio >= 0.5) {
            quality = 'せいこう！';
            stars = 2;
            healAmount = Math.floor(
                this.currentRecipe.heal.base +
                (this.currentRecipe.heal.star3 - this.currentRecipe.heal.base) * 0.5
            );
        } else {
            quality = 'しっぱい…';
            stars = 1;
            healAmount = this.currentRecipe.heal.base;
        }

        const cookedItem = {
            recipeId: this.currentRecipe.id,
            name: this.currentRecipe.name,
            icon: this.currentRecipe.icon,
            stars,
            quality,
            heal: healAmount,
            buff: stars >= 3 ? (this.currentRecipe.buff || null) : null,
        };

        // Add to inventory
        this.inventory.addCookedItem(cookedItem);

        // Hide timing area
        this.els.timingArea.style.display = 'none';

        if (this.onComplete) {
            this.onComplete({
                item: cookedItem,
                successes: this.successes,
                total: this.totalAttempts,
            });
        }
    }

    /**
     * Cancel cooking and return to recipe list.
     */
    cancel() {
        this.stopOscillation();
        this.cookingActive = false;
        this.phase = 'idle';
        this.els.timingArea.style.display = 'none';
        this.els.foodRecipes.style.display = '';
    }

    updateProgress() {
        let html = '';
        for (let i = 0; i < this.totalAttempts; i++) {
            if (i < this.currentAttempt) {
                html += '<span class="progress-dot done">●</span>';
            } else if (i === this.currentAttempt) {
                html += '<span class="progress-dot current">◉</span>';
            } else {
                html += '<span class="progress-dot">○</span>';
            }
        }
        this.els.progress.innerHTML = html;
    }

    showMessage(text, type) {
        this.els.messageText.textContent = text;
        this.els.messageText.className = `message-text ${type}`;
        this.els.messageOverlay.classList.add('show');
        setTimeout(() => {
            this.els.messageOverlay.classList.remove('show');
        }, 700);
    }
}
