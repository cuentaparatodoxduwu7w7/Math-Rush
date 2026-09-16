// ============================================================
// SOUND SERVICE - Web Audio API
// ============================================================
// Sistema de sonidos para el juego usando Web Audio API
// No requiere archivos externos ni servicios
// ============================================================

class SoundService {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Sonido de click básico
  click() {
    this.playTone(800, 0.1, 'sine', 0.2);
  }

  // Sonido de respuesta correcta
  correct() {
    this.playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.3), 200); // G5
  }

  // Sonido de respuesta incorrecta
  wrong() {
    this.playTone(200, 0.15, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(150, 0.2, 'sawtooth', 0.2), 150);
  }

  // Sonido de cuenta regresiva
  countdown() {
    this.playTone(440, 0.15, 'square', 0.2);
  }

  // Sonido de inicio (RUSH!)
  rush() {
    this.playTone(523.25, 0.1, 'square', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.3), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.1, 'square', 0.3), 200); // G5
    setTimeout(() => this.playTone(1046.50, 0.2, 'square', 0.3), 300); // C6
  }

  // Sonido de victoria
  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine', 0.3), i * 150);
    });
  }

  // Sonido de level up
  levelUp() {
    const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'triangle', 0.3), i * 100);
    });
  }

  // Sonido de combo
  combo(level: number) {
    const baseFreq = 400 + (level * 50);
    this.playTone(baseFreq, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(baseFreq * 1.5, 0.1, 'sine', 0.25), 80);
  }

  // Activar/desactivar sonidos
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Instancia global
export const soundService = new SoundService();
