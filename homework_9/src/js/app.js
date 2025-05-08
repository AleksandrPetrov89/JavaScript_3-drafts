import "../css/collapsible.css";
import Collapse from "./classes/collapsible";

const title = "Collapse";
const text = `Легенда
  В рамках реализации большого портала вам необходимо сделать виджет
   "collapsible"-контейнеров, который может разворачиваться и сворачиваться.

  Описание
  Подобный виджет есть в рамках Bootstrap, но как мы с вами "знаем":
   "jQuery не нужен", поэтому вам нужно реализовать такой же виджет на чистом JS.`;

const parentElem = document.querySelector(".task-1");
const collapse = new Collapse(title, text);
collapse.placeWidget(parentElem);
