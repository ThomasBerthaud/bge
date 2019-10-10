const GAME_H = 8;
const GAME_W = 8;
const SHIPS_INFO = [{ name: "Destroyer", size: 2 }, { name: "Cruiser", size: 3 }, { name: "Battleship", size: 4 }];

let map, shipParts, hitAndMisses;

function startGame({ width = GAME_W, height = GAME_H } = {}) {
  (map = []), (hitAndMisses = []);
  for (let i = 0; i < height; i++) {
    map[i] = Array(width).fill("-");
    hitAndMisses[i] = Array(width).fill(" ");
  }
  shipParts = new Map();

  //for each type of ship place it on the map
  SHIPS_INFO.forEach(ship => {
    let done = false;
    let direction, position;
    do {
      direction = Math.random() > 0.5 ? "h" : "v";
      position = {
        x: rand(0, width - 1 - (direction === "h" ? ship.size : 0)),
        y: rand(0, height - 1 - (direction === "v" ? ship.size : 0))
      };
      //check if no overlap with another ship
      if (isPosAvailable(ship, position, direction)) done = true;
    } while (!done);

    //add ship to the map
    for (let i = 0; i < ship.size; i++) {
      if (direction === "h") {
        map[position.y][position.x + i] = "X";
        shipParts.set(`${position.x + i}-${position.y}`, { x: position.x + i, y: position.y, hit: false, ...ship });
      } else {
        map[position.y + i][position.x] = "X";
        shipParts.set(`${position.x}-${position.y + i}`, { x: position.x, y: position.y + i, hit: false, ...ship });
      }
    }
  });

  return computeStats();

  function isPosAvailable(ship, position, direction) {
    if (direction === "h") {
      for (let i = 0; i < ship.size; i++) {
        if (map[position.y][position.x + i] === "X") return false;
      }
    } else {
      for (let i = 0; i < ship.size; i++) {
        if (map[position.y + i][position.x] === "X") return false;
      }
    }
    return true;
  }
}

function shoot(x, y) {
  const shipPart = shipParts.get(`${x}-${y}`);
  let hit;
  if (shipPart) {
    shipPart.hit = true;
    hitAndMisses[y][x] = "X";
    hit = true;
  } else {
    hitAndMisses[y][x] = "O";
    hit = false;
  }
  return computeStats({ hit });
}

function computeStats(props) {
  const shipsLeft = new Set([...shipParts.values()].filter(shipPart => !shipPart.hit).map(shipPart => shipPart.name))
    .size;
  return { hitAndMisses, map, shipsLeft, ...props };
}

function gameStats() {}

// UTILITIES
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = { startGame, shoot, gameStats };
