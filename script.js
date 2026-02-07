const blockside = 30;

const modal = document.querySelector(".modal");
const startG = document.querySelector(".startgame");
const restartG = document.querySelector(".restartgame");
const startbutton = document.querySelector(".btn-start");
const restartbutton = document.querySelector(".btn-restart");
const board = document.querySelector(".board");
const score = document.querySelector("#score");
const maxScoreElement = document.querySelector("#maxscore");
const timer = document.querySelector("#timer");
const sound = new Audio("FAAAH!.mpeg");

let seconds = 0;
let min = 0;
let scorecount = 0;
let motion = "down";
let gameloop;

const cols = Math.floor(board.clientWidth / blockside);
const rows = Math.floor(board.clientHeight / blockside);
const blocks = [];

let snake = [
  {
    x: Math.floor(Math.random() * (rows - rows / 3)),
    y: Math.floor(Math.random() * (cols - cols / 3)),
  },
];

let food = [
  { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) },
];

const savedHighScore = parseInt(localStorage.getItem("HighScore"));
if (savedHighScore) {
  maxScoreElement.textContent = savedHighScore;
}

setInterval(() => {
  min++;
  console.log(min);
}, 60000);

setInterval(() => {
  seconds++;
}, 1000);

const fragment = document.createDocumentFragment();

for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    let block = document.createElement("div");
    block.classList.add("block");
    fragment.appendChild(block);
    blocks[`${i}-${j}`] = block;
  }
}
board.appendChild(fragment);

function render() {
  timer.textContent = `${min}:${seconds}`;
  blocks[`${food[0].x}-${food[0].y}`].classList.add("food");

  let head = null;
  if (motion == "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  }
  if (motion === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  }
  if (motion === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }
  if (motion === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  }

  if (head.x == food[0].x && head.y == food[0].y) {
    sound.play();
    scorecount += 10;
    blocks[`${food[0].x}-${food[0].y}`].classList.remove("food");
    score.textContent = `${scorecount}`;
    food = [
      {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      },
    ];
    snake.unshift(head);
  }

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(gameloop);
    modal.style.display = "flex";
    startG.style.display = "none";
    restartG.style.display = "flex";
    return;
  }

  snake.forEach((ele) => {
    blocks[`${ele.x}-${ele.y}`].classList.remove("snakes");
  });
  snake.pop();
  snake.unshift(head);

  snake.forEach((ele) => {
    blocks[`${ele.x}-${ele.y}`].classList.add("snakes");
  });
}

function RestartGame() {
  // Clear the game loop
  clearInterval(gameloop);

  // Remove food and snake from board
  blocks[`${food[0].x}-${food[0].y}`].classList.remove("food");
  snake.forEach((ele) => {
    blocks[`${ele.x}-${ele.y}`].classList.remove("snakes");
  });

  // Update high score with proper null handling
  const currentHighScore = parseInt(localStorage.getItem("HighScore")) || 0;

  if (scorecount > currentHighScore) {
    localStorage.setItem("HighScore", scorecount);
    maxScoreElement.textContent = scorecount;
  }

  // Reset game state
  snake.length = 0;
  snake.push({
    x: Math.floor(Math.random() * (rows - rows / 3)),
    y: Math.floor(Math.random() * (cols - cols / 3)),
  });

  food = [
    {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    },
  ];

  motion = "down";
  scorecount = 0;
  score.textContent = "0";
  seconds = 0;
  min = 0;

  // Hide modal and restart game
  modal.style.display = "none";
  gameloop = setInterval(() => {
    render();
  }, 300);
}

startbutton.addEventListener("click", () => {
  modal.style.display = "none";
  gameloop = setInterval(() => {
    render();
  }, 300);
});

restartbutton.addEventListener("click", RestartGame);

window.addEventListener("keydown", (eve) => {
  if (eve.key == "ArrowUp" && motion != "down") {
    motion = "up";
  }
  if (eve.key == "ArrowDown" && motion != "up") {
    motion = "down";
  }
  if (eve.key == "ArrowLeft" && motion != "right") {
    motion = "left";
  }
  if (eve.key == "ArrowRight" && motion != "left") {
    motion = "right";
  }
});

gameloop = setInterval(() => {
  render();
}, 300);
