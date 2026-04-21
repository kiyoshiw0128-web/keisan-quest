/**
 * effects.js - Visual effects: particles, screen shake, flashes, damage numbers
 */

class EffectsManager {
    constructor() {
        this.container = document.getElementById('particles');
        this.gameContainer = document.getElementById('game-container');
    }

    // --- Particle System ---

    /**
     * Spawn particles from a point.
     * @param {number} x - Center x
     * @param {number} y - Center y
     * @param {string} color - CSS color
     * @param {number} count - Number of particles
     * @param {object} opts - Extra options
     */
    spawnParticles(x, y, color, count = 12, opts = {}) {
        const { size = 6, speed = 3, lifetime = 800, gravity = true } = opts;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = `${size + Math.random() * size}px`;
            particle.style.height = `${size + Math.random() * size}px`;
            particle.style.background = color;
            particle.style.boxShadow = `0 0 ${size}px ${color}`;
            this.container.appendChild(particle);

            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const velocity = speed + Math.random() * speed;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - (gravity ? 2 : 0);

            this.animateParticle(particle, vx, vy, lifetime, gravity);
        }
    }

    animateParticle(el, vx, vy, lifetime, gravity) {
        let x = 0, y = 0, opacity = 1;
        const startTime = performance.now();
        const gravityForce = gravity ? 0.15 : 0;

        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = elapsed / lifetime;

            if (progress >= 1) {
                el.remove();
                return;
            }

            x += vx;
            y += vy;
            vy += gravityForce;
            opacity = 1 - progress;

            el.style.transform = `translate(${x}px, ${y}px)`;
            el.style.opacity = opacity;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Correct answer particle burst - golden/cyan sparkles.
     */
    correctEffect(element) {
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - containerRect.left;
        const cy = rect.top + rect.height / 2 - containerRect.top;

        this.spawnParticles(cx, cy, '#ffd700', 10, { size: 5, speed: 4 });
        this.spawnParticles(cx, cy, '#58d6f0', 6, { size: 4, speed: 3 });
        this.flashScreen('correct');
    }

    /**
     * Wrong answer effect - red shake.
     */
    wrongEffect() {
        this.screenShake();
        this.flashScreen('wrong');
    }

    /**
     * Monster defeat explosion.
     */
    defeatEffect(element) {
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - containerRect.left;
        const cy = rect.top + rect.height / 2 - containerRect.top;

        // Big explosion
        this.spawnParticles(cx, cy, '#ffd700', 20, { size: 8, speed: 6, lifetime: 1200 });
        this.spawnParticles(cx, cy, '#ff6b35', 15, { size: 6, speed: 5, lifetime: 1000 });
        this.spawnParticles(cx, cy, '#58d6f0', 10, { size: 5, speed: 4, lifetime: 900 });
    }

    /**
     * Victory celebration - confetti.
     */
    victoryCelebration() {
        const colors = ['#ffd700', '#58d6f0', '#e06c9f', '#4caf50', '#ff9800', '#c678dd'];
        const w = this.container.clientWidth;

        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const x = Math.random() * w;
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.spawnParticles(x, -10, color, 3, {
                    size: 6,
                    speed: 2,
                    lifetime: 1500,
                    gravity: true,
                });
            }, i * 60);
        }
    }

    // --- Screen Effects ---

    screenShake() {
        this.gameContainer.classList.add('shake');
        setTimeout(() => this.gameContainer.classList.remove('shake'), 400);
    }

    flashScreen(type) {
        const flash = document.createElement('div');
        flash.className = `flash-overlay flash-${type}`;
        this.gameContainer.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    // --- Damage Numbers ---

    showDamageNumber(element, damage, isPlayer) {
        const rect = element.getBoundingClientRect();
        const containerRect = this.gameContainer.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - containerRect.left;
        const y = rect.top - containerRect.top;

        const dmgEl = document.createElement('div');
        dmgEl.className = `damage-number ${isPlayer ? 'player-dmg' : 'monster-dmg'}`;
        dmgEl.textContent = `-${damage}`;
        dmgEl.style.left = `${x}px`;
        dmgEl.style.top = `${y}px`;
        this.gameContainer.appendChild(dmgEl);

        setTimeout(() => dmgEl.remove(), 1000);
    }

    /**
     * Show a slash effect on an element.
     */
    showSlash(element) {
        const rect = element.getBoundingClientRect();
        const containerRect = this.gameContainer.getBoundingClientRect();

        const slash = document.createElement('div');
        slash.className = 'slash-effect';
        slash.style.left = `${rect.left + rect.width / 2 - 40 - containerRect.left}px`;
        slash.style.top = `${rect.top + rect.height / 2 - 40 - containerRect.top}px`;
        this.gameContainer.appendChild(slash);

        setTimeout(() => slash.remove(), 500);
    }

    // --- Stars Background ---

    createStars(container, count = 60) {
        const el = document.getElementById(container);
        if (!el) return;
        el.innerHTML = '';
        const w = el.clientWidth || 500;
        const h = el.clientHeight || 800;

        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * w}px`;
            star.style.top = `${Math.random() * h}px`;
            star.style.width = `${1 + Math.random() * 2}px`;
            star.style.height = star.style.width;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${2 + Math.random() * 3}s`;
            el.appendChild(star);
        }
    }

    // --- Floating Blocks for Title Screen ---

    createFloatingBlocks() {
        const container = document.getElementById('floating-blocks');
        if (!container) return;
        container.innerHTML = '';
        const types = ['grass', 'dirt', 'stone'];

        for (let i = 0; i < 15; i++) {
            const block = document.createElement('div');
            const type = types[Math.floor(Math.random() * types.length)];
            block.className = `floating-block floating-block--${type}`;
            block.style.left = `${Math.random() * 90}%`;
            block.style.top = `${10 + Math.random() * 70}%`;
            block.style.animationDelay = `${Math.random() * 6}s`;
            block.style.animationDuration = `${4 + Math.random() * 4}s`;
            block.style.opacity = 0.15 + Math.random() * 0.25;
            block.style.width = `${16 + Math.random() * 16}px`;
            block.style.height = block.style.width;
            container.appendChild(block);
        }
    }
}

// --- Sound Manager ---

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, duration, type = 'square', volume = 0.12) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Silently fail
        }
    }

    playCorrect() {
        this.ensureContext();
        this.playTone(523, 0.1); // C5
        setTimeout(() => this.playTone(659, 0.1), 80); // E5
        setTimeout(() => this.playTone(784, 0.15), 160); // G5
    }

    playWrong() {
        this.ensureContext();
        this.playTone(200, 0.25, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(150, 0.3, 'sawtooth', 0.1), 120);
    }

    playButtonPress() {
        this.ensureContext();
        this.playTone(440, 0.05, 'square', 0.06);
    }

    playVictory() {
        this.ensureContext();
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square', 0.1), i * 150);
        });
    }

    playDefeat() {
        this.ensureContext();
        const notes = [392, 330, 262, 196]; // G4, E4, C4, G3
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.1), i * 200);
        });
    }

    playMonsterDefeat() {
        this.ensureContext();
        this.playTone(300, 0.1, 'sawtooth', 0.08);
        setTimeout(() => this.playTone(500, 0.15, 'square', 0.1), 100);
        setTimeout(() => this.playTone(800, 0.2, 'square', 0.08), 200);
    }

    playLevelUp() {
        this.ensureContext();
        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.12, 'square', 0.09), i * 80);
        });
    }
}
