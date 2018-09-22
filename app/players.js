const PlayersList = require('./players-list');

const RESOURCES = require('./constants/resources');
const ROVER = require('./constants/rover');
const TERRAIN = require('./constants/terrain');
const deepcopy = require('deepcopy');

function findBase (field) {
  const base = {};

  for (let y = 0; y < field.field.length; y++) {
    for (let x = 0; x < field.field[y].length; x++) {
      if (field.field[y][x] === TERRAIN.BASE) {
        base.x = x;
        base.y = y;
      }
    }
  }
  return base;
}
module.exports = {
  loadPlayers (field) {
    const base = findBase(field);

    return PlayersList.map(player => ({
      key: player.key,
      name: player.name,
      base: deepcopy(base),
      rovers: [{id: 1, x: base.x, y: base.y, energy: ROVER.MAX_ENERGY, load: [], processed: false}],
      points: 0,
      max_rovers: 1,
      resources: {
        [RESOURCES.RAREEARTH]: 0,
        [RESOURCES.METAL]: 0,
        [RESOURCES.HYDRATES]: 0,
        [RESOURCES.URANIUM]: 0,
      },
      fieldData: deepcopy(field)
    }));
    /*
    return playersList.map(player => ({
      ...player,
      base: deepcopy(base),
      rovers: [{id: 1, x: base.x, y: base.y, energy: ROVER.MAX_ENERGY, load: [], processed: false}],
      points: 0,
      max_rovers: 1,
      resources: {
        [RESOURCES.RAREEARTH]: 0,
        [RESOURCES.METAL]: 0,
        [RESOURCES.HYDRATES]: 0,
        [RESOURCES.URANIUM]: 0,
      },
      fieldData: deepcopy(field)
    }));
    */
  },
  resetPlayer (player, field) {
    const base = findBase(field);
    player.rovers = [{id: 1, x: base.x, y: base.y, energy: ROVER.MAX_ENERGY, load: [], processed: false}];
    player.points = 0;
    player.resources = {
      [RESOURCES.RAREEARTH]: 0,
      [RESOURCES.METAL]: 0,
      [RESOURCES.HYDRATES]: 0,
      [RESOURCES.URANIUM]: 0
    };
    player.fieldData = deepcopy(field);
  }
};
