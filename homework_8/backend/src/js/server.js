import { createServer } from 'http';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import cors from '@koa/cors';
import WS from 'ws';

import router from './routes/index.js';
import { chatData } from './db/db.js'

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
  ws.send(JSON.stringify(chatData.chat));

  const mailingNames = () => {
    const nameList = (JSON.stringify(chatData.nameList()));
      const data = {
        type: "user",
        users: nameList,
      }
      const names = JSON.stringify(data);
      Array.from(wsServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(names));
  }

  ws.on('message', (mes) => {
    const message = JSON.parse(mes);
    console.log("message: ", message);

    if (message.type === "user") {
      chatData.addUser(message.user, ws);
      mailingNames();
      return;
    }
  
    if (message.type === "message") {
      message.timestamp = Date.now();
      chatData.chat.push(message);

      // console.log("сообщение:", message);
      // console.log("чат:", chatData.chat);

      const eventData = JSON.stringify(message);

      Array.from(wsServer.clients)
        .filter(client => client.readyState === WS.OPEN)
        .forEach(client => client.send(eventData));
    }
  });

  ws.on('close', (e) => {
    console.log("close: ", e);

    chatData.deleteWS(ws);
    mailingNames();
  });

  ws.on('error', (e) => {
    console.log("error", e);
  });
});
