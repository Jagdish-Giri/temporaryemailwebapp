// ===== WAIT FOR DOM =====
document.addEventListener('DOMContentLoaded', () => {
  // ===== BACKGROUND MUSIC =====
  let audioContext = null;
  let oscillators = [];
  let musicPlaying = false;
  const musicBtn = document.getElementById('musicBtn');
  const pausedIcon = '🎵✖';
  const playingIcon = '🎶';

  // Default to paused icon until playback starts
  musicBtn.textContent = pausedIcon;

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  function playBackgroundMusic() {
    try {
      const ctx = initAudioContext();
      musicPlaying = true;
      musicBtn.textContent = playingIcon;
      
      const notes = [262, 294, 330, 349]; // C, D, E, F
      let noteIndex = 0;
      
      function playLofiLoop() {
        if (!musicPlaying) return;
        
        const freq = notes[noteIndex % notes.length];
        const duration = 0.4;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 2;
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
        
        oscillators.push(osc);
        noteIndex++;
        
        if (musicPlaying) {
          setTimeout(playLofiLoop, duration * 1000 - 50);
        }
      }
      
      playLofiLoop();
    } catch (e) {
      console.log('Audio error:', e);
      musicPlaying = false;
      musicBtn.textContent = pausedIcon;
    }
  }

  function stopBackgroundMusic() {
    musicPlaying = false;
    musicBtn.textContent = pausedIcon;
    
    oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    oscillators = [];
  }

  musicBtn.addEventListener('click', () => {
    if (musicPlaying) {
      stopBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (musicPlaying) {
      stopBackgroundMusic();
    }
  });

});
