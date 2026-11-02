// Play a friendly two-tone notice beep for new due reminders.
export const playReminderSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const playBeep = (time, pitch) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.value = pitch;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
      osc.start(time);
      osc.stop(time + 0.3);
    };

    const now = audioContext.currentTime;
    playBeep(now, 587.33); // D5
    playBeep(now + 0.15, 880); // A5
  } catch (e) {
    console.warn('Audio Context failed to initialize', e);
  }
};
