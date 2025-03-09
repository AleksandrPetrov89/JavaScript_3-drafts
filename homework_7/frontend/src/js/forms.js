// Функция, которая создает html-структуру тикета
export function createFormTicket() {
  const ticket = document.createElement("div");
  ticket.classList.add("ticket");
  ticket.innerHTML = `
    <button type="button" class="btn-ticket checkbox"> </button>
    <div class="ticket-text ticket-description">
      <p class="ticket-text p-name"></p>
    </div>
    <p class="ticket-text p-timestamp"></p>
    <button type="button" class="btn-ticket btn-edit-ticket"> </button>
    <button type="button" class="btn-ticket btn-delete-ticket">x</button>`;
  return ticket;
}

// Функция, которая создает html-структуру окна создания/редактирования тикета
export function createForm() {
  const form = document.createElement("form");
  form.classList.add("form");
  form.innerHTML = `
    <p class="form-title"></p>
    <div class="form-content">
      <label>
        <p>Краткое описание</p>
        <input type="text" class="name" required>
      </label>
      <label>
        <p>Подробное описание</p>
        <textarea class="description" required></textarea>
      </label>
      <div class="form-btn-box">
        <button type="button" class="btn btn-cancel">Отмена</button>
        <button type="submit" class="btn btn-ok">Ok</button>
      </div>
    </div>`;
  return form;
}

// Функция, которая создает html-структуру окна удаления тикета
export function deleteForm() {
  const form = document.createElement("form");
  form.classList.add("form");
  form.innerHTML = `
    <p class="form-title">Удалить тикет</p>
    <div class="form-content">
      <label>
        <p>
          Вы уверены, что хотите удалить тикет?\n
          Это действие необратимо!
        </p>
      </label>
      <div class="form-btn-box">
        <button type="button" class="btn btn-cancel">Отмена</button>
        <button type="submit" class="btn btn-ok">Ok</button>
      </div>
    </div>`;
  return form;
}
