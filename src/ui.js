const prompt = require("prompt");
const colors = require("colors/safe");
const bge = require("./bge");

const charsColor = {
  X: colors.green,
  O: colors.red,
  " ": colors.grey
};

prompt.start();
prompt.message = "";

console.log(colors.blue("------- BATTLESHIP -------"));
console.log("Welcome to battleship game");
console.log("This game is played on an 8x8 board. The coordinates x=0, y=0 corresponds to the top left cell.");
console.log("X designates a successful shot, O designates a missed shot");
gameLoop().then(() => console.log("Thanks for playing !"));

async function gameLoop() {
  let gameState;
  let replay = "y";
  do {
    gameState = bge.startGame();
    do {
      displayBoard(gameState);
      const coordinates = await promptCoordinates();
      gameState = bge.shoot(coordinates[0], coordinates[1]);
      console.log(gameState.hit ? colors.green("HIT !!") : colors.red("miss..."));
    } while (gameState.shipsLeft > 0);

    console.log("Congratulations, you won !!");
    replay = await promptForReplay();
  } while (replay === "y");
}

function displayBoard({ hitAndMisses }) {
  console.log(colors.yellow("-".repeat(hitAndMisses.length + 2)));
  for (let i = 0; i < hitAndMisses.length; i++) {
    console.log(colors.yellow(`|${hitAndMisses[i].map(char => charsColor[char](char)).join("")}|`));
  }
  console.log(colors.yellow("-".repeat(hitAndMisses.length + 2)));
}

async function promptCoordinates() {
  const positionSchema = {
    properties: {
      coordinates: {
        pattern: /^[0-8]{1} [0-8]{1}$/,
        message: "input must be two number (between 0 and 8) separated by a space",
        required: true
      }
    }
  };
  return new Promise((resolve, reject) => {
    prompt.get(positionSchema, (err, result) => {
      if (err) reject(err);
      resolve(result.coordinates.split(" "));
    });
  });
}

async function promptForReplay() {
  const replaySchema = {
    properties: {
      replay: {
        description: "do you want to play again ? (y,n)",
        pattern: /y|n|[yes]|[no]/,
        required: true
      }
    }
  };
  return new Promise((resolve, reject) => {
    prompt.get(replaySchema, (err, result) => {
      if (err) reject(err);
      resolve(result.replay);
    });
  });
}
