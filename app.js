const lists = {
    english: [
        { word: 'hand', img: 'word_hand.png', lang: 'en-US' },
        { word: 'fish', img: 'word_fish.png', lang: 'en-US' },
        { word: 'box', img: 'word_box.png', lang: 'en-US' },
        { word: 'socks', img: 'word_socks.png', lang: 'en-US' },
        { word: 'hive', img: 'word_hive.png', lang: 'en-US' },
        { word: 'jet', img: 'word_jet.png', lang: 'en-US' },
        { word: 'fire', img: 'word_fire.png', lang: 'en-US' },
        { word: 'book', img: 'word_book.png', lang: 'en-US' },
        { word: 'sail', img: 'word_sail.png', lang: 'en-US' },
        { word: 'jar', img: 'word_jar.png', lang: 'en-US' },
        { word: 'desk', img: 'word_desk.png', lang: 'en-US' }
    ],
    spanish: [
        { word: 'brazo', img: 'word_brazo.png', lang: 'es-ES' },
        { word: 'blando', img: 'word_blando.png', lang: 'es-ES' },
        { word: 'bloque', img: 'word_bloque.png', lang: 'es-ES' },
        { word: 'blanco', img: 'word_blanco.png', lang: 'es-ES' },
        { word: 'blusa', img: 'word_blusa.png', lang: 'es-ES' },
        { word: 'brillo', img: 'word_brillo.png', lang: 'es-ES' },
        { word: 'alambre', img: 'word_alambre.png', lang: 'es-ES' },
        { word: 'brocoli', img: 'word_brocoli.png', lang: 'es-ES' }
    ]
};

let currentList = [];
let currentWordIndex = 0;
let score = 0;
let currentAnswer = [];
let currentScrambled = [];
let currentMode = 'practice';
let studentName = '';
let studentSection = '';
let selectedListId = '';

// DOM Elements
const views = {
    menu: document.getElementById('main-menu'),
    game: document.getElementById('game-view'),
    score: document.getElementById('score-view'),
    leaderboard: document.getElementById('leaderboard-view')
};

const ui = {
    img: document.getElementById('word-image'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    scoreText: document.getElementById('score-text'),
    slotsContainer: document.getElementById('answer-slots'),
    bankContainer: document.getElementById('letter-bank'),
    checkBtn: document.getElementById('check-btn'),
    finalScore: document.getElementById('final-score'),
    soundBtn: document.getElementById('sound-btn')
};

// State Management
function setView(viewName) {
    Object.values(views).forEach(v => v.classList.remove('active-view'));
    views[viewName].classList.add('active-view');
}

function startGame(listId) {
    currentMode = document.querySelector('input[name="gameMode"]:checked').value;
    selectedListId = listId;

    if (currentMode === 'competitive') {
        document.getElementById('login-modal').classList.add('active');
    } else {
        startActualGame();
    }
}

function cancelLogin() {
    document.getElementById('login-modal').classList.remove('active');
}

function submitLoginAndStart() {
    const nameInput = document.getElementById('studentName').value.trim();
    const secInput = document.getElementById('studentSection').value;

    if (!nameInput || !secInput) {
        alert("Please enter your name and select a section.");
        return;
    }

    studentName = nameInput;
    studentSection = secInput;

    document.getElementById('login-modal').classList.remove('active');
    startActualGame();
}

function startActualGame() {
    currentList = [...lists[selectedListId]];
    // Optional: Shuffle list? Let's keep it sequential for now
    currentWordIndex = 0;
    score = 0;
    ui.scoreText.innerText = score;

    // Hide saving indicator naturally
    document.getElementById('saving-indicator').style.display = 'none';

    setView('game');
    loadWord();
}

function returnToMenu() {
    setView('menu');
}

async function loadWord() {
    if (currentWordIndex >= currentList.length) {
        showScore();
        return;
    }

    if (currentMode === 'test' || currentMode === 'competitive') {
        ui.scoreText.parentElement.style.display = 'none';
        ui.checkBtn.innerText = 'Submit ⏭️';
    } else {
        ui.scoreText.parentElement.style.display = 'flex';
        ui.checkBtn.innerText = 'Check ✨';
    }

    const currentItem = currentList[currentWordIndex];
    ui.img.src = `assets/images/${currentItem.img}`;

    ui.progressText.innerText = `${currentWordIndex + 1}/${currentList.length}`;
    ui.progressBar.style.setProperty('--progress', `${((currentWordIndex) / currentList.length) * 100}%`);

    currentAnswer = Array(currentItem.word.length).fill('');
    scrambleLetters(currentItem.word);

    renderBoard();

    // Auto play sound (with a tiny delay for effect)
    setTimeout(playWordSound, 500);
}

function scrambleLetters(word) {
    // Add some random letters based on length to make it slightly challenging
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    let letters = word.split('');
    // Add 2 random letters
    letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);

    // Shuffle Array
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    // Store as objects {id, letter, used}
    currentScrambled = letters.map((l, i) => ({ id: `L${i}`, letter: l, used: false }));
}

