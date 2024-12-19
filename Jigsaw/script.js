const puzzleGrid = document.getElementById("puzzle-grid");
const piecesContainer = document.getElementById("pieces-container");
const retryButton = document.getElementById("retry-button");
const popup = document.getElementById("popup");
const quizContainer = document.getElementById("quiz-container");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizPopup = document.getElementById("quiz-popup");
const quizFeedback = document.getElementById("quiz-feedback");
const unlockButton = document.getElementById("unlock-button");
const quizRetryButton = document.getElementById("quiz-retry-button");

const IMAGE_FOLDER_PATH = './images/';
let currentLevelIndex = 0;
let startTime; // To store the start time of the game
let endTime; // To store the end time of the game
const rows = 4, cols = 4;
const pieceSize = 100;
const pieces = [];

// Fetch quiz data for the current level
async function fetchQuiz(level) {
  try {
    const response = await fetch(`http://localhost:5000/quiz/${level}`);
    if (!response.ok) throw new Error("Failed to fetch quiz data");
    const quiz = await response.json();
    return quiz;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
  }
}

// Initialize the puzzle for the current level
async function loadLevel(levelIndex) {
  if (levelIndex === 0) {
    startTime = new Date(); // Record the start time when the game begins
  }

  const level = await fetchQuiz(levelIndex + 1);
  if (level) {
    const image = new Image();
    image.src = `${IMAGE_FOLDER_PATH}level-${levelIndex + 1}.jpeg`;

    image.onload = () => {
      createPuzzle(image);
      document.getElementById("hint-image").src = `${IMAGE_FOLDER_PATH}level-${levelIndex + 1}.jpeg`;
    };

    quizContainer.classList.add("hidden");
    popup.classList.add("hidden");
    retryButton.classList.remove("hidden");
  }
}

// Create the puzzle grid and pieces
function createPuzzle(image) {
  puzzleGrid.innerHTML = "";
  piecesContainer.innerHTML = "";
  pieces.length = 0;

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    cell.dataset.index = i;
    puzzleGrid.appendChild(cell);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = {
        x: col * pieceSize,
        y: row * pieceSize,
        correctIndex: row * cols + col,
      };
      pieces.push(piece);
    }
  }

  pieces.sort(() => Math.random() - 0.5);

  pieces.forEach((piece) => {
    const pieceDiv = document.createElement("div");
    pieceDiv.classList.add("piece");
    pieceDiv.style.backgroundImage = `url(${image.src})`;
    pieceDiv.style.backgroundPosition = `-${piece.x}px -${piece.y}px`;
    pieceDiv.style.width = `${pieceSize}px`;
    pieceDiv.style.height = `${pieceSize}px`;
    pieceDiv.draggable = true;
    pieceDiv.dataset.index = piece.correctIndex;
    piecesContainer.appendChild(pieceDiv);
  });

  enableDragAndDrop();
}

let draggedPiece = null;

function enableDragAndDrop() {
  const allPieces = document.querySelectorAll(".piece");
  const allCells = document.querySelectorAll(".grid-cell");
  allPieces.forEach((piece) => {
    piece.addEventListener("dragstart", (e) => {
      draggedPiece = e.target;
    });
  });
  allCells.forEach((cell) => {
    cell.addEventListener("dragover", (e) => e.preventDefault());
    cell.addEventListener("drop", (e) => {
      if (!draggedPiece) return;
      if (cell.firstChild) piecesContainer.appendChild(cell.firstChild);
      cell.appendChild(draggedPiece);
      checkIfSolved();
    });
  });
  piecesContainer.addEventListener("dragover", (e) => e.preventDefault());
  piecesContainer.addEventListener("drop", (e) => {
    if (draggedPiece) piecesContainer.appendChild(draggedPiece);
  });
}

function checkIfSolved() {
  const allCells = Array.from(puzzleGrid.children);
  const isSolved = allCells.every((cell, index) => {
    const piece = cell.firstChild;
    return piece && parseInt(piece.dataset.index) === index;
  });
  if (isSolved) showPopup();
}

function showPopup() {
  popup.classList.remove("hidden");
  setTimeout(() => {
    popup.classList.add("hidden");
    loadQuiz(currentLevelIndex);
  }, 2000);
}

async function loadQuiz(levelIndex) {
  const quiz = await fetchQuiz(levelIndex + 1);
  quizContainer.classList.remove("hidden");
  quizQuestion.textContent = quiz.question;
  quizOptions.innerHTML = "";

  quiz.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.dataset.correct = option === quiz.answer;
    button.addEventListener("click", (e) => {
      const isCorrect = e.target.dataset.correct === "true";
      quizPopup.style.display = "block";
      quizFeedback.textContent = isCorrect
        ? "Correct! Get ready for the next puzzle."
        : "Wrong! Try again.";
      unlockButton.classList.toggle("hidden", !isCorrect);
      quizRetryButton.classList.toggle("hidden", isCorrect);
      if (isCorrect) unlockButton.onclick = () => nextLevel();
    });
    quizOptions.appendChild(button);
  });
}

async function nextLevel() {
  quizPopup.style.display = "none";
  quizContainer.classList.add("hidden");
  currentLevelIndex++;
  if (currentLevelIndex < 3) {
    loadLevel(currentLevelIndex);
  } else {
    endTime = new Date(); // Record the end time when the game ends
    const timeTaken = Math.floor((endTime - startTime) / 1000); // Calculate time in seconds
    await saveTime(timeTaken);
    alert("Congratulations! You finished all puzzles.");
  }
}

async function saveTime(timeTaken) {
  try {
    const response = await fetch('http://localhost:5000/save-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: "Player 1", timeTaken }),
    });
    if (!response.ok) throw new Error("Failed to save time");
    console.log("Time saved successfully");
  } catch (error) {
    console.error("Error saving time:", error);
  }
}

retryButton.addEventListener("click", () => loadLevel(currentLevelIndex));
loadLevel(currentLevelIndex);
