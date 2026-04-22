/**
 * math-engine.js - Subtraction problem generator with adaptive difficulty
 */

class MathEngine {
    constructor() {
        this.level = 1; // 1: easy, 2: medium, 3: hard
        this.mode = 'subtract'; // 'subtract' | 'multiply'
        this.totalCorrect = 0;
        this.totalAttempts = 0;
        this.consecutiveCorrect = 0;
        this.maxCombo = 0;
        this.recentResults = []; // Last 10 results for adaptive difficulty
        this.usedProblems = new Set(); // Avoid repeats within a session
    }

    /**
     * Generate a problem based on current mode and level.
     * Returns { a, b, answer, op }
     */
    generateProblem() {
        return this.mode === 'multiply'
            ? this.generateMultiplyProblem()
            : this.generateSubtractProblem();
    }

    generateSubtractProblem() {
        let a, b, onesDigit, attempts = 0;
        do {
            switch (this.level) {
                case 1:
                    a = this.randomInt(3, 10);
                    b = this.randomInt(1, a - 1);
                    break;
                case 2:
                    a = this.randomInt(11, 18);
                    b = this.randomInt(a - 9, a - 1);
                    break;
                case 3:
                    a = this.randomInt(12, 19);
                    onesDigit = a % 10;
                    b = this.randomInt(Math.max(onesDigit + 1, a - 9), a - 1);
                    break;
                default:
                    a = this.randomInt(3, 10);
                    b = this.randomInt(1, a - 1);
            }
            attempts++;
        } while (this.usedProblems.has(`${a}-${b}`) && attempts < 50);

        this.usedProblems.add(`${a}-${b}`);
        if (this.usedProblems.size > 200) this.usedProblems.clear();

        return { a, b, answer: a - b, op: 'ー' };
    }

    generateMultiplyProblem() {
        let a, b, attempts = 0;
        do {
            switch (this.level) {
                case 1: // かんたん: 2-5のだん × 1-5
                    a = this.randomInt(2, 5);
                    b = this.randomInt(1, 5);
                    break;
                case 2: // ふつう: 2-9のだん × 1-9
                    a = this.randomInt(2, 9);
                    b = this.randomInt(1, 9);
                    break;
                case 3: // むずかしい: 6-9のだん × 6-9
                    a = this.randomInt(6, 9);
                    b = this.randomInt(6, 9);
                    break;
                default:
                    a = this.randomInt(2, 5);
                    b = this.randomInt(1, 5);
            }
            attempts++;
        } while (this.usedProblems.has(`m${a}x${b}`) && attempts < 50);

        this.usedProblems.add(`m${a}x${b}`);
        if (this.usedProblems.size > 200) this.usedProblems.clear();

        return { a, b, answer: a * b, op: '×' };
    }

    /**
     * Check the user's answer and update statistics.
     * Returns { isCorrect, combo, levelChanged, newLevel }
     */
    checkAnswer(userAnswer, correctAnswer) {
        const isCorrect = userAnswer === correctAnswer;
        this.totalAttempts++;

        if (isCorrect) {
            this.totalCorrect++;
            this.consecutiveCorrect++;
            if (this.consecutiveCorrect > this.maxCombo) {
                this.maxCombo = this.consecutiveCorrect;
            }
        } else {
            this.consecutiveCorrect = 0;
        }

        // Track recent results (last 10)
        this.recentResults.push(isCorrect);
        if (this.recentResults.length > 10) {
            this.recentResults.shift();
        }

        const levelChanged = this.adjustDifficulty();

        return {
            isCorrect,
            combo: this.consecutiveCorrect,
            levelChanged,
            newLevel: this.level,
        };
    }

    /**
     * Adjust difficulty based on recent performance.
     * Returns true if level changed.
     */
    adjustDifficulty() {
        if (this.recentResults.length < 5) return false;

        const recentCorrect = this.recentResults.filter(r => r).length;
        const recentRate = recentCorrect / this.recentResults.length;
        const oldLevel = this.level;

        if (recentRate >= 0.8 && this.consecutiveCorrect >= 3 && this.level < 3) {
            this.level++;
            this.recentResults = [];
        } else if (recentRate <= 0.3 && this.level > 1) {
            this.level--;
            this.recentResults = [];
        }

        return this.level !== oldLevel;
    }

    /**
     * Get current accuracy as a percentage.
     */
    getAccuracy() {
        if (this.totalAttempts === 0) return 0;
        return Math.round((this.totalCorrect / this.totalAttempts) * 100);
    }

    /**
     * Get level name in Japanese.
     */
    getLevelName() {
        if (this.mode === 'multiply') {
            switch (this.level) {
                case 1: return 'かんたん 🌱 (2〜5のだん)';
                case 2: return 'ふつう ⚡ (2〜9のだん)';
                case 3: return 'むずかしい 🔥 (6〜9のだん)';
                default: return 'かんたん 🌱';
            }
        }
        switch (this.level) {
            case 1: return 'かんたん 🌱';
            case 2: return 'ふつう ⚡';
            case 3: return 'むずかしい 🔥';
            default: return 'かんたん 🌱';
        }
    }

    /**
     * Reset for a new stage.
     */
    resetStage() {
        this.consecutiveCorrect = 0;
        this.usedProblems.clear();
    }

    /**
     * Reset combo counter (e.g. on timeout).
     */
    resetCombo() {
        this.consecutiveCorrect = 0;
    }

    /**
     * Full reset for new game.
     */
    resetAll() {
        this.level = 1;
        this.mode = 'subtract';
        this.totalCorrect = 0;
        this.totalAttempts = 0;
        this.consecutiveCorrect = 0;
        this.maxCombo = 0;
        this.recentResults = [];
        this.usedProblems.clear();
    }

    /**
     * Random integer between min and max (inclusive).
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
