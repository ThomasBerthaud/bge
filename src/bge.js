const GAME_H = 8;
const GAME_W = 8;
const ships = [{ name: "Destroyer", size: 2 }, { name: "Cruiser", size: 3 }, { name: "Battlehsip", size: 4 }];

let map;

function startGame() {
  //generate map with randomly placed ships
  map = [];
  for (let i = 0; i < GAME_H; i++) {
    map[i] = Array(GAME_W);
  }

  //for each type of ship choose a starting position and an orientation
  ships.forEach(ship => {
    const orientation = Math.random() > 0.5 ? "h" : "v";
    const position = Math.random();
  });

  return map;
}

function shoot(x, y) {}

module.exports = { startGame, shoot };
