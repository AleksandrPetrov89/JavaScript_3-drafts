import { v4 } from 'uuid';

export const chatData = {
  users: [],
  chat: [],
  
  //Проверяет, есть ли такой псевдоним среди пользователей
  checkAvailabilityName(name) {
    return this.users.some(user => user.name === name);
  },

  //Добавляет нового пользователя в массив пользователей
  addUser(user, ws) {
    user.id = v4(),
    user.userWS = ws;
    this.users.push(user);
  },

  //Создает новый массив, содержащий только псевдонимы пользователей
  nameList() {
    const names = this.users.map(user => user.name);
    return names;
  },

  //"Удаляет" из массива пользователей пользователя с заданным 
  deleteWS(ws) {
    this.users = this.users.filter(user => user.userWS !== ws);
  },
}
