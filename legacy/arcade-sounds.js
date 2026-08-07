// LuckyKit Premium Arcade Web Audio Synthesizer
(function () {
    let audioCtx = null;
    let bgMusicNode = null;
    let isPlayingBgMusic = false;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    const ArcadeSounds = {
        playClick() {
            if (window.ArcadeCore && window.ArcadeCore.state.muted) return;
            try {
                const ctx = getAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } catch (e) {
                console.error("Audio synthesis error:", e);
            }
        },

        playSelect() {
            if (window.ArcadeCore && window.ArcadeCore.state.muted) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;
                
                // Play a quick upward chime (2 notes)
                const playNote = (freq, delay, duration) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    gain.gain.setValueAtTime(0.15, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + duration);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + duration);
                };

                playNote(523.25, 0, 0.15); // C5
                playNote(659.25, 0.08, 0.2); // E5
            } catch (e) {
                console.error(e);
            }
        },

        playWin() {
            if (window.ArcadeCore && window.ArcadeCore.state.muted) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;

                const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50]; // C4, E4, G4, C5, E5, C6
                notes.forEach((freq, idx) => {
                    const delay = idx * 0.08;
                    const duration = 0.35;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = "square";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    
                    gain.gain.setValueAtTime(0.1, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.005, now + delay + duration);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(now + delay);
                    osc.stop(now + delay + duration);
                });
            } catch (e) {
                console.error(e);
            }
        },

        playLose() {
            if (window.ArcadeCore && window.ArcadeCore.state.muted) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.6);

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(now + 0.6);
            } catch (e) {
                console.error(e);
            }
        },

        playLevelUp() {
            if (window.ArcadeCore && window.ArcadeCore.state.muted) return;
            try {
                const ctx = getAudioContext();
                const now = ctx.currentTime;
                
                // Energetic synth sweep + chord
                const sweep = ctx.createOscillator();
                const sweepGain = ctx.createGain();
                sweep.type = "sawtooth";
                sweep.frequency.setValueAtTime(150, now);
                sweep.frequency.exponentialRampToValueAtTime(800, now + 0.4);
                sweepGain.gain.setValueAtTime(0.1, now);
                sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                sweep.connect(sweepGain);
                sweepGain.connect(ctx.destination);
                sweep.start();
                sweep.stop(now + 0.4);

                const chord = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
                chord.forEach((freq, idx) => {
                    const delay = 0.2 + idx * 0.05;
                    const duration = 0.6;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    gain.gain.setValueAtTime(0.15, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.005, now + delay + duration);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + duration);
                });
            } catch (e) {
                console.error(e);
            }
        },

        startBgMusic() {
            if (isPlayingBgMusic) return;
            
            // Periodically check if muted
            const playLoop = () => {
                if (!isPlayingBgMusic) return;
                if (window.ArcadeCore && window.ArcadeCore.state.muted) {
                    setTimeout(playLoop, 1000);
                    return;
                }

                try {
                    const ctx = getAudioContext();
                    const now = ctx.currentTime;

                    // Simple 8-bit retro bass loop melody
                    // C3, G3, A3, F3, C3, G3, F3, G3
                    const melody = [130.81, 196.00, 220.00, 174.61, 130.81, 196.00, 174.61, 196.00];
                    const tempo = 0.4; // duration of note in seconds

                    melody.forEach((freq, index) => {
                        const start = now + index * tempo;
                        const duration = tempo * 0.85;
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();

                        osc.type = "triangle";
                        osc.frequency.setValueAtTime(freq, start);
                        
                        gain.gain.setValueAtTime(0.03, start);
                        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

                        osc.connect(gain);
                        gain.connect(ctx.destination);

                        osc.start(start);
                        osc.stop(start + duration);
                    });

                    setTimeout(playLoop, melody.length * tempo * 1000);
                } catch(e) {
                    console.error("BG music synthesis error: ", e);
                    setTimeout(playLoop, 2000);
                }
            };

            isPlayingBgMusic = true;
            playLoop();
        },

        stopBgMusic() {
            isPlayingBgMusic = false;
        }
    };

    // Auto-setup music triggering on user actions (due to browser policy)
    const initAudioTriggers = () => {
        const startAudio = () => {
            getAudioContext();
            ArcadeSounds.startBgMusic();
            document.removeEventListener("click", startAudio);
            document.removeEventListener("keydown", startAudio);
        };
        document.addEventListener("click", startAudio);
        document.addEventListener("keydown", startAudio);
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initAudioTriggers();
    } else {
        document.addEventListener("DOMContentLoaded", initAudioTriggers);
    }

    window.ArcadeSounds = ArcadeSounds;
})();
