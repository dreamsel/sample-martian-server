const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const OBJECTS = require('./constants/objects');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET || 'some strange and long string to be served as secret',
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
}));
app.use(cors({credentials: true, origin: true}));

app.use(express.static('public'));

module.exports = (players, commonFieldData, settings) => {
  app.get('/', (req, res, next) => res.redirect('/index.html'));

  app.get('/field/:playerkey', (req, res, next) => {
    const playerkey = req.params.playerkey;
    const foundPlayer = players.find(player => player.key === playerkey);
    if (foundPlayer) {
      const fieldData = foundPlayer.fieldData;
      const field = [];
      for (let y = 0; y < fieldData.FIELD_SIZE; y++) {
        field[y] = [];
        for (let x = 0; x < fieldData.FIELD_SIZE; x++) {
          field[y][x] = {terrain: fieldData.field[y][x], resource: fieldData.resources[y][x], objects: []};
        }
      }
      // put rovers on map
      const playerData = {
        key: foundPlayer.key,
        name: foundPlayer.name,
        points: foundPlayer.points,
        resources: foundPlayer.resources,
        rovers: foundPlayer.rovers.map(rover => ({id: rover.id, energy: rover.energy, load: rover.load}))
      };
      field[foundPlayer.base.y][foundPlayer.base.x].objects.push(OBJECTS.BASE);
      foundPlayer.rovers.forEach(rover => field[rover.y][rover.x].objects.push(OBJECTS.ROVER));

      return res.json({success: true, field, player: playerData, epoch: settings.epoch, step: settings.step});
    } else {
      res.json({success: false, message: 'no player found for this playerkey'});
    }
  });
  app.get('/status', (req, res, next) => {
    res.send({epoch: settings.epoch, step: settings.step});
  });

  const port = process.env.PORT || 7000;
  const server = http.createServer(app);
  server.listen(port, () => console.log('listening successfully'));
  return server;
};
