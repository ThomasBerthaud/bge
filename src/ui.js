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
console.log("The coordinates x=0, y=0 corresponds to the top left cell.");
console.log("X designates a successful shot, O designates a missed shot");
console.log("at any time you can type 'stats' to display current's game stats");
gameLoop().then(() => console.log("Thanks for playing !"));

async function gameLoop() {
  let gameState;
  let replay = "y";
  do {
    const { width, height } = await promptBoardSize();
    gameState = bge.startGame({ width, height });
    displayBoard(gameState);
    do {
      const coordinates = await promptCoordinates();
      if (coordinates[0] === "stats") {
        const stats = bge.gameStats();
        console.log(`nb turns: ${stats.nbTurns}, nb hits: ${stats.nbHits}, nb misses: ${stats.nbMisses}`);
      } else {
        gameState = bge.shoot(coordinates[0], coordinates[1]);
        console.log(gameState.hit ? colors.green("HIT !!") : colors.red("miss..."));
        displayBoard(gameState);
      }
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

async function promptBoardSize() {
  const boardSizeSchema = {
    properties: {
      boardSize: {
        description: "choose a board size",
        message: "input must be two numbers (minimum 4) separated by a space",
        default: "8 8",
        conform(boardSize) {
          const [width, height] = boardSize.split(" ");
          return width >= 4 && height >= 4;
        }
      }
    }
  };

  return new Promise((resolve, reject) => {
    prompt.get(boardSizeSchema, (err, result) => {
      if (err) reject(err);
      const [width, height] = result.boardSize.split(" ").map(nb => Number(nb));
      resolve({ width, height });
    });
  });
}

async function promptCoordinates() {
  const positionSchema = {
    properties: {
      coordinates: {
        message: `input must be two numbers separated by a space or 'stats' to display game stats`,
        required: true,
        conform(coordinates) {
          if (coordinates === "stats") return true;
          const [width, height] = prompt.history("boardSize").value.split(" ");
          const [x, y] = coordinates.split(" ");
          return x < width && y < height;
        }
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
