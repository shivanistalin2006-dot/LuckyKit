// escape/systems/AudioEngine.js
import { audioManager } from '../../audio/audioManager.js';
import { settingsManager } from '../core/SettingsManager.js';

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.droneOsc = null;
        this.droneGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    isMuted() {
        try {
            return audioManager?.isMuted || localStorage.getItem('luckykit_muted') === 'true';
        } catch(e) {
            return false;
        }
    }

    getMasterVolume() {
        return settingsManager.get('masterVolume') * settingsManager.get('sfxVolume');
    }

    startAmbientDrone() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx || this.droneOsc) return;

        try {
            this.droneOsc = this.ctx.createOscillator();
            this.droneGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            this.droneOsc.type = 'sawtooth';
            this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(120, this.ctx.currentTime);

            const vol = 0.04 * settingsManager.get('masterVolume') * settingsManager.get('ambientVolume');
            this.droneGain.gain.setValueAtTime(vol, this.ctx.currentTime);

            this.droneOsc.connect(filter);
            filter.connect(this.droneGain);
            this.droneGain.connect(this.ctx.destination);

            this.droneOsc.start();
        } catch(e) {}
    }

    stopAmbientDrone() {
        if (this.droneOsc) {
            try {
                this.droneOsc.stop();
                this.droneOsc.disconnect();
            } catch(e) {}
            this.droneOsc = null;
        }
    }

    playFootstep(surface = 'tile', isSneak = false) {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(surface === 'metal' ? 180 : 80, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

            const vol = (isSneak ? 0.015 : 0.05) * this.getMasterVolume();
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.08);
        } catch(e) {}
    }

    playHeartbeat(proximityFactor) {
        if (this.isMuted() || proximityFactor <= 0.05) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

            const vol = Math.min(0.25, 0.04 + proximityFactor * 0.2) * this.getMasterVolume();
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch(e) {}
    }

    playMonsterRoar() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc1.type = 'sawtooth';
            osc2.type = 'square';
            osc1.frequency.setValueAtTime(140, now);
            osc1.frequency.linearRampToValueAtTime(60, now + 0.7);
            osc2.frequency.setValueAtTime(145, now);
            osc2.frequency.linearRampToValueAtTime(55, now + 0.7);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, now);
            filter.Q.setValueAtTime(3, now);

            gain.gain.setValueAtTime(0.22 * this.getMasterVolume(), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.7);
            osc2.stop(now + 0.7);
        } catch(e) {}
    }

    playJumpscareStinger() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [220, 311.13, 440, 622.25, 880].forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.12 * this.getMasterVolume(), now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 1.2);
            });
        } catch(e) {}
    }

    playItemPickup() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            gain.gain.setValueAtTime(0.08 * this.getMasterVolume(), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch(e) {}
    }

    playDoorCreak() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.linearRampToValueAtTime(320, now + 0.25);
            gain.gain.setValueAtTime(0.04 * this.getMasterVolume(), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } catch(e) {}
    }

    playKeypadBeep() {
        if (this.isMuted()) return;
        this.init();
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.05 * this.getMasterVolume(), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch(e) {}
    }
}

export const audioEngine = new AudioEngine();
