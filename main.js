let API = "http://localhost:8000/products";

let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let img = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");
// console.log(title, price, descr, img, btnAdd);
let list = document.querySelector("#product-list");

// ? - pagination
let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");
// console.log(paginationList, prev, next);
let currentPage = 1;
let pageTotalCount = 1;

// ? search
let searchInp = document.querySelector("#search");
let searchVal = "";

// ? блок куда добавляются карточки
btnAdd.addEventListener("click", async function () {
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };
  // проверка на заполненность
  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
  ) {
    alert("заполните все поля");
    return;
  }
  //   отправляем post запрос
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });
  // очищаем инпуты после добавления
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = " ";
  render();
});
// ? функция для отображения карточек продукта
async function render() {
  // получаем список продуктов с сервера
  let res = await fetch(`${API}?q=${searchVal}&_page=${currentPage}&_limit=3`);
  let products = await res.json();

  drawPaginationButtons();
  // console.log(products);
  list.innerHTML = ""; //ОЧИЩАЕМ list
  // перебираем массив products
  products.forEach((element) => {
    let newElem = document.createElement("div");
    // cоздаем новый div
    newElem.id = element.id;
    // создаем id новому div'у

    // помещаем карточку из бутстрапа в созданный div
    newElem.innerHTML = `<div class="card m-5" style="width: 18rem;">
    <img src="${element.image}" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${element.title}</h5>
      <p class="card-text">${element.descr}</p>
      <p class="card-text">${element.price}</p>
      <a href="#" id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
      <a href="#" id=${element.id} class="btn btn-warning btn-edit" data-bs-toggle="modal" data-bs-target="#exampleModal">EDIT</a>
    </div>
  </div>
        
    `;
    // добавляем созданный div с карточкой внутри в list
    list.append(newElem);
  });
}
render();
// вешаем слушатель событий на весь document
//? удаление продукта
document.addEventListener("click", (e) => {
  // делаем проверку, для того, чтобы отловить клик именно по елементу с классом btn-delete
  if (e.target.classList.contains("btn-delete")) {
    // вытаскиваем id
    console.log("delete clicked");
    let id = e.target.id;
    // делаем запрос на удаление
    fetch(`${API}/${id}`, { method: "DELETE" }).then(() => render());
    // вызываем render для отображения актуальных данных
  }
});

// ? переменные для инпутов: редактирование товаров
let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImg = document.querySelector("#edit-image");
let editBtnAdd = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");
// console.log(editTitle, editPrice, editDescr, editImg, editBtnAdd, exampleModal);

// редактирование продукта
// ОТЛАВЛИВАЕМ КЛИК ПО КНОПКЕ EDIT
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    let id = e.target.id;
    // получаем данные редактируемого продукта
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // заполняем инпуты модального окна, данными, которые стянули с сервера
        editTitle.value = data.title;
        editPrice.value = data.price;
        editDescr.value = data.descr;
        editImg.value = data.image;
        // задаем id кнопке save changes
        editBtnAdd.setAttribute("id", data.id);
      });
  }
});

//Функция для отправки отредактированных данных на сервер
editBtnAdd.addEventListener("click", function () {
  // вытаскиваем данные из инпутов модального окнв
  let id = this.id;
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImg.value;

  // проверка на заполненность
  if (!title.trim() || !descr.trim() || !price.trim() || !image.trim()) {
    alert("Заполните поля");
    return;
  }
  // формируем обьект на основе данных из инпута
  let editedProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };
  // вызываем функцию для сохранения на сервере
  // console.log(editedProduct);
  saveEdit(editedProduct, id);
});

// функция для сохранения на сервере
function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => render());
  // закрываем модальное окно
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// pagination ==================================================================

// функция для отрисовки кнопок пагинации
function drawPaginationButtons() {
  // отправляем запрос для получения общего кол-ва продуктов
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      // рассчитываем общее кол-во страниц
      // console.log(data);
      pageTotalCount = Math.ceil(data.length / 3);
      // console.log(pageTotalCount);
      paginationList.innerHTML = ""; //очищаем
      for (let i = 1; i <= pageTotalCount; i++) {
        // cоздаем кнопки с цифрами и для текущей страницы задаем класс active
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = ` <li class="page-item active"><a class="page-link page_number" href="#">${i}</a></li>`;

          paginationList.append(page1);
        } else {
          let page1 = document.createElement("li");
          page1.innerHTML = ` <li class="page-item"><a class="page-link page_number" href="#">${i}</a></li>`;

          paginationList.append(page1);
        }
      }
      // ? - красим в серый цвет prev/next кнопки
      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }
      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}
// слушатель событий для кнопки prev
prev.addEventListener("click", () => {
  //делаем проверку на то не находимся ли мы на первой странице
  if (currentPage <= 1) {
    return;
  }
  // если не находимся на первой странице, то перезаписываем CurrentPage и вызываем render
  currentPage--;
  render();
});
next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

document.addEventListener("click", function (e) {
  //отлавливаем клик по цифре пагинации
  if (e.target.classList.contains("page_number")) {
    // перезаписываем currentPage на то значение, которое содержит элемент, на который нажали
    currentPage = e.target.innerText;
    // вызываем render с
    render();
  }
});

//
searchInp.addEventListener("input", () => {
  searchVal = searchInp.value;
  render();
});
