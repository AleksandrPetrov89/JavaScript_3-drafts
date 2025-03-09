import { createServer } from 'http';
import Koa from 'koa';
import cors from '@koa/cors';
import {koaBody} from 'koa-body';
import { v4 as uuidv4 } from 'uuid';

const ticket01 = {
  id: uuidv4(),
  name: "ticket01",
  description: "ticket01 full",
  status: 0,
  created: Date.now(),
}
const ticket02 = {
  id: uuidv4(),
  name: "ticket02",
  description: "ticket02 full",
  status: 1,
  created: Date.now(),
}

const app = new Koa();

app.use(cors());

app.use(koaBody({
  urlencoded: true,
  // multipart: true,
}));

// const tickets = [];
const tickets = [ticket01, ticket02];

app.use(async ctx => {
  const { method } = ctx.request.query;
  console.log(method);
  switch (method) {
    case "allTickets":
      ctx.body = tickets;
      return;
    case "createTicket":
      createTicket(ctx)
      return;
    case "ticketById":
      ticketById(ctx);
      return
    case "changeStatus":
      changeStatus(ctx);
      return
    case "changeTicket":
      changeTicket(ctx);
      return
    case "deleteTicket":
      deleteTicket(ctx);
      return
    // TODO: обработка остальных методов
    default:
      ctx.response.status = 404;
      console.log("default");
      return;
  }
});

const server = createServer(app.callback());

const port = process.env.PORT || 7070;

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + port);
});

function createTicket(ctx) {
      const ticket = {
        id: uuidv4(),
        name: ctx.request.body.name,
        description: ctx.request.body.description,
        status: ctx.request.body.status,
        created: Date.now(),
      };
      tickets.push(ticket);
      ctx.body = ticket;
}

function ticketById(ctx) {
  const id = ctx.request.query.id;
  const ticket = tickets.find((el) => id === el.id);
  if (ticket) {
    ctx.body = ticket;
  } else {
    ctx.response.status = 404;
  }
}

function changeStatus(ctx) {
  const id = ctx.request.body.id;
  const ticket = tickets.find((el) => id === el.id);
  if (ticket) {
    ticket.status = ctx.request.body.status;
    ctx.body = ticket;
  } else {
    ctx.response.status = 404;
  }
}

function changeTicket(ctx) {
  const id = ctx.request.body.id;
  const ticket = tickets.find((el) => id === el.id);
  if (ticket) {
    ticket.name = ctx.request.body.name;
    ticket.description = ctx.request.body.description;
    ctx.body = ticket;
  } else {
    ctx.response.status = 404;
  }
}

function deleteTicket(ctx) {
  const id = ctx.request.query.id;
  const ticket = tickets.find((el) => id === el.id);
  if (ticket) {
    const index = tickets.indexOf(ticket);
    tickets.splice(index, 1);
    ctx.response.status = 204;
  } else {
    ctx.response.status = 404;
  }
}
