import Router from 'koa-router';

import {chatData} from '../../db/db.js'

const router = new Router();

router.post('/nickname', async (ctx) => {
  const userName = ctx.request.body.name;
  if (chatData.checkAvailabilityName(userName)) {
    ctx.response.status = 400;
    ctx.response.body = { status: "This nickname is taken" };
    return;
  }
  const user = {
    name: userName,
  }
  ctx.response.body = user;
});

export default router;
