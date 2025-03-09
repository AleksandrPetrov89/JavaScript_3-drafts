import { createFormTicket, createForm, deleteForm } from "../forms";

export default class HelpDesk {
  constructor() {
    this.desk = document.querySelector(".desk");
    this.ticketsBox = this.desk.querySelector(".tickets-box");
    this.btnAddTicket = this.desk.querySelector(".add-ticket");
  }

  // Метод, запускающий работу класса.
  // Отображает все тикеты, которые есть на сервере и
  // ждет действий от пользователя.
  async start() {
    await this.allTickets();
    const createTicket = this.createTicket.bind(this);
    this.btnAddTicket.addEventListener("click", createTicket);
    const catchesClick = this.catchesClick.bind(this);
    this.desk.addEventListener("click", catchesClick);
  }

  // Метод, который запрашивает, затем получает все тикеты от сервера и
  // отрисовывает их на странице.
  async allTickets() {
    const url = "http://localhost:7070?method=allTickets";
    let tickets = [];
    try {
      const response = await fetch(url);
      if (this.checkResponse(response)) {
        tickets = await this.checkJson(response);
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    for (const ticket of tickets) {
      this.fillingTicket(ticket);
    }
  }

  // Метод, который формирует, заполняет и отображает один тикет на странице.
  fillingTicket(ticket) {
    const ticketForm = createFormTicket();
    if (ticket.status) {
      ticketForm.querySelector(".checkbox").classList.add("checkbox-done");
    }
    ticketForm.querySelector(".p-name").textContent = ticket.name;
    const date = this.formatsDate(ticket.created);
    ticketForm.querySelector(".p-timestamp").textContent = date;
    ticketForm.dataset.id = ticket.id;
    this.ticketsBox.prepend(ticketForm);
  }

  // Метод, проверяющий, что ответ за запрос успешный.
  checkResponse(response) {
    if (response.ok) {
      return true;
    } else {
      console.log(new Error(`Response.status = ${response.status}`));
      return false;
    }
  }

  //Метод, проверяющий, что данные в json формате.
  checkJson(response) {
    try {
      const data = response.json();
      return data;
    } catch (e) {
      console.error("Ошибка в методе 'checkJson':", e);
    }
  }

  // Метод, переводящий Unix timestamp в строковое значение в определенном формате.
  formatsDate(timestamp) {
    const options = {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(timestamp).toLocaleString("ru-RU", options);
    const formattedDate = date.replace(",", "");
    return formattedDate;
  }

  // Метод-реакция на нажатие кнопки "Добавить тикет".
  // Создает форму для заполнения тикета, блокирует повторное нажатие
  // кнопки "Добавить тикет", ждет нажатия кнопок "Ок" или "Отмена".
  createTicket() {
    const form = createForm();
    form.querySelector(".form-title").textContent = "Добавить тикет";
    this.desk.append(form);
    this.btnAddTicket.setAttribute("disabled", "");

    const btnCancel = form.querySelector(".btn-cancel");

    this.cancelCr = this.cancelCreate.bind(this, form, btnCancel);
    this.createTickReq = this.createTicketRequest.bind(this, form, btnCancel);

    btnCancel.addEventListener("click", this.cancelCr);
    form.addEventListener("submit", this.createTickReq);
  }

  // Метод-реакция на нажатие кнопки "Отмена" на форме создания тикета.
  // Удаляет слушатели с кнопок "Ок" и "Отмена", удаляет форму создания тикета,
  // разблокирует нажатие кнопки "Добавить тикет".
  cancelCreate(form, btnCancel) {
    btnCancel.removeEventListener("click", this.cancelCr);
    form.removeEventListener("submit", this.createTickReq);
    form.remove();
    this.btnAddTicket.removeAttribute("disabled", "");
  }

  // Метод-реакция на нажатие кнопки "Ок" на форме создания тикета.
  // Передает данные формы на сервер, получает в ответ данные созданного тикета,
  // отображает тикет на странице и закрывает форму создания тикета.
  async createTicketRequest(form, btnCancel, e) {
    e.preventDefault();
    const url = "http://localhost:7070?method=createTicket";
    const data = {
      name: form.querySelector(".name").value,
      description: form.querySelector(".description").value,
      status: 0,
    };
    const param = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    let ticket;
    try {
      const response = await fetch(url, param);
      if (this.checkResponse(response)) {
        ticket = await this.checkJson(response);
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    this.fillingTicket(ticket);

    this.cancelCreate(form, btnCancel);
  }

  // Метод, который определяет куда нажал пользователь на тикете.
  // (На сам тикет или на одну из кнопок: редактировать/удалить/изменить статус)
  catchesClick(e) {
    if (e.target.classList.contains("ticket")) {
      this.showsOrHidesDescription(e);
    }
    if (
      e.target.classList.contains("btn-ticket") &&
      e.target.classList.contains("checkbox")
    ) {
      this.changeStatus(e);
    }
    if (e.target.classList.contains("btn-edit-ticket")) {
      this.changeTicket(e);
    }
    if (e.target.classList.contains("btn-delete-ticket")) {
      this.deleteTicket(e);
    }
  }

  // Метод, отображающий/скрывающий подробное описание тикета.
  // Отправляет запрос с id тикета на сервер, получает в ответ данные данного
  // тикета и отображает/скрывает подробное описание тикета.
  async showsOrHidesDescription(e) {
    const ticketForm = e.target;
    const id = ticketForm.dataset.id;
    const url = `http://localhost:7070?method=ticketById&id=${id}`;
    let ticket;
    try {
      const response = await fetch(url);
      if (this.checkResponse(response)) {
        ticket = await this.checkJson(response);
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    if (ticket) {
      ticketForm.classList.toggle("full");
      if (ticketForm.classList.contains("full")) {
        const pDescription = document.createElement("p");
        pDescription.classList.add("ticket-text", "p-description");
        pDescription.textContent = ticket.description;
        const ticketDescr = ticketForm.querySelector(".ticket-description");
        ticketDescr.append(pDescription);
      } else {
        ticketForm.querySelector(".p-description").remove();
      }
    }
  }

  // Метод, меняющий статус выполнения тикета.
  // Отправляет запрос с изменненным статусом данного тикета на сервер,
  // при успешном ответе меняет статус тикета на странице.
  async changeStatus(e) {
    const btn = e.target;
    const idTicket = btn.closest(".ticket").dataset.id;

    let statusTicket;
    if (btn.classList.contains("checkbox-done")) {
      statusTicket = 0;
    } else {
      statusTicket = 1;
    }
    const url = `http://localhost:7070?method=changeStatus`;
    const data = {
      id: idTicket,
      status: statusTicket,
    };
    const param = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    let ticket;
    try {
      const response = await fetch(url, param);
      if (this.checkResponse(response)) {
        ticket = await this.checkJson(response);
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    if (ticket) {
      btn.classList.toggle("checkbox-done");
    }
  }

  // Метод-реакция на нажатие кнопки "Редактировать" на тикете.
  // Блокирует повторное нажатие кнопки "Редактировать", создает форму
  // для редактирования тикета, отправляет запрос с id тикета на сервер,
  // заполняет форму текущими данными тикета, ждет нажатия кнопок "Ок" или "Отмена".
  async changeTicket(e) {
    const btn = e.target;
    const ticketForm = btn.closest(".ticket");
    const idTicket = ticketForm.dataset.id;

    const form = createForm();
    form.querySelector(".form-title").textContent = "Изменить тикет";
    this.desk.append(form);
    btn.setAttribute("disabled", "");

    const url = `http://localhost:7070?method=ticketById&id=${idTicket}`;
    let ticket;
    try {
      const response = await fetch(url);
      if (this.checkResponse(response)) {
        ticket = await this.checkJson(response);
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    if (ticket) {
      form.querySelector(".name").value = ticket.name;
      form.querySelector(".description").value = ticket.description;
    }

    const btnCancel = form.querySelector(".btn-cancel");

    this.cancelCh = this.cancelChange.bind(this, form, btnCancel, btn);
    this.changeTickReq = this.changeTicketRequest.bind(
      this,
      form,
      btnCancel,
      btn,
      idTicket,
      ticketForm,
    );

    btnCancel.addEventListener("click", this.cancelCh);
    form.addEventListener("submit", this.changeTickReq);
  }

  // Метод-реакция на нажатие кнопки "Отмена" на форме редактирования тикета.
  // Удаляет слушатели с кнопок "Ок" и "Отмена", удаляет форму редактирования тикета,
  // разблокирует нажатие кнопки "Редактировать".
  cancelChange(form, btnCancel, btn) {
    btnCancel.removeEventListener("click", this.cancelCh);
    form.removeEventListener("submit", this.changeTickReq);
    form.remove();
    btn.removeAttribute("disabled", "");
  }

  // Метод-реакция на нажатие кнопки "Ок" на форме редактирования тикета.
  // Передает данные формы на сервер, получает в ответ данные измененного тикета,
  // отображает тикет на странице и закрывает форму редактирования тикета.
  async changeTicketRequest(form, btnCancel, btn, idTicket, ticketForm, e) {
    e.preventDefault();
    const url = `http://localhost:7070?method=changeTicket`;
    const data = {
      id: idTicket,
      name: form.querySelector(".name").value,
      description: form.querySelector(".description").value,
    };
    const param = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    let ticket;
    try {
      const response = await fetch(url, param);
      if (this.checkResponse(response)) {
        ticket = await this.checkJson(response);
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    if (ticket) {
      if (ticketForm.classList.contains("full")) {
        const description = ticketForm.querySelector(".p-description");
        description.textContent = ticket.description;
      }
      const name = ticketForm.querySelector(".p-name");
      name.textContent = ticket.name;
    }
    this.cancelChange(form, btnCancel, btn);
  }

  // Метод-реакция на нажатие кнопки "Удалить" на тикете.
  // Блокирует повторное нажатие кнопки "Удалить", создает форму
  // для удаления тикета, ждет нажатия кнопок "Ок" или "Отмена".
  deleteTicket(e) {
    const btn = e.target;
    const ticketForm = btn.closest(".ticket");
    const idTicket = ticketForm.dataset.id;

    const form = deleteForm();
    this.desk.append(form);
    btn.setAttribute("disabled", "");

    const btnCancel = form.querySelector(".btn-cancel");

    this.cancelDel = this.cancelDelete.bind(this, form, btnCancel, btn);
    this.deleteTickReq = this.deleteTicketRequest.bind(
      this,
      form,
      btnCancel,
      btn,
      idTicket,
      ticketForm,
    );

    btnCancel.addEventListener("click", this.cancelDel);
    form.addEventListener("submit", this.deleteTickReq);
  }

  // Метод-реакция на нажатие кнопки "Отмена" на форме удаления тикета.
  // Удаляет слушатели с кнопок "Ок" и "Отмена", удаляет форму удаления тикета,
  // разблокирует нажатие кнопки "Удалить".
  cancelDelete(form, btnCancel, btn) {
    btnCancel.removeEventListener("click", this.cancelDel);
    form.removeEventListener("submit", this.deleteTickReq);
    form.remove();
    btn.removeAttribute("disabled", "");
  }

  // Метод-реакция на нажатие кнопки "Ок" на форме удаления тикета.
  // Передает id тикета на сервер, при положительном ответе - удаляет тикет
  // со страницы и закрывает форму удаления тикета.
  async deleteTicketRequest(form, btnCancel, btn, idTicket, ticketForm, e) {
    e.preventDefault();

    const url = `http://localhost:7070?method=deleteTicket&id=${idTicket}`;
    const param = {
      method: "DELETE",
    };
    let answer;
    try {
      const response = await fetch(url, param);
      if (this.checkResponse(response)) {
        answer = response;
      }
    } catch (e) {
      console.error("Ошибка:", e);
    }
    if (answer.status === 204) {
      ticketForm.remove();
    }

    this.cancelDelete(form, btnCancel, btn);
  }
}
