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
console.log("at any time you can type 'stats' to display current's player stats");
gameLoop().then(() => console.log("Thanks for playing !"));

async function gameLoop() {
  let gameState;
  let replay = "y";
  do {
    const { width, height, nbPlayers } = await promptGameParams();
    gameState = bge.startGame({ width, height, nbPlayers });
    const playersBoard = gameState;
    gameState.shipsLeft = Infinity; // to avoid exiting game when user type stats on first round

    displayAllBoards(gameState);
    do {
      const playerNb = bge.gameStats().nbTurns % 2 === 0 ? 1 : 2;
      const coordinates = await promptCoordinates(playerNb);
      if (coordinates[0] === "stats") {
        const stats = bge.gameStats(playerNb);
        const turnNb = Math.floor(stats.nbTurns / nbPlayers) + 1;
        console.log(`nb turns: ${turnNb}, nb hits: ${stats.nbHits}, nb misses: ${stats.nbMisses}`);
      } else {
        gameState = bge.shoot(coordinates[0], coordinates[1], playerNb);
        console.log(gameState.hit ? colors.green("HIT !!") : colors.red("miss..."));
        playersBoard[playerNb - 1] = { hitAndMisses: gameState.hitAndMisses };
        const nextPlayerNb = bge.gameStats().nbTurns % 2 === 0 ? 1 : 2;
        displayAllBoards(playersBoard, nextPlayerNb);
      }
    } while (gameState.shipsLeft > 0);

    console.log("Congratulations, you won !!");
    replay = await promptForReplay();
  } while (replay === "y");
}

function displayAllBoards(players, playerNb = 1) {
  const line = players.reduce((line, player) => line + boardLimit(player.hitAndMisses.length) + "  ", "");
  const playersLine = players.reduce((line, player, index) => {
    const playerLabel = `Player ${index + 1}: `.padEnd(player.hitAndMisses.length + 4, " ");
    return line + (playerNb === index + 1 ? colors.cyan(playerLabel) : playerLabel);
  }, "");
  console.log(playersLine);
  console.log(line);
  for (let i = 0; i < players[0].hitAndMisses.length; i++) {
    console.log(players.reduce((line, player) => (line += boardLine(player.hitAndMisses[i]) + "  "), ""));
  }
  console.log(line);
}

// TODO decaler le board en fonction du joueur en train de jouer
function displayBoard(gameState, playerNb) {
  const { hitAndMisses } = gameState;
  console.log(boardLimit(hitAndMisses.length));
  for (let i = 0; i < hitAndMisses.length; i++) {
    console.log(boardLine(hitAndMisses[i]));
  }
  console.log(boardLimit(hitAndMisses.length));
}

function boardLimit(boardLength) {
  return colors.yellow("-".repeat(boardLength + 2));
}
function boardLine(boardLine) {
  return colors.yellow(`|${boardLine.map(char => charsColor[char](char)).join("")}|`);
}

async function promptGameParams() {
  const gameParamsSchema = {
    properties: {
      boardSize: {
        description: "choose a board size",
        message: "input must be two numbers (minimum 4) separated by a space",
        default: "8 8",
        conform(boardSize) {
          const [width, height] = boardSize.split(" ");
          return width >= 4 && height >= 4;
        }
      },
      playerMode: {
        description: "Do you want to start a 2 players game ? (y|n)",
        pattern: /y|n|[yes]|[no]/,
        default: "n",
        before(value) {
          return value === "y" ? 2 : 1;
        }
      }
    }
  };

  return new Promise((resolve, reject) => {
    prompt.get(gameParamsSchema, (err, result) => {
      if (err) reject(err);
      const [width, height] = result.boardSize.split(" ").map(nb => Number(nb));
      const nbPlayers = result.playerMode;
      resolve({ width, height, nbPlayers });
    });
  });
}

async function promptCoordinates(playerNb) {
  const positionSchema = {
    properties: {
      coordinates: {
        description: `player ${playerNb} coordinates`,
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
