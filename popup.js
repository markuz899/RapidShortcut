document.addEventListener(
  "DOMContentLoaded",
  () => {
    let input = document.querySelector("#tokenInput");
    let inputBit = document.querySelector("#tokenBitInput");
    let inputClone = document.querySelector("#clone");
    let inputBitClone = document.querySelector("#clone_bit");
    let saveButton = document.querySelector("#saveButton");
    let copyButton = document.querySelector("#copyIt");
    let copyBitButton = document.querySelector("#copyBit");
    let checkIcon = document.querySelector(".content-confirm");
    let checkMsg = document.querySelector("#confirm-message");
    let eyeIcon = document.querySelectorAll(".show");

    chrome.storage.sync.get(["tokenGit"], function (result) {
      input.value = result.tokenGit;
      inputClone.value = result.tokenGit;
    });

    chrome.storage.sync.get(["tokenBit"], function (result) {
      inputBit.value = result.tokenBit;
      inputBitClone.value = result.tokenBit;
    });

    let setting = {
      eyeGit: input,
      eyeBit: inputBit,
    };

    input.addEventListener("input", (ev) => {
      saveButton.style.display = "block";
      inputClone.value = ev.target.value;
    });

    inputBit.addEventListener("input", (ev) => {
      saveButton.style.display = "block";
      inputBitClone.value = ev.target.value;
    });

    eyeIcon.forEach((item) => {
      item.addEventListener("click", () => {
        switch (setting[item.id].type) {
          case "password":
            setting[item.id].type = "text";
            break;
          case "text":
            setting[item.id].type = "password";
            break;
          default:
            break;
        }
      });
    });

    saveButton.addEventListener(
      "click",
      () => {
        let value = inputClone.value;
        let valueBit = inputBitClone.value;
        chrome.storage.sync.set({ tokenGit: value }, function () {
          inputClone.select();
          document.execCommand("copy");
          inputClone.blur();
          checkMsg.innerHTML = "Saved & Copied!";
          checkIcon.style.display = "flex";
          setTimeout(() => {
            checkIcon.style.display = "none";
          }, 2000);
        });
        chrome.storage.sync.set({ tokenBit: valueBit }, function () {
          inputBitClone.select();
          document.execCommand("copy");
          inputBitClone.blur();
          checkMsg.innerHTML = "Saved & Copied!";
          checkIcon.style.display = "flex";
          setTimeout(() => {
            checkIcon.style.display = "none";
          }, 2000);
        });
        saveButton.style.display = "none";
        input.type = "password";
        inputBit.type = "password";

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

    copyBitButton.addEventListener(
      "click",
      () => {
        inputBitClone.select();
        document.execCommand("copy");
        inputBitClone.blur();

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
