import combineRouters from 'koa-combine-routers';

import nickname from './nickname/index.js';

const router = combineRouters(
  nickname,
);

export default router;
