import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import cors from '@koa/cors';
import WS from 'ws';

import router from './routes/index.js';
import { json } from 'stream/consumers';

import { chat } from './db/db.js'

const app = new Koa();

app.use(cors());

app.use(koaBody({
  urlencoded: true,
}));

app.use(router());


const server = createServer(app.callback());

const port = process.env.PORT || 7070;

const wsServer = new WS.Server({
  server
});

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});

wsServer.on('connection', (ws) => {
  ws.send(JSON.stringify(chat));

  ws.on('message', (mes) => {
    const message = JSON.parse(mes);
    message.timestamp = Date.now();
    chat.push(message);

    console.log("сообщение:", message);
    console.log("чат:", chat);

    const eventData = JSON.stringify(message);

    Array.from(wsServer.clients)
      .filter(client => client.readyState === WS.OPEN)
      .forEach(client => client.send(eventData));
  });
});
