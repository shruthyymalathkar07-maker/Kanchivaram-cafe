/**
 * Web Audio API Sound Chime Utility for Kanchivaram Café
 * Generates rich, hardware-independent synthesized bell & order chimes
 * Zero external audio assets required; immune to 404s or network latency.
 */

class SoundChimeService {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Resonant 3-tone service bell chime for incoming Swiggy / Zomato orders
   * Pitch: G5 (784Hz) -> C6 (1046.5Hz) -> E6 (1318.5Hz)
   */
  playOrderAlertChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 783.99, delay: 0.00, duration: 0.35, gain: 0.35 },  // G5
        { freq: 1046.50, delay: 0.16, duration: 0.45, gain: 0.45 }, // C6
        { freq: 1318.51, delay: 0.36, duration: 0.70, gain: 0.50 }  // E6
      ];

      notes.forEach(({ freq, delay, duration, gain: peakGain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Triangle oscillator gives warm brass / bell harmonic overtones
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        // Natural exponential decay envelope
        gainNode.gain.setValueAtTime(0.001, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(peakGain, now + delay + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    } catch (err) {
      console.warn('[SoundChime] Unable to play order chime:', err);
    }
  }

  /**
   * Quick confirmation tone when cashier accepts order / prints KOT
   */
  playOrderAcceptedTone() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18); // A6 upward chirp

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (err) {
      console.warn('[SoundChime] Tone play notice:', err);
    }
  }
}

export const chimeService = new SoundChimeService();
export const playOnlineOrderChime = () => chimeService.playOrderAlertChime();
export const playOrderAcceptedTone = () => chimeService.playOrderAcceptedTone();

// Automatically unlock and prime audio context on the first user interaction anywhere on the page
if (typeof window !== 'undefined') {
  const autoUnlockAudio = () => {
    try {
      const ctx = chimeService.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (e) {}
  };

  ['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, autoUnlockAudio, { passive: true });
  });
}
