export default class Collapse {
  #title;
  #text;
  #button;
  #content;
  #box;
  #parentElem;

  constructor(title, text) {
    this.#title = title;
    this.#text = text;
    this.#createWidget();
  }

  #createWidget() {
    this.#button = document.createElement("button");
    this.#button.setAttribute("type", "button");
    this.#button.classList.add("button", "collapse-but");
    this.#button.textContent = this.#title;

    this.#content = document.createElement("div");
    this.#content.classList.add("collapse-content", "hidden");
    this.#content.innerHTML = `<p>${this.#text}</p>`;

    this.#box = document.createElement("div");
    this.#box.classList.add("collapse-box");
    this.#box.append(this.#button);
    this.#box.append(this.#content);
  }

  placeWidget(parentElem) {
    this.#parentElem = parentElem;
    this.#parentElem.append(this.#box);

    this.#button.addEventListener("click", () => {
      this.#content.classList.toggle("hidden");
    });
  }
}
