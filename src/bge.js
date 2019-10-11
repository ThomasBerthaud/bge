const GAME_H = 8;
const GAME_W = 8;
const SHIPS_INFO = [{ name: "Destroyer", size: 2 }, { name: "Cruiser", size: 3 }, { name: "Battleship", size: 4 }];

let players, nbTurns;

function startGame({ width = GAME_W, height = GAME_H, nbPlayers = 1 } = {}) {
  players = [];
  nbTurns = 0;
  for (let i = 0; i < nbPlayers; i++) {
    const board = [];
    const shipParts = new Map();
    const hitAndMisses = [];
    for (let i = 0; i < height; i++) {
      board[i] = Array(width).fill("-");
      hitAndMisses[i] = Array(width).fill(" ");
    }

    //for each type of ship place it on the map
    SHIPS_INFO.forEach(ship => {
      let direction, position;
      do {
        direction = Math.random() > 0.5 ? "h" : "v";
        position = {
          x: rand(0, width - 1 - (direction === "h" ? ship.size : 0)),
          y: rand(0, height - 1 - (direction === "v" ? ship.size : 0))
        };
        //check if no overlap with another ship
      } while (!isPosAvailable(board, ship, position, direction));

      //add ship to the map
      for (let i = 0; i < ship.size; i++) {
        if (direction === "h") {
          board[position.y][position.x + i] = "X";
          shipParts.set(`${position.x + i}-${position.y}`, { x: position.x + i, y: position.y, hit: false, ...ship });
        } else {
          board[position.y + i][position.x] = "X";
          shipParts.set(`${position.x}-${position.y + i}`, { x: position.x, y: position.y + i, hit: false, ...ship });
        }
      }
    });

    players.push({ hitAndMisses, board, shipParts, nbHits: 0, nbMisses: 0 });
  }

  return players.map(player => ({
    board: player.board,
    hitAndMisses: player.hitAndMisses,
    shipsLeft: getShipsLeft(player.shipParts)
  }));

  function isPosAvailable(board, ship, position, direction) {
    if (direction === "h") {
      for (let i = 0; i < ship.size; i++) {
        if (board[position.y][position.x + i] === "X") return false;
      }
    } else {
      for (let i = 0; i < ship.size; i++) {
        if (board[position.y + i][position.x] === "X") return false;
      }
    }
    return true;
  }
}

function shoot(x, y, playerNb = 1) {
  const player = players[playerNb - 1];
  const shipPart = player.shipParts.get(`${x}-${y}`);
  let hit;
  if (shipPart) {
    shipPart.hit = true;
    player.hitAndMisses[y][x] = "X";
    hit = true;
    player.nbHits++;
  } else {
    player.hitAndMisses[y][x] = "O";
    hit = false;
    player.nbMisses++;
  }
  nbTurns++;

  return {
    board: player.board,
    hitAndMisses: player.hitAndMisses,
    shipsLeft: getShipsLeft(player.shipParts),
    hit
  };
}

function getShipsLeft(shipParts) {
  return new Set([...shipParts.values()].filter(shipPart => !shipPart.hit).map(shipPart => shipPart.name)).size;
}

function gameStats(playerNb = 1) {
  return {
    nbTurns,
    nbHits: players[playerNb - 1].nbHits,
    nbMisses: players[playerNb - 1].nbMisses
  };
}

// UTILITIES
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = { startGame, shoot, gameStats };
