import { v4 } from 'uuid';

export const chatData = {
  users: [],
  chat: [],
  
  checkAvailabilityName(name) {
    return this.users.some(user => user.name === name);
  },

  addUser(user, ws) {
    user.id = v4(),
    user.userWS = ws;
    this.users.push(user);
  },

  nameList() {
    const names = this.users.map(user => user.name);
    return names;
  },

  deleteWS(ws) {
    this.users = this.users.filter(user => user.userWS !== ws);
  },
}
