/**
 * ROBOT MATH LAB - SOUND EFFECTS ENGINE (Web Audio API Synthesizer)
 * Zero external audio files. 100% offline, lightweight, and engaging for kids.
 */

const SoundFX = {
  ctx: null,
  isMuted: localStorage.getItem('rml_sound_muted') === 'true',

  init() {
    // Lazy initialize AudioContext upon first user interaction to comply with browser autoplay policies
    const unlockAudio = () => {
      this.ensureContext();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('rml_sound_muted', this.isMuted);
    window.dispatchEvent(new CustomEvent('soundMuteChanged', { detail: { isMuted: this.isMuted } }));
    return this.isMuted;
  },

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {}); // Silently handle resume failures
    }
  },

  /**
   * Cheerful "Ting" sound for correct selections / data drops
   */
  playTing() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  },

  /**
   * Playful "Pop" sound for buttons and chips
   */
  playPop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  },

  /**
   * Gentle "Oops" sound for wrong attempts (non-punitive)
   */
  playOops() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  },

  /**
   * Grand Victory Fanfare for completing a lesson or step
   */
  playVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.4 }  // C6
    ];

    let t = this.ctx.currentTime;
    notes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d * 0.9;
    });
  },

  /**
   * Retro 8-bit blip for option navigation
   */
  playRetroSelect() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.04);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  },

  /**
   * Retro 8-bit game start chime / fanfare
   */
  playRetroStart() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const notes = [
      { f: 523.25, d: 0.07 }, // C5
      { f: 659.25, d: 0.07 }, // E5
      { f: 783.99, d: 0.07 }, // G5
      { f: 1046.50, d: 0.22 } // C6
    ];
    let t = this.ctx.currentTime;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d * 0.85;
    });
  }
};

SoundFX.init();
window.SoundFX = SoundFX;
