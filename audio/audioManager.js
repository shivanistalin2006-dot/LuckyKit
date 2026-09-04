import { eventBus } from '../core/eventBus.js';

export class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.isPlayingBgMusic = false;
        this.isMuted = false;

        this.bindEvents();
        
        const initAudioTriggers = () => {
            this.getAudioContext();
            this.startBgMusic();
            document.removeEventListener("click", initAudioTriggers);
            document.removeEventListener("keydown", initAudioTriggers);
        };
        
        if (document.readyState === "complete" || document.readyState === "interactive") {
            document.addEventListener("click", initAudioTriggers);
            document.addEventListener("keydown", initAudioTriggers);
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                document.addEventListener("click", initAudioTriggers);
                document.addEventListener("keydown", initAudioTriggers);
            });
        }
    }

    bindEvents() {
        eventBus.on('COINS_EARNED', () => this.playCoin());
        eventBus.on('LEVEL_UP', () => this.playLevelUp());
        eventBus.on('MISSION_COMPLETE', () => this.playAchievement());
        eventBus.on('ACHIEVEMENT_UNLOCKED', () => this.playAchievement());
        eventBus.on('THEME_CHANGED', () => this.playThemeSwitch());
        
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.premium-card') || e.target.closest('.v2-btn')) {
                this.playClick();
            }
        });
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.glow-hover') || e.target.closest('.v2-card')) {
                this.playHover();
            }
        });
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.isMuted) {
            this.stopBgMusic();
        } else {
            this.startBgMusic();
        }
    }

    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }

    getAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    playHover() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {}
    }

    playClick() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {}
    }

    playSelect() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
    }

    playThemeSwitch() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    playWin() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            
            // Major chord progression (C Major -> F Major -> G Major -> C Major)
            const chords = [
                [261.63, 329.63, 392.00], // C
                [349.23, 440.00, 523.25], // F
                [392.00, 493.88, 587.33], // G
                [523.25, 659.25, 783.99]  // C High
            ];
            
            chords.forEach((chord, i) => {
                const delay = i * 0.25;
                const dur = 0.4;
                chord.forEach(freq => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    gain.gain.setValueAtTime(0.1, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.005, now + delay + dur);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + dur);
                });
            });
        } catch (e) {}
    }

    playGameOver() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.8);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.8);
        } catch (e) {}
    }

    playLose() {
        this.playGameOver();
    }

    playLevelUp() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            const sweep = ctx.createOscillator();
            const sweepGain = ctx.createGain();
            sweep.type = "square";
            sweep.frequency.setValueAtTime(300, now);
            sweep.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
            sweepGain.gain.setValueAtTime(0.1, now);
            sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            sweep.connect(sweepGain);
            sweepGain.connect(ctx.destination);
            sweep.start();
            sweep.stop(now + 0.5);
        } catch (e) {}
    }

    playTone(freq, type = "sine", duration = 0.1, vol = 0.1) {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    playAchievement() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            const playNote = (freq, delay, dur) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + delay);
                gain.gain.setValueAtTime(0.15, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.01, now + delay + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + dur);
            };
            playNote(523.25, 0, 0.2); // C5
            playNote(659.25, 0.15, 0.2); // E5
            playNote(783.99, 0.3, 0.4); // G5
        } catch (e) {}
    }

    playCrateOpen() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(800, now + 1.0);
            
            // Rumble effect
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(200, now);
            filter.frequency.linearRampToValueAtTime(2000, now + 1.0);
            
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.0);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.0);
            
            setTimeout(() => this.playWin(), 1000);
        } catch (e) {}
    }

    playCoin() {
        if (this.isMuted) return;
        try {
            const ctx = this.getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1046.50, now); // C6
            osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    }

    startBgMusic() {
        if (this.isPlayingBgMusic) return;
        
        const playLoop = () => {
            if (!this.isPlayingBgMusic) return;
            if (this.isMuted) {
                setTimeout(playLoop, 1000);
                return;
            }

            try {
                const ctx = this.getAudioContext();
                const now = ctx.currentTime;
                // Deeper, ambient cyberpunk synth drone
                const freq1 = 65.41; // C2
                const freq2 = 98.00; // G2
                const dur = 4.0;
                
                [freq1, freq2].forEach(freq => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();
                    
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(freq, now);
                    
                    filter.type = "lowpass";
                    filter.frequency.setValueAtTime(200, now);
                    filter.frequency.linearRampToValueAtTime(400, now + dur/2);
                    filter.frequency.linearRampToValueAtTime(200, now + dur);
                    
                    gain.gain.setValueAtTime(0.01, now);
                    gain.gain.linearRampToValueAtTime(0.03, now + dur/2);
                    gain.gain.linearRampToValueAtTime(0.01, now + dur);
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(now);
                    osc.stop(now + dur);
                });

                setTimeout(playLoop, dur * 1000);
            } catch(e) {
                setTimeout(playLoop, 2000);
            }
        };

        this.isPlayingBgMusic = true;
        playLoop();
    }

    stopBgMusic() {
        this.isPlayingBgMusic = false;
    }
}

export const audioManager = new AudioManager();
