let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = 'player'; // 'player' or 'ai'
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };

const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const playerBtn = document.getElementById('playerBtn');
const aiBtn = document.getElementById('aiBtn');
const popup = document.getElementById('resultPopup');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');

// Sound System - LoFi Style
function playSound(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'move') {
      // Player move - lofi "tic" (higher, crisp)
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(420, audioContext.currentTime + 0.09);
      
      filter.type = 'lowpass';
      filter.frequency.value = 2400;
      filter.Q.value = 2.5;
      
      gain.gain.setValueAtTime(0.25, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + 0.09);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.09);
      
    } else if (type === 'opponent') {
      // Opponent move - lofi "tak" (lower, rounder)
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, audioContext.currentTime + 0.22);
      
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      filter.Q.value = 2.2;
      
      gain.gain.setValueAtTime(0.28, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + 0.22);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.22);
      
    } else if (type === 'win') {
      // Victory - gentle lofi melody
      const notes = [
        { freq: 392, duration: 0.25 },  // G4
        { freq: 494, duration: 0.25 },  // B4
        { freq: 523, duration: 0.25 },  // C5
        { freq: 659, duration: 0.4 }    // E5
      ];
      
      let delay = 0;
      notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 2200;
        filter.Q.value = 2;
        
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + delay + note.duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + note.duration);
        
        delay += note.duration - 0.08;
      });
      
    } else if (type === 'lose') {
      // Defeat - melancholic lofi descent
      const notes = [
        { freq: 349, duration: 0.25 },  // F4
        { freq: 330, duration: 0.25 },  // E4
        { freq: 294, duration: 0.25 },  // D4
        { freq: 262, duration: 0.4 }    // C4
      ];
      
      let delay = 0;
      notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 2;
        
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + delay + note.duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + note.duration);
        
        delay += note.duration - 0.08;
      });
    }
  } catch (e) {
    console.log('Audio not available');
  }
}

// Initialize Game
function initGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  status.textContent = "Player X's Turn";
  cells.forEach((cell, index) => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'winner', 'pop', 'disabled');
  });
}

// Check Winner
function checkWinner() {
  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes('') ? null : 'draw';
}

// Highlight Winner
function highlightWinner(winner) {
  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === winner) {
      cells[a].classList.add('winner');
      cells[b].classList.add('winner');
      cells[c].classList.add('winner');
    }
  }
}

// Show Popup
function showPopup(emoji, title, msg) {
  document.getElementById('emoji').textContent = emoji;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultMsg').textContent = msg;
  popup.classList.add('show');
}

function closePopup() {
  popup.classList.remove('show');
}

// AI Logic
function getAIMove() {
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      if (checkWinner() === 'O') {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }

  // Try to block
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'X';
      if (checkWinner() === 'X') {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }

  // Random move
  const empty = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

// AI Turn
function aiMove() {
  if (!gameActive || currentPlayer !== 'O') return;
  
  setTimeout(() => {
    const move = getAIMove();
    board[move] = 'O';
    cells[move].textContent = 'O';
    cells[move].classList.add('o', 'pop');
    playSound('opponent');

    const winner = checkWinner();
    if (winner) {
      gameActive = false;
      if (winner === 'O') {
        status.textContent = '🤖 AI Wins!';
        playSound('lose');
        showPopup('😢', 'Defeat!', 'AI Outsmarted You!');
        scores.O++;
      } else {
        status.textContent = "🤝 It's a Draw!";
        playSound('win');
        showPopup('🤝', "It's a Draw!", 'Well Played!');
        scores.draw++;
      }
      updateScore();
    } else {
      currentPlayer = 'X';
      status.textContent = "Your Turn (X)";
    }
  }, 500);
}

// Cell Click Handler
cells.forEach((cell, index) => {
  cell.addEventListener('click', () => {
    if (!gameActive || board[index] !== '' || (gameMode === 'ai' && currentPlayer !== 'X')) {
      return;
    }

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase(), 'pop');
    playSound('move');

    const winner = checkWinner();
    if (winner) {
      gameActive = false;
      highlightWinner(winner);
      
      if (winner === 'draw') {
        status.textContent = "🤝 It's a Draw!";
        playSound('win');
        showPopup('🤝', "It's a Draw!", 'Well Played!');
        scores.draw++;
      } else {
        if (winner === 'X') {
          status.textContent = '✅ Player X Wins!';
          playSound('win');
          showPopup('🎉', 'Victory!', gameMode === 'ai' ? 'You Defeated AI!' : 'Player X Won!');
          scores.X++;
        } else {
          status.textContent = '✅ Player O Wins!';
          playSound('win');
          showPopup('🎉', 'Victory!', 'Player O Won!');
          scores.O++;
        }
      }
      updateScore();
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      status.textContent = gameMode === 'ai' 
        ? (currentPlayer === 'X' ? "Your Turn (X)" : "AI is thinking...")
        : `Player ${currentPlayer}'s Turn`;

      if (gameMode === 'ai' && currentPlayer === 'O') {
        aiMove();
      }
    }
  });
});

// Update Score
function updateScore() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

// Mode Selection
playerBtn.addEventListener('click', () => {
  gameMode = 'player';
  playerBtn.classList.add('active');
  aiBtn.classList.remove('active');
  initGame();
});

aiBtn.addEventListener('click', () => {
  gameMode = 'ai';
  aiBtn.classList.add('active');
  playerBtn.classList.remove('active');
  initGame();
  status.textContent = "Your Turn (X)";
});

// Reset Button
resetBtn.addEventListener('click', initGame);

// Load scores from localStorage
window.addEventListener('load', () => {
  const saved = localStorage.getItem('tictactoe_scores');
  if (saved) {
    scores = JSON.parse(saved);
    updateScore();
  }
});

// Save scores to localStorage
window.addEventListener('beforeunload', () => {
  localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
});
