const WebSocketServer = require('websocket').server;

const worker = require('./worker');
const runWebServer = require('./webserver');

// const commonFieldData = generateFields ? fieldFactory.generate(12) : fieldFactory.predefined(level);
(async () => {
  const clients = {};
  const settings = {paused: false};
  const players = await worker(clients, settings);
  if (!players) {
    console.log('failed to run worker and load players');
    return false;
  }
  // http server for frontend interaction
  const webserver = runWebServer(players, null /* commonFieldData */, settings);

  // websocket server for interaction with clients
  const wsServer = new WebSocketServer({
    httpServer: webserver
  });

  wsServer.on('request', (req) => {
    console.log('new request', req.remoteAddress);
    const connection = req.accept(null, req.origin);
    if (connection) {
      // add connection to pool
      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          console.log('server: got message from client', message);
          try {
            const json = JSON.parse(message.utf8Data);
            const clientKey = json.key ? json.key.toString() : '';
            if (players.some(el => el.key === clientKey)) {
              if (!clients[clientKey] || json.handshaking) {
                if (clients[clientKey] && clients[clientKey].connection) {
                  connection.send(JSON.stringify({error: `This key is buzy: ${json.key}`}));
                } else {
                  console.log('got new client', clientKey);
                  clients[clientKey] = {connection};
                  connection.clientKey = clientKey;
                }
              }
              clients[clientKey].key = json.key;
              clients[clientKey].clientAnswer = json.answer;
            } else {
              console.log('wrong key', json.key);
              connection.send(JSON.stringify({error: `Wrong key ${json.key}`}));
            }
          } catch (e) {
            console.log('server faild to parse json', message.utf8Data);
          }
        }
      });
      connection.on('close', (reason, descr) => {
        console.log('connection closed', reason, descr, connection.remoteAddress);
        // remove connection from pool
        console.log('removing connection for client', connection.clientKey);
        if (connection.clientKey && clients[connection.clientKey]) {
          clients[connection.clientKey].connection = null;
        }
      });
      connection.on('error', (err) => {
        console.log('connection err', err.message, connection.remoteAddress);
        // remove connection from pool
        if (clients[connection.clientKey] && clients[connection.clientKey].connection) {
          clients[connection.clientKey].connection = null;
        }
        connection.drop(connection.CLOSE_REASON_PROTOCOL_ERROR);
      });
    }
  });
})();
