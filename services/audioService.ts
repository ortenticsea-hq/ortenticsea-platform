
/**
 * AudioService provides high-performance, synthesized sound effects 
 * for UI interactions, avoiding the overhead of external assets.
 */
export const AudioService = {
  /**
   * Plays a subtle, premium "blip" sound to confirm successful item addition.
   */
  playAddToCart: () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      // Sound signature: A short, high-pitched ascending sine wave for "success"
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(900, context.currentTime + 0.1);

      // Volume envelope: Sharp attack, fast decay to prevent clipping and "tail" noise
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);

      // Clean up context after playback
      setTimeout(() => {
        if (context.state !== 'closed') {
          context.close();
        }
      }, 200);
    } catch (error) {
      // Audio failures should never break the primary application flow
      console.warn('Audio feedback suppressed:', error);
    }
  }
};
