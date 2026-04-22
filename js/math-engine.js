/**
 * math-engine.js - Problem generator (add / subtract / multiply / divide)
 */

class MathEngine {
    constructor() {
        this.level = 1; // 1: easy, 2: medium, 3: hard
        this.mode = 'subtract';
        this.totalCorrect = 0;
        this.totalAttempts = 0;
        this.consecutiveCorrect = 0;
        this.maxCombo = 0;
        this.recentResults = [];
        this.usedProblems = new Set();
    }

    generateProblem() {
        switch (this.mode) {
            case 'add':      return this.generateAddProblem();
            case 'multiply': return this.generateMultiplyProblem();
            case 'divide':   return this.generateDivideProblem();
            default:         return this.generateSubtractProblem();
        }
    }

    generateAddProblem() {
        let a, b, attempts = 0;
        do {
            switch (this.level) {
                case 1: // かんたん: 繰り上がりなし (答え10以内)
                    a = this.randomInt(1, 9);
                    b = this.randomInt(1, Math.min(9, 10 - a));
                    break;
                case 2: // ふつう: 繰り上がりあり (答え11〜18)
                    a = this.randomInt(2, 9);
                    b = this.randomInt(Math.max(2, 11 - a), 9);
                    break;
                case 3: // むずかしい: 2けた+1けた or 2けた+2けた
                    a = this.randomInt(11, 59);
                    b = this.randomInt(2, 29);
                    break;
                default:
                    a = this.randomInt(1, 9);
                    b = this.randomInt(1, 9);
            }
            attempts++;
        } while (this.usedProblems.has(`a${a}+${b}`) && attempts < 50);

        this.usedProblems.add(`a${a}+${b}`);
        if (this.usedProblems.size > 200) this.usedProblems.clear();
        return { a, b, answer: a + b, op: '＋' };
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
                case 1: // かんたん: 2〜5のだん × 1〜5
                    a = this.randomInt(2, 5);
                    b = this.randomInt(1, 5);
                    break;
                case 2: // ふつう: 2〜9のだん × 1〜9
                    a = this.randomInt(2, 9);
                    b = this.randomInt(1, 9);
                    break;
                case 3: // むずかしい: 6〜9のだん × 6〜9
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

    generateDivideProblem() {
        let divisor, quotient, attempts = 0;
        do {
            switch (this.level) {
                case 1: // かんたん: 2〜5のだん逆
                    divisor  = this.randomInt(2, 5);
                    quotient = this.randomInt(1, 5);
                    break;
                case 2: // ふつう: 2〜9のだん逆
                    divisor  = this.randomInt(2, 9);
                    quotient = this.randomInt(1, 9);
                    break;
                case 3: // むずかしい: 6〜9のだん逆
                    divisor  = this.randomInt(6, 9);
                    quotient = this.randomInt(6, 9);
                    break;
                default:
                    divisor  = this.randomInt(2, 5);
                    quotient = this.randomInt(1, 5);
            }
            attempts++;
        } while (this.usedProblems.has(`d${divisor}x${quotient}`) && attempts < 50);

        this.usedProblems.add(`d${divisor}x${quotient}`);
        if (this.usedProblems.size > 200) this.usedProblems.clear();
        const dividend = divisor * quotient;
        return { a: dividend, b: divisor, answer: quotient, op: '÷' };
    }

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

        this.recentResults.push(isCorrect);
        if (this.recentResults.length > 10) this.recentResults.shift();

        const levelChanged = this.adjustDifficulty();
        return { isCorrect, combo: this.consecutiveCorrect, levelChanged, newLevel: this.level };
    }

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

    getAccuracy() {
        if (this.totalAttempts === 0) return 0;
        return Math.round((this.totalCorrect / this.totalAttempts) * 100);
    }

    getLevelName() {
        const names = {
            add: {
                1: 'かんたん 🌱 (10以内)',
                2: 'ふつう ⚡ (くりあがり)',
                3: 'むずかしい 🔥 (2けた)',
            },
            subtract: {
                1: 'かんたん 🌱',
                2: 'ふつう ⚡ (くりさがり)',
                3: 'むずかしい 🔥',
            },
            multiply: {
                1: 'かんたん 🌱 (2〜5のだん)',
                2: 'ふつう ⚡ (2〜9のだん)',
                3: 'むずかしい 🔥 (6〜9のだん)',
            },
            divide: {
                1: 'かんたん 🌱 (2〜5のだん)',
                2: 'ふつう ⚡ (2〜9のだん)',
                3: 'むずかしい 🔥 (6〜9のだん)',
            },
        };
        return (names[this.mode] || names.subtract)[this.level] || 'かんたん 🌱';
    }

    resetStage() {
        this.consecutiveCorrect = 0;
        this.usedProblems.clear();
    }

    resetCombo() {
        this.consecutiveCorrect = 0;
    }

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

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
