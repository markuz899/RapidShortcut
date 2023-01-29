document.addEventListener(
  "DOMContentLoaded",
  () => {
    let container = document.querySelector(".content");
    let service = document.querySelector(".services");
    let addButton = document.querySelector(".add-app");
    let alert = document.querySelector(".alert");
    let textAllert = alert.querySelector("p");

    addButton.addEventListener("click", () => {
      addButton.classList.add("d-none");
      createService();
    });

    const showAllert = (text, level, time) => {
      alert.classList.add(level);
      alert.classList.remove("d-none");
      textAllert.innerHTML = text;
      setTimeout(() => {
        alert.classList.add("d-none");
        alert.classList.remove(level);
      }, time);
    };

    const loadServices = async () => {
      let existServices;
      // await removeObjectFromLocalStorage("services");
      const localService = await getObjectFromLocalStorage("services");
      if (localService && localService.length > 0) {
        let res = JSON.parse(localService);
        existServices = [...res];
        createScreen(existServices);
      } else {
        service.innerHTML = "Please add services";
      }
    };

    // show block input and save button
    const createService = () => {
      let existServices = [];
      const contentCreate = document.createElement("div");
      const title = document.createElement("h1");
      const contentAppRow = document.createElement("div");
      const inputName = document.createElement("input");
      const inputToken = document.createElement("input");
      const saveButton = document.createElement("button");
      const cancelButton = document.createElement("button");

      contentCreate.classList.add("content-create");
      title.innerHTML = "Insert service";
      contentAppRow.classList.add("content-create-row");

      inputName.setAttribute("type", "text");
      inputName.setAttribute("id", "name");
      inputName.setAttribute("name", "name_service");
      inputName.setAttribute("placeholder", "Typed name");

      inputToken.setAttribute("type", "text");
      inputToken.setAttribute("id", "service");
      inputToken.setAttribute("name", "token_service");
      inputToken.setAttribute("placeholder", "Typed token");

      saveButton.classList.add("save-service-button");
      saveButton.innerHTML = "Save";

      cancelButton.classList.add("cancel-service-button");
      cancelButton.innerHTML = "Cancel";

      contentAppRow.appendChild(inputName);
      contentAppRow.appendChild(inputToken);
      contentAppRow.appendChild(saveButton);
      contentAppRow.appendChild(cancelButton);
      contentCreate.appendChild(title);
      contentCreate.appendChild(contentAppRow);
      container.appendChild(contentCreate);

      saveButton.addEventListener("click", async () => {
        let serviceName = contentCreate.querySelector("#name");
        let serviceToken = contentCreate.querySelector("#service");

        if (serviceName.value !== "" && serviceToken.value !== "") {
          const localService = await getObjectFromLocalStorage("services");

          if (localService && localService.length) {
            let res = JSON.parse(localService);
            existServices = [...res];
          }

          existServices.push({
            serviceName: serviceName.value,
            serviceToken: serviceToken.value,
          });

          await saveObjectInLocalStorage({
            services: JSON.stringify(existServices),
          });

          addButton.classList.remove("d-none");
          contentCreate.remove();
          showAllert("Saved", "success", 1000);
          loadServices();
        } else {
          showAllert("Please insert name and token", "warning", 1000);
        }
      });

      cancelButton.addEventListener("click", () => {
        addButton.classList.remove("d-none");
        contentCreate.remove();
      });
    };

    // create dom element show services
    const createScreen = (services) => {
      if (services.length > 0) {
        service.innerHTML = "";
        services.forEach((item, i) => {
          let app = document.createElement("div");
          let title = document.createElement("h1");
          let row = document.createElement("div");
          let input = document.createElement("input");
          let btnShow = document.createElement("button");
          let btnCopy = document.createElement("button");
          let btnDelete = document.createElement("button");
          let btnSave = document.createElement("button");

          let iconShow = document.createElement("img");
          let iconCopy = document.createElement("img");
          let iconDelete = document.createElement("img");
          let iconSave = document.createElement("img");

          iconShow.src = "./images/eye.png";
          iconCopy.src = "./images/copy.png";
          iconDelete.src = "./images/trash.png";
          iconSave.src = "./images/checked.png";

          app.classList.add("content-app");
          row.classList.add("content-app-row");
          title.innerHTML = item.serviceName || "";

          input.setAttribute("id", i);
          input.setAttribute("type", "password");
          input.value = item.serviceToken || "";
          input.setAttribute("disabled", true);

          btnShow.classList.add("btn-info");
          btnShow.classList.add("hide");
          btnShow.setAttribute("id", i);
          btnShow.appendChild(iconShow);

          btnCopy.classList.add("btn-warning");
          btnCopy.setAttribute("id", i);
          btnCopy.appendChild(iconCopy);

          btnDelete.classList.add("btn-error");
          btnDelete.setAttribute("id", i);
          btnDelete.classList.add("d-none-visible");
          btnDelete.appendChild(iconDelete);

          btnSave.classList.add("btn-success");
          btnSave.setAttribute("id", i);
          btnSave.classList.add("d-none-visible");
          btnSave.appendChild(iconSave);

          row.appendChild(input);
          row.appendChild(btnSave);
          row.appendChild(btnDelete);
          row.appendChild(btnShow);
          row.appendChild(btnCopy);
          app.appendChild(title);
          app.appendChild(row);

          service.appendChild(app);

          btnShow.addEventListener("click", (ev) => {
            if (input.type === "password") {
              input.type = "text";
              input.disabled = false;
              btnShow.classList.remove("hide");
              btnSave.classList.remove("d-none-visible");
              btnDelete.classList.remove("d-none-visible");
            } else {
              input.type = "password";
              input.disabled = true;
              btnShow.classList.add("hide");
              btnSave.classList.add("d-none-visible");
              btnDelete.classList.add("d-none-visible");
            }
          });

          btnCopy.addEventListener("click", (ev) => {
            console.log(input.value);
            navigator.clipboard.writeText(input.value);
            showAllert("Copy to clipboard", "warning", 500);
          });

          btnDelete.addEventListener("click", async () => {
            const localService = await getObjectFromLocalStorage("services");
            if (localService.length) {
              let res = JSON.parse(localService);
              let data = res.filter((_, i) => i !== Number(input.id));
              await saveObjectInLocalStorage({
                services: JSON.stringify(data),
              });
              showAllert("Deleted", "error", 500);
              loadServices();
            }
          });

          btnSave.addEventListener("click", async () => {
            const localService = await getObjectFromLocalStorage("services");
            if (localService.length) {
              let res = JSON.parse(localService);
              let data = res.find((el) => el.serviceName === title.textContent);
              data.serviceToken = input.value;
              await saveObjectInLocalStorage({
                services: JSON.stringify(res),
              });
              showAllert("Saved", "success", 1000);
              loadServices();
            }
          });
        });
      }
    };

    const getObjectFromLocalStorage = async function (key) {
      return new Promise((resolve, reject) => {
        try {
          chrome.storage.sync.get(key, function (value) {
            resolve(value[key]);
          });
        } catch (ex) {
          reject(ex);
        }
      });
    };

    const saveObjectInLocalStorage = async function (obj) {
      return new Promise((resolve, reject) => {
        try {
          chrome.storage.sync.set(obj, function () {
            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });
    };

    const removeObjectFromLocalStorage = async function (keys) {
      return new Promise((resolve, reject) => {
        try {
          chrome.storage.sync.remove(keys, function () {
            resolve();
          });
        } catch (ex) {
          reject(ex);
        }
      });
    };

    loadServices();
  },
  false
);
