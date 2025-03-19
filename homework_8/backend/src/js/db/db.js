export const chatData = {
  users: [],
  
  checkAvailabilityName(name) {
    return this.users.some(user => user.name === name);
  },

  add(user) {
    this.users.push(user);
  },
}

export const chat = [];
