import Router from 'koa-router';
import { v4 } from 'uuid';

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
    id: v4(),
    name: userName,
  }
  chatData.add(user);
  ctx.response.body = user;
});

export default router;