function renderBoard() {
    // Render slots
    ui.slotsContainer.innerHTML = '';
    currentAnswer.forEach((letterTuple, index) => {
        const slot = document.createElement('div');
        slot.className = `slot ${letterTuple ? 'filled' : ''}`;
        if (letterTuple) {
            slot.innerText = letterTuple.letter;
            slot.onclick = () => removeLetter(index);
        }
        ui.slotsContainer.appendChild(slot);
    });

    // Render bank
    ui.bankContainer.innerHTML = '';
    currentScrambled.forEach((item) => {
        const tile = document.createElement('div');
        tile.className = `letter-tile ${item.used ? 'used' : ''}`;
        tile.innerText = item.letter;
        tile.onclick = () => selectLetter(item.id);
        ui.bankContainer.appendChild(tile);
    });

    // Toggle check button
    const isFull = currentAnswer.every(l => l !== '');
    if (isFull) {
        ui.checkBtn.classList.add('active');
    } else {
        ui.checkBtn.classList.remove('active');
    }
}

function selectLetter(id) {
    const item = currentScrambled.find(i => i.id === id);
    if (item.used) return;

    // Find first empty slot
    const emptyIndex = currentAnswer.findIndex(l => l === '');
    if (emptyIndex === -1) return; // Full

    item.used = true;
    currentAnswer[emptyIndex] = item;

    ui.soundBtn.classList.remove('pulse'); // user started interacting
    renderBoard();
}

function removeLetter(slotIndex) {
    const item = currentAnswer[slotIndex];
    if (!item) return;

    // Mark as unused in bank
    const bankItem = currentScrambled.find(i => i.id === item.id);
    bankItem.used = false;

    // Clear slot
    currentAnswer[slotIndex] = '';

    ui.checkBtn.classList.remove('active');
    renderBoard();
}

function checkWord() {
    const currentItem = currentList[currentWordIndex];
    const attempt = currentAnswer.map(i => i.letter).join('');

    const slots = document.querySelectorAll('.slot');

    if (attempt === currentItem.word) {
        // Correct!
        score++;
        if (currentMode === 'practice') {
            ui.scoreText.innerText = score;
            playSound('success');

            slots.forEach(s => s.classList.add('success'));

            setTimeout(() => {
                currentWordIndex++;
                loadWord();
            }, 1200);
        } else {
            // Test mode
            currentWordIndex++;
            loadWord();
        }
    } else {
        // Incorrect
        if (currentMode === 'practice') {
            playSound('error');
            slots.forEach(s => {
                s.classList.remove('shake');
                void s.offsetWidth; // trigger reflow
                s.classList.add('shake');
            });
        } else {
            // Test mode
            currentWordIndex++;
            loadWord();
        }
    }
}

function playWordSound() {
    const currentItem = currentList[currentWordIndex];
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentItem.word);
        utterance.lang = currentItem.lang;
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
    ui.soundBtn.classList.remove('pulse');
}

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (type === 'success') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'error') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) {
        console.log("Audio API not supported");
    }
}

function showScore() {
    ui.progressBar.style.setProperty('--progress', `100%`);
    setView('score');
    ui.finalScore.innerText = `${score}/${currentList.length}`;

    // Fun confetti
    triggerConfetti();

    if (currentMode === 'competitive') {
        saveScore();
    }
}

async function saveScore() {
    const indicator = document.getElementById('saving-indicator');
    indicator.style.display = 'block';
    indicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving score...';
    indicator.style.color = 'var(--primary)';

    const payload = {
        name: studentName,
        section: studentSection,
        list: selectedListId,
        score: score,
        total: currentList.length
    };

    try {
        // ACTUAL deployed Apps Script Web App URL
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbymB8dgIZOoVGaRU8b2UhPNndPSDyADTkKe8CrXDXKLT1TKf8NumCmdic9wV8sSfFmYHw/exec';

        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Avoids CORS preflight block for simple append tasks
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Since no-cors doesn't return readable response body, we assume success
        indicator.innerHTML = '<i class="fa-solid fa-check"></i> Score saved successfully!';
        indicator.style.color = 'var(--success)';

    } catch (e) {
        indicator.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error saving score.';
        indicator.style.color = 'var(--danger)';
        console.error("Save error:", e);
    }
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    const colors = ['#f490a6', '#5c6ac4', '#4cd964', '#ffeb3b'];

    for (let i = 0; i < 50; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';
        conf.style.width = '10px';
        conf.style.height = '10px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px';
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';

        container.appendChild(conf);

        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.5;

        conf.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            easing: 'cubic-bezier(.37,0,.63,1)',
            fill: 'forwards'
        });
    }
}

function showLeaderboard() {
    setView('leaderboard');
    loadLeaderboard();
}

async function loadLeaderboard() {
    const loading = document.getElementById('leaderboard-loading');
    const list = document.getElementById('leaderboard-list');

    loading.style.display = 'block';
    list.style.display = 'none';
    list.innerHTML = '';

    // ACTUAL url for the leaderboard
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbymB8dgIZOoVGaRU8b2UhPNndPSDyADTkKe8CrXDXKLT1TKf8NumCmdic9wV8sSfFmYHw/exec';
    if (scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        loading.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please configure the Apps Script URL in app.js';
        return;
    }

    try {
        const response = await fetch(scriptUrl);
        const data = await response.json();

        loading.style.display = 'none';
        list.style.display = 'block';

        if (data.status === 'success' && data.leaderboard && data.leaderboard.length > 0) {
            data.leaderboard.forEach((entry, index) => {
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                li.innerHTML = `
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-section">${entry.section}</span>
                    <span class="leaderboard-score">${entry.score}/${entry.total}</span>
                `;
                list.appendChild(li);
            });
        } else {
            list.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No scores yet!</p>';
        }
    } catch (e) {
        loading.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error loading leaderboard.';
        console.error("Load error:", e);
    }
}
