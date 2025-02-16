const player = document.getElementById('player');
const mainWorld = document.getElementById('main-world');
const miniGameScreen = document.getElementById('mini-game-screen');
const miniGameBanner = document.getElementById('mini-game-banner');
const exitButton = document.getElementById('exit-button');
const miniGameAreas = document.querySelectorAll('.mini-game-area');
const hoverBanner = document.getElementById('hover-banner');
const archeryGame = document.getElementById('archery-game');
const runningGame = document.getElementById('running-game');
const obstacleGame = document.getElementById('obstacle-game');
const memoryGame = document.getElementById('memory-game');
const shootingGame = document.getElementById('shooting-game');

let playerX = 0;
let playerY = 0;
let currentGame = null;
let score = 0;
const beatenGames = new Set(); // Track beaten games
let hoveredArea = null; // Track which area is being hovered

// Initialize player position
player.style.top = `${playerY}px`;
player.style.left = `${playerX}px`;

// Player Movement
document.addEventListener('keydown', (event) => {
    const speed = 10;
    if (currentGame === null) {
        // Main world movement
        switch (event.key) {
            case 'ArrowUp':
                playerY -= speed;
                break;
            case 'ArrowDown':
                playerY += speed;
                break;
            case 'ArrowLeft':
                playerX -= speed;
                break;
            case 'ArrowRight':
                playerX += speed;
                break;
            case 'Enter':
                if (hoveredArea) {
                    startMiniGame(hoveredArea.dataset.game);
                }
                break;
        }
        player.style.top = `${playerY}px`;
        player.style.left = `${playerX}px`;

        // Check if player enters a mini-game area
        miniGameAreas.forEach(area => {
            const rect = area.getBoundingClientRect();
            if (
                playerX >= rect.left &&
                playerX <= rect.right &&
                playerY >= rect.top &&
                playerY <= rect.bottom &&
                !beatenGames.has(area.dataset.game) // Prevent replaying beaten games
            ) {
                hoveredArea = area; // Set the hovered area
                hoverBanner.style.display = 'block';
                hoverBanner.style.top = `${rect.top - 30}px`; // Position above the area
                hoverBanner.style.left = `${rect.left}px`;
            } else if (hoveredArea === area) {
                hoveredArea = null; // Clear the hovered area
                hoverBanner.style.display = 'none';
            }
        });
    } else if (currentGame === 'running') {
        // Typing race logic
    } else if (currentGame === 'obstacle') {
        // Maze movement
        const mazePlayer = document.getElementById('maze-player');
        let mazePlayerX = parseFloat(mazePlayer.style.left || 0);
        let mazePlayerY = parseFloat(mazePlayer.style.top || 0);
        switch (event.key) {
            case 'ArrowUp':
                mazePlayerY -= speed;
                break;
            case 'ArrowDown':
                mazePlayerY += speed;
                break;
            case 'ArrowLeft':
                mazePlayerX -= speed;
                break;
            case 'ArrowRight':
                mazePlayerX += speed;
                break;
        }
        mazePlayer.style.top = `${mazePlayerY}px`;
        mazePlayer.style.left = `${mazePlayerX}px`;

        // Check for collisions with walls
        const walls = document.querySelectorAll('.maze-wall');
        walls.forEach(wall => {
            const rect = wall.getBoundingClientRect();
            if (
                mazePlayerX + 50 >= rect.left &&
                mazePlayerX <= rect.right &&
                mazePlayerY + 50 >= rect.top &&
                mazePlayerY <= rect.bottom
            ) {
                alert('You hit a wall! Game over.');
                exitButton.click();
            }
        });
    }
});

// Start Mini-Game
function startMiniGame(game) {
    currentGame = game;
    mainWorld.style.display = 'none';
    miniGameScreen.style.display = 'block';
    miniGameBanner.textContent = `${game.charAt(0).toUpperCase() + game.slice(1)} Game`;
    miniGameBanner.style.display = 'block';
    exitButton.style.display = 'block';

    // Hide all mini-games
    document.querySelectorAll('.mini-game').forEach(game => game.style.display = 'none');

    // Show the selected mini-game
    document.getElementById(`${game}-game`).style.display = 'block';

    // Initialize the mini-game
    if (game === 'archery') {
        startArchery();
    } else if (game === 'running') {
        startTypingRace();
    } else if (game === 'obstacle') {
        startMaze();
    } else if (game === 'memory') {
        startMemory();
    } else if (game === 'shooting') {
        startShooting();
    }
}

