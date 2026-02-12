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
let nextDirection = motion;

let speed = 420; // starting slow
const minSpeed = 90; // fastest allowed
const speedStep = 15; // speed increase per food

let lastTime = 0;
let accumulator = 0;

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

function updateSpeed() {
  const level = Math.floor(scorecount / 10);
  let newSpeed = 420 - level * speedStep;
  if (newSpeed < minSpeed) newSpeed = minSpeed;
  speed = newSpeed;
}

function render() {
  // FIX: apply buffered direction every frame
  motion = nextDirection;

  timer.textContent = `${min}:${seconds}`;
  const foodBlock = blocks[`${food[0].x}-${food[0].y}`];
  foodBlock.classList.add("food");

  if (!foodBlock.querySelector("span")) {
    const leaf = document.createElement("span");
    foodBlock.appendChild(leaf);
  }

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
    const oldFood = blocks[`${food[0].x}-${food[0].y}`];
    oldFood.classList.remove("food");
    oldFood.innerHTML = "";
    score.textContent = `${scorecount}`;
    food = [
      {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      },
    ];
    snake.unshift(head);
    updateSpeed();
  }

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(gameloop);
    modal.style.display = "flex";
    startG.style.display = "none";
    restartG.style.display = "flex";
    return;
  }

  snake.forEach((ele) => {
    const block = blocks[`${ele.x}-${ele.y}`];
    block.classList.remove(
      "snakes",
      "snake-head",
      "snake-tail",
      "direction-up",
      "direction-down",
      "direction-left",
      "direction-right",
      "tail-up",
      "tail-down",
      "tail-left",
      "tail-right",
    );
    block.innerHTML = "";
  });

  snake.pop();
  snake.unshift(head);

  snake.forEach((ele, index) => {
    const block = blocks[`${ele.x}-${ele.y}`];

    if (index === 0) {
      block.classList.add("snake-head");
      block.classList.add(`direction-${motion}`);

      const eyes = createEyes();
      block.appendChild(eyes[0]);
      block.appendChild(eyes[1]);
    } else if (index === snake.length - 1) {
      block.classList.add("snake-tail");
      const tailDir = getTailDirection();
      block.classList.add(`tail-${tailDir}`);
    } else {
      block.classList.add("snakes");
    }
  });
}

function RestartGame() {
  clearInterval(gameloop);

  blocks[`${food[0].x}-${food[0].y}`].classList.remove("food");
  snake.forEach((ele) => {
    const block = blocks[`${ele.x}-${ele.y}`];
    block.classList.remove(
      "snakes",
      "snake-head",
      "snake-tail",
      "direction-up",
      "direction-down",
      "direction-left",
      "direction-right",
      "tail-up",
      "tail-down",
      "tail-left",
      "tail-right",
    );
    block.innerHTML = "";
  });

  const currentHighScore = parseInt(localStorage.getItem("HighScore")) || 0;
  if (scorecount > currentHighScore) {
    localStorage.setItem("HighScore", scorecount);
    maxScoreElement.textContent = scorecount;
  }

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
  nextDirection = "down";
  scorecount = 0;
  score.textContent = "0";
  seconds = 0;
  min = 0;
  speed = 420;

  modal.style.display = "none";
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

startbutton.addEventListener("click", () => {
  modal.style.display = "none";
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
});

restartbutton.addEventListener("click", RestartGame);

function getTailDirection() {
  if (snake.length < 2) return "down";

  const tail = snake[snake.length - 1];
  const beforeTail = snake[snake.length - 2];

  if (tail.x < beforeTail.x) return "up";
  if (tail.x > beforeTail.x) return "down";
  if (tail.y < beforeTail.y) return "left";
  if (tail.y > beforeTail.y) return "right";
}

function createEyes() {
  const eye1 = document.createElement("div");
  eye1.classList.add("eye");
  const pupil1 = document.createElement("div");
  pupil1.classList.add("pupil");
  eye1.appendChild(pupil1);

  const eye2 = document.createElement("div");
  eye2.classList.add("eye");
  const pupil2 = document.createElement("div");
  pupil2.classList.add("pupil");
  eye2.appendChild(pupil2);

  return [eye1, eye2];
}

function gameLoop(currentTime) {
  const delta = currentTime - lastTime;
  lastTime = currentTime;
  accumulator += delta;

  // Move snake only when enough time passed
  while (accumulator >= speed) {
    render(); // logic update
    accumulator -= speed;
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (eve) => {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  const newDir = map[eve.key];
  if (!newDir) return;

  const opposite =
    (motion === "up" && newDir === "down") ||
    (motion === "down" && newDir === "up") ||
    (motion === "left" && newDir === "right") ||
    (motion === "right" && newDir === "left");

  if (!opposite) nextDirection = newDir;
});
