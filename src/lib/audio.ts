/**
 * Web Audio API synthesizer for romantic sound effects & gentle background melody.
 * Works 100% offline without external audio files, completely reliable and zero latency!
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgOscillators: OscillatorNode[] = [];
  private bgGain: GainNode | null = null;
  private isBgPlaying: boolean = false;
  private bgTimer: number | null = null;

  constructor() {
    // Check saved mute preference
    const saved = localStorage.getItem('romantic_sound_muted');
    if (saved === 'true') {
      this.isMuted = true;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('romantic_sound_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopRomanticMusic();
    }
    return this.isMuted;
  }

  // Play a soft bell/chime note
  private playNote(frequency: number, duration: number, type: OscillatorType = 'sine', gainLevel = 0.15) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }

  // Message sent soft "pop"
  public playMessageSent() {
    if (this.isMuted) return;
    this.playNote(587.33, 0.12, 'sine', 0.12); // D5
    setTimeout(() => this.playNote(880, 0.18, 'sine', 0.15), 60); // A5
  }

  // Message received sweet harp chime
  public playMessageReceived() {
    if (this.isMuted) return;
    this.playNote(523.25, 0.15, 'sine', 0.12); // C5
    setTimeout(() => this.playNote(659.25, 0.15, 'sine', 0.12), 80); // E5
    setTimeout(() => this.playNote(783.99, 0.25, 'sine', 0.15), 160); // G5
  }

  // "Thinking of you" heart burst magic chime
  public playHeartBurst() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playNote(freq, 0.35, 'sine', 0.14);
      }, idx * 70);
    });
  }

  // Grand Romantic Celebration Fanfare on "YES"
  public playProposalCelebration() {
    if (this.isMuted) return;
    // Chime progression: C -> E -> G -> B -> high C octave with sparkling cadence
    const chord1 = [261.63, 329.63, 392.00, 523.25];
    const chord2 = [349.23, 440.00, 523.25, 698.46];
    const chord3 = [392.00, 493.88, 587.33, 783.99];
    const finalChord = [523.25, 659.25, 783.99, 1046.50];

    chord1.forEach(f => this.playNote(f, 0.5, 'triangle', 0.08));
    setTimeout(() => chord2.forEach(f => this.playNote(f, 0.5, 'triangle', 0.09)), 300);
    setTimeout(() => chord3.forEach(f => this.playNote(f, 0.6, 'triangle', 0.10)), 600);
    setTimeout(() => {
      finalChord.forEach(f => this.playNote(f, 1.2, 'sine', 0.12));
      // Sparkling high arpeggio
      [1046.50, 1174.66, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
        setTimeout(() => this.playNote(freq, 0.6, 'sine', 0.08), idx * 80);
      });
    }, 950);
  }

  // Soft romantic music box background lullaby
  public startRomanticMusic() {
    if (this.isMuted || this.isBgPlaying) return;
    this.isBgPlaying = true;

    const melodyNotes = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.00, 698.46,
      440.00, 523.25, 659.25, 523.25,
      392.00, 493.88, 587.33, 493.88
    ];
    let step = 0;

    const tick = () => {
      if (!this.isBgPlaying || this.isMuted) return;
      const freq = melodyNotes[step % melodyNotes.length];
      this.playNote(freq, 0.6, 'sine', 0.035);
      step++;
      this.bgTimer = window.setTimeout(tick, 750);
    };

    tick();
  }

  public stopRomanticMusic() {
    this.isBgPlaying = false;
    if (this.bgTimer) {
      clearTimeout(this.bgTimer);
      this.bgTimer = null;
    }
  }

  public isMusicPlaying(): boolean {
    return this.isBgPlaying;
  }

  // Haptic feedback helper
  public vibrate(pattern: number | number[] = 50) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored if device doesn't support or disallows
      }
    }
  }
}

export const sounds = new SoundController();
