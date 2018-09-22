const processPlayerMove = require('./process-player');
const PlayersInfo = require('./players');
const fieldFactory = require('./fields/field');
const TERRAIN = require('./constants/terrain');
const RESOURCES = require('./constants/resources');

const EPOCH_LENGTH = 100;

const generateFields = process.argv[2] === 'generate';
const loadField = process.argv[2] === 'load';

let processIPs = (players, clients, settings) => {
  if (settings.paused) {
    setTimeout(processIPs, 2000);
    return;
  }
  console.log('server processIPs', Object.keys(clients).length);
  Object.keys(clients).forEach(key => {
    console.log('processing key', key);
    const client = clients[key];
    const player = players.find(player => player.key === client.key);
    if (player && client.clientAnswer) {
      // process player and client.clientAnswer
      const response = processPlayerMove(client.clientAnswer, player, settings);
      client.clientAnswer = null;
      if (client.connection) {
        client.connection.send(JSON.stringify({command: 'move', data: response}));
      } else {
        console.log(' no connection for client ', client.key);
      }
    }
  });
  settings.step++;
  if (settings.step >= EPOCH_LENGTH) {
    console.log('NEW EPOCH!!');
    settings.step = 0;
    settings.epoch++;
    const field = generateFields ? fieldFactory.generate(12) : (loadField ? fieldFactory.load(process.argv[3]) : fieldFactory.predefined(1));
    players.forEach(player => {
      PlayersInfo.resetPlayer(player, field);
    });

    Object.keys(clients).forEach(key => {
      console.log('resetting key', key);
      const client = clients[key];
      const player = players.find(player => player.key === client.key);
      if (player) {
        // process player and client.clientAnswer
        client.clientAnswer = null;
        const newClientData = {
          base: player.base,
          points: player.points,
          max_rovers: player.max_rovers,
          resources: player.resources,
          rovers: player.rovers.map(rover => ({...rover, area: [[], [], []]})),
          errors: [],
        };
        if (client.connection) {
          client.connection.send(JSON.stringify({command: 'reset', data: newClientData}));
        } else {
          console.log(' no connection for client ', client.key);
        }
      }
    });
    setTimeout(processIPs, 10 * 60000); // pause 10 minutes
  } else {
    setTimeout(processIPs, 2000);
  }
};

const Worker = (clients, settings) => {
  const field = generateFields ? fieldFactory.generate(12) : (loadField ? fieldFactory.load(process.argv[3]) : fieldFactory.predefined(1));
  settings.step = 0; // or load from db
  settings.epoch = 0; // or load from db
  const players = PlayersInfo.loadPlayers(field);
  players.forEach(player => {
    player.response = {
      base: player.base,
      points: player.points,
      max_rovers: player.max_rovers,
      resources: player.resources,
      rovers: player.rovers.map(rover => ({...rover, area: [[], [], []]})),
      errors: [],
    };
    player.fieldData.field[player.base.y][player.base.x] = TERRAIN.BASE; // to be sure
    player.fieldData.resources[player.base.y][player.base.x] = RESOURCES.NONE;
  });
  processIPs = processIPs.bind(null, players, clients, settings);
  setTimeout(processIPs, 5000);
  return players;
};

module.exports = Worker;
