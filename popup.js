document.addEventListener(
  "DOMContentLoaded",
  () => {
    let input = document.querySelector("#tokenInput");
    let inputClone = document.querySelector("#clone");
    let saveButton = document.querySelector("#saveButton");
    let copyButton = document.querySelector("#copyIt");
    let checkIcon = document.querySelector(".content-confirm");
    let checkMsg = document.querySelector("#confirm-message");
    let eyeIcon = document.querySelector(".show");

    chrome.storage.sync.get(["token"], function (result) {
      input.value = result.token;
      inputClone.value = result.token;
    });

    input.addEventListener("input", (ev) => {
      saveButton.style.display = "block";
      inputClone.value = ev.target.value;
    });

    eyeIcon.addEventListener("click", () => {
      switch (input.type) {
        case "password":
          input.type = "text";
          break;
        case "text":
          input.type = "password";
          break;
        default:
          break;
      }
    });

    saveButton.addEventListener(
      "click",
      () => {
        let value = inputClone.value;
        chrome.storage.sync.set({ token: value }, function () {
          inputClone.select();
          document.execCommand("copy");
          inputClone.blur();
          checkMsg.innerHTML = "Saved & Copied!";
          checkIcon.style.display = "flex";
          setTimeout(() => {
            checkIcon.style.display = "none";
          }, 2000);
        });
        saveButton.style.display = "none";
        input.type = "password";

        // chrome.tabs.getSelected(null, function (tab) {
        //   alert("Save");
        // });
      },
      false
    );

    copyButton.addEventListener(
      "click",
      () => {
        inputClone.select();
        document.execCommand("copy");
        inputClone.blur();

        checkMsg.innerHTML = "Copied!";
        checkIcon.style.display = "flex";
        setTimeout(() => {
          checkIcon.style.display = "none";
        }, 2000);

        // chrome.tabs.getSelected(null, function (tab) {
        //   alert("is copied to clipboard");
        // });
      },
      false
    );
  },
  false
);
