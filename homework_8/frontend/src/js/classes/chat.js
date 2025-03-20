export default class Chat {
  #url;
  #createNickNameBind;
  #user;
  #userBox;
  #chatForm;

  constructor(url) {
    this.#url = url;
  }

  // Метод, запускающий работу класса.
  start() {
    const form = createNickNameForm();
    this.#createNickNameBind = this.#createNickName.bind(this, form);
    form.addEventListener("submit", this.#createNickNameBind);
  }

  async #createNickName(form, e) {
    e.preventDefault();

    const nickname = form.querySelector(".name").value;
    const url = "http://" + this.#url + "/nickname";
    const data = {
      name: nickname,
    };
    const param = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    let answer;
    try {
      const response = await fetch(url, param);
      answer = await response.json();
    } catch (e) {
      console.error("Ошибка:", e);
      alert("Ошибка связи с сервером!");
      return;
    }
    if (answer) {
      if (answer.status === "This nickname is taken") {
        alert(`Псевдоним "${nickname}" занят!`);
        return;
      }       
    }
    this.#user = answer;

    form.removeEventListener("submit", this.#createNickNameBind);
    form.remove();
    this.#openChat();
  }

  #openChat() {
    const wsUrl = "ws://" + this.#url + "/ws";
    const ws = new WebSocket(wsUrl);

    this.#userBox = createUserBox();
    this.#chatForm = createChatForm();

    const sendMes = this.#sendMessage.bind(this, ws);
    this.#chatForm.addEventListener("submit", sendMes);

    ws.addEventListener('open', (e) => {
      console.log('ws open');
      console.log(e);
      const data = {
        type: "user",
        user: this.#user,
      }
      const message = JSON.stringify(data);
    ws.send(message);
    });
    
    ws.addEventListener('close', (e) => {
      console.log('ws close');
      console.log(e);
    });
    
    ws.addEventListener('error', (e) => {
      console.log('ws error');
      console.log(e);
    });
    
    ws.addEventListener('message', (e) => {
      console.log('ws message');
      console.log(e);
          
      const data = JSON.parse(e.data);
      // console.log(data);
      // console.log(Array.isArray(data));

      if (data.type === "user") {
        console.log("показать пользователей");
        const names = JSON.parse(data.users);
        this.#userBox.innerHTML = "";
        names.forEach(name => this.#showUser(name));
        return;
      }

      if (Array.isArray(data)) {
        data.forEach((mes) => this.#showMessage(mes));
        return;
      }

      this.#showMessage(data);
    });
  }

  #sendMessage(ws, e) {
    e.preventDefault();

    const inputEl = this.#chatForm.querySelector(".input-message");
    const textMes = inputEl.value;
    inputEl.value = "";

    const data = {
      type: "message",
      name: this.#user.name,
      textMes: textMes,
    };
    const message = JSON.stringify(data);
    ws.send(message);
  }

  #showMessage(data) {
    const {textMes, timestamp} = data;
    let name = data.name;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `
      <p class="message explanation"></p>
      <p class="message message-text"></p>`;
    const chatBox = this.#chatForm.querySelector(".chat-box");
    chatBox.append(messageDiv);
    
    const date = formatsDate(timestamp);
    
    if (name === this.#user.name) {
      name = "You";
      messageDiv.classList.add("you");
    }
    const explanation = name + ", " + date;

    const explanP = messageDiv.querySelector(".explanation");
    const messageText = messageDiv.querySelector(".message-text");
    explanP.textContent = explanation;
    messageText.textContent = textMes;

    messageDiv.scrollIntoView();
  }

  #showUser(name) {
    console.log("names:", name);

    const userDiv = document.createElement("div");
    userDiv.classList.add("user");
    userDiv.innerHTML = `
      <div class="user-photo"></div>
      <div class="user-name"></div>`;
    this.#userBox.append(userDiv);

    const userName = userDiv.querySelector(".user-name");
    if (this.#user.name === name) {
      name = "You";
      userName.classList.add("user-you");
    }

    userName.textContent = name;
  }
}

function formatsDate(timestamp) {
  const date = new Date(timestamp);

  let minutes = String(date.getMinutes());
  if (minutes.length < 2) minutes = "0" + minutes;

  let hours = String(date.getHours());
  if (hours.length < 2) hours = "0" + hours;

  let day = String(date.getDate());
  if (day.length < 2) day = "0" + day;

  let month = String(date.getMonth() + 1);
  if (month.length < 2) month = "0" + month;

  let year = String(date.getFullYear());

  const formattedDate = hours + ":" + minutes + " " + day + "." + month + "." + year;
  return formattedDate;
}

function createUserBox() {
  const userBox = document.createElement("div");
  userBox.classList.add("user-box", "forms");
  const desk = document.querySelector(".desk");
  desk.append(userBox);
  return userBox;
}

function createChatForm() {
  const chatForm = document.createElement("form");
  chatForm.classList.add("chat-form", "forms");
  chatForm.innerHTML = `
    <div class="chat-box"></div>
    <input type="text" class="input-message" name="message" autocomplete="off" required 
    placeholder="Введите сообщение">`;
  const desk = document.querySelector(".desk");
  desk.append(chatForm);
  return chatForm;
}

function createNickNameForm() {
  const form = document.createElement("form");
  form.classList.add("form");
  form.innerHTML = `
    <p class="form-title">Выберите псевдоним</p>
    <input type="text" class="name" name="name" autocomplete="off" required>
    <button type="submit" class="btn btn-ok">Продолжить</button>`;
  const desk = document.querySelector(".desk");
  desk.append(form);
  return form;
}
