export default class Chat {
  #desk;
  #url;
  #createNickNameBind;
  #user;
  #userBox;
  #chatForm;

  constructor(url) {
    this.#url = url;
    this.#desk = document.querySelector(".desk");
  }

  // Метод, запускающий работу класса.
  start() {
    const form = document.createElement("form");
    form.classList.add("form");
    form.innerHTML = `
      <p class="form-title">Выберите псевдоним</p>
      <input type="text" class="name" name="name" autocomplete="off" required>
      <button type="submit" class="btn btn-ok">Продолжить</button>`;
    this.#desk.append(form);
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

    this.#userBox = this.#createUserBox();
    this.#chatForm = this.#createChatForm();

    const sendMes = this.#sendMessage.bind(this, ws);
    this.#chatForm.addEventListener("submit", sendMes);

    ws.addEventListener('open', (e) => {
      console.log('ws open');
      console.log(e);
      if (!e.data) return;
      const data = JSON.parse(e.data);
      console.log(data);
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
      console.log(data);
      console.log(Array.isArray(data));

      if (Array.isArray(data)) {
        data.forEach((mes) => this.#showMessage(mes));
        return;
      }

      this.#showMessage(data);
    });
  }

  #createUserBox() {
    const userBox = document.createElement("div");
    userBox.classList.add("user-box", "forms");
    this.#desk.append(userBox);
    return userBox;
  }

  #createChatForm() {
    const chatForm = document.createElement("form");
    chatForm.classList.add("chat-form", "forms");
    chatForm.innerHTML = `
      <div class="chat-box"></div>
      <input type="text" class="input-message" name="message" autocomplete="off" required 
      placeholder="Введите сообщение">`;
    this.#desk.append(chatForm);
    return chatForm;
  }

  #sendMessage(ws, e) {
    e.preventDefault();

    const inputEl = this.#chatForm.querySelector(".input-message");
    const textMes = inputEl.value;
    inputEl.value = "";

    const data = {
      user: this.#user,
      textMes: textMes,
    };
    const message = JSON.stringify(data);
    ws.send(message);
  }

  #showMessage(data) {
    const {user, textMes, timestamp} = data;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = `
      <p class="message explanation"></p>
      <p class="message message-text"></p>`;
    const chatBox = this.#chatForm.querySelector(".chat-box");
    chatBox.append(messageDiv);
    
    let name = user.name;
    const date = this.#formatsDate(timestamp);
    
    if (user.id === this.#user.id) {
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

  #formatsDate(timestamp) {
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
}