// Exit Mini-Game
exitButton.addEventListener('click', () => {
    mainWorld.style.display = 'block';
    miniGameScreen.style.display = 'none';
    currentGame = null;
    score = 0; // Reset score
    player.style.display = 'block'; // Ensure main player is visible
    player.style.top = `${playerY}px`; // Reset player position
    player.style.left = `${playerX}px`;
});

// Mark a game as beaten
function markGameAsBeaten(game) {
    beatenGames.add(game);
    miniGameAreas.forEach(area => {
        if (area.dataset.game === game) {
            area.classList.add('beaten');
        }
    });
}

// Typing Race
function startTypingRace() {
    const typingPrompt = document.getElementById('typing-prompt');
    const typingInput = document.getElementById('typing-input');
    const typingTimer = document.getElementById('typing-timer');
    const typingScore = document.getElementById('typing-score');

    let timeLeft = 60;
    let wordsTyped = 0;

    // Generate random words
    const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew"];
    let promptText = "";
    for (let i = 0; i < 60; i++) {
        promptText += words[Math.floor(Math.random() * words.length)] + " ";
    }
    typingPrompt.textContent = promptText.trim();

    // Start timer
    const timer = setInterval(() => {
        timeLeft--;
        typingTimer.textContent = `Time: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (wordsTyped >= 60) {
                alert('You won the Typing Race!');
                markGameAsBeaten('running');
            } else {
                alert('Time’s up! You lost.');
            }
            exitButton.click();
        }
    }, 1000);

    // Track typing
    typingInput.addEventListener('input', () => {
        const typedText = typingInput.value.trim();
        const promptWords = promptText.split(" ");
        const typedWords = typedText.split(" ");

        wordsTyped = 0;
        for (let i = 0; i < typedWords.length; i++) {
            if (typedWords[i] === promptWords[i]) {
                wordsTyped++;
            }
        }
        typingScore.textContent = `Words: ${wordsTyped}/60`;
    });
}

// Maze
function startMaze() {
    const mazePlayer = document.getElementById('maze-player');
    mazePlayer.style.display = 'block';
    mazePlayer.style.top = '10px';
    mazePlayer.style.left = '10px';
}

// Memory Game
function startMemory() {
    const memoryGrid = document.getElementById('memory-grid');
    memoryGrid.innerHTML = "";

    const cards = [];
    for (let i = 1; i <= 12; i++) {
        cards.push(i, i); // Pairs of cards
    }

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);

    // Create cards
    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.value = value;
        card.textContent = "?"; // Initially hidden
        card.addEventListener('click', () => flipCard(card));
        memoryGrid.appendChild(card);
    });

    let flippedCards = [];
    let matchedPairs = 0;

    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            card.textContent = card.dataset.value;
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                const [card1, card2] = flippedCards;
                if (card1.dataset.value === card2.dataset.value) {
                    matchedPairs++;
                    if (matchedPairs === 12) {
                        alert('You won the Memory Game!');
                        markGameAsBeaten('memory');
                        exitButton.click();
                    }
                } else {
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        card1.textContent = "?";
                        card2.textContent = "?";
                    }, 1000);
                }
                flippedCards = [];
            }
        }
    }
}

// Shooting Gallery
function startShooting() {
    const shootingPlayer = document.getElementById('shooting-player');
    shootingPlayer.style.display = 'block';
    shootingPlayer.style.top = '0px';
    shootingPlayer.style.left = '0px';

    for (let i = 0; i < 5; i++) {
        const target = document.createElement('div');
        target.className = 'shooting-target';
        target.style.top = `${Math.random() * 80}vh`;
        target.style.left = `${Math.random() * 80}vw`;
        shootingGame.appendChild(target);

        // Move target vertically
        let direction = Math.random() > 0.5 ? 1 : -1;
        setInterval(() => {
            const top = parseFloat(target.style.top);
            if (top <= 0 || top >= window.innerHeight - 30) {
                direction *= -1;
            }
            target.style.top = `${top + direction * 2}px`;
        }, 20);

        // Click to shoot target
        target.addEventListener('click', () => {
            target.remove();
            score++;
            if (score >= 5) {
                alert('You won the Shooting Gallery!');
                markGameAsBeaten('shooting');
                exitButton.click();
            }
        });
    }
}
