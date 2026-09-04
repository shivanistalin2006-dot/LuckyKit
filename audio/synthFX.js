/**
 * SynthFX - Procedural 8-bit Retro Web Audio Synthesizer
 * Zero-dependency procedural arcade sound effects.
 */
class SynthFX {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    getContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    setMuted(muted) {
        this.isMuted = !!muted;
    }

    /** Coin Collect chime (two ascending pure tones) */
    playCoin() {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {}
    }

    /** Laser shoot (descending frequency sweep) */
    playLaser() {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    /** Powerup Surge (arpeggio) */
    playPowerup() {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const notes = [330, 392, 659, 523, 587, 784];

            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const start = now + (idx * 0.04);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, start);
                
                gain.gain.setValueAtTime(0.1, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(start);
                osc.stop(start + 0.08);
            });
        } catch (e) {}
    }

    /** Victory fanfare chord */
    playVictory() {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const triad = [523.25, 659.25, 783.99, 1046.50]; // C Major

            triad.forEach((freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.6);
            });
        } catch (e) {}
    }
}

export const synthFX = new SynthFX();
