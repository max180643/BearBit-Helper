// AutoThanks
async function enableAutoThanks() {
  // -- check url path
  if (window.location.pathname === "/details.php") {
    // -- get detail id
    const urlSearchParams = new URLSearchParams(window.location.search);
    const detailsId = urlSearchParams.get("id");
    // -- check already thanks
    const thanksRequest = document.getElementById("saythanks");
    if (thanksRequest) {
      // -- send thanks request
      try {
        const response = await fetch(
          `${window.location.origin}/ajax.php?action=say_thanks&id=${detailsId}`
        );

        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const body = new TextDecoder("TIS-620").decode(uint8Array);

        if (body.includes("กดขอบคุณ")) {
          // -- clean thanks request (remove element)
          // -- top element
          const thanksGuideElement = document.querySelector(
            "body > table.mainouter > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td.rowhead > font"
          );
          thanksGuideElement.setAttribute("color", "#D91BEA");
          thanksGuideElement.innerHTML = "Download";
          // -- bottom element
          const thanksRequestParentElement = thanksRequest.parentNode;
          thanksRequestParentElement.remove();
        }
        if (body.includes("ผิดพลาด")) {
          throw new Error("fail to thanks / already thanks");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

function autoThanksHandler() {
  chrome.storage.sync.get("autoThanksEnabled", function (data) {
    const enabled = data.autoThanksEnabled || false;

    if (enabled) {
      enableAutoThanks();
    }
  });
}

// Screenshot
function enableScreenshot() {
  // -- check url path
  if (
    window.location.pathname === "/viewno18sb.php" ||
    window.location.pathname === "/viewbrsb.php"
  ) {
    // -- get table element
    const table = document.querySelector(
      "body > table.mainouter > tbody > tr:nth-child(3) > td > table"
    );
    // -- check table exists
    if (table) {
      // -- create new column
      for (let i = 0, row; (row = table.rows[i]); i++) {
        const cellIndex = 1;
        const newCell = row.insertCell(cellIndex);
        const siblingCell = newCell.nextElementSibling;
        newCell.setAttribute("width", 120);
        newCell.setAttribute("align", "center");
        newCell.setAttribute("bgcolor", siblingCell.getAttribute("bgcolor"));
        if (i === 0) {
          // -- first row
          newCell.classList.add("colhead");
          newCell.textContent = "รูปภาพตัวอย่าง";
        } else {
          // -- other row
          // -- get screenshot href
          const ss = row.querySelector(
            '[title="รูปภาพตัวอย่าง"], [title="รูปภาพ"]'
          );
          const extension = ss.parentNode.href.split(".").pop();
          if (
            extension === "jpg" ||
            extension === "jpeg" ||
            extension === "png" ||
            extension === "gif"
          ) {
            let img = document.createElement("img");
            img.src = ss.parentNode.href;
            img.style.maxWidth = "120px";
            img.style.maxHeight = "150px";
            newCell.appendChild(img);
          } else {
            let img = document.createElement("img");
            img.src = "https://i.imgur.com/eScU17W.png";
            img.style.maxWidth = "64px";
            img.style.maxHeight = "64px";
            img.style.marginLeft = "10px";
            newCell.appendChild(img);
          }
        }
      }
    }
  }
}

function disableScreenshot() {
  // -- check url path
  if (
    window.location.pathname === "/viewno18sb.php" ||
    window.location.pathname === "/viewbrsb.php"
  ) {
    // -- get table element
    const table = document.querySelector(
      "body > table.mainouter > tbody > tr:nth-child(3) > td > table"
    );
    // -- check table exists
    if (table) {
      // -- delete screenshot column
      const columnIndex = 1;
      for (let i = 0; i < table.rows.length; i++) {
        let cells = table.rows[i].getElementsByTagName("td");
        if (cells.length > columnIndex) {
          cells[columnIndex].parentNode.removeChild(cells[columnIndex]);
        }
      }
    }
  }
}

function screenshotHandler() {
  chrome.storage.sync.get("screenshotEnabled", function (data) {
    const enabled = data.screenshotEnabled || false;

    if (enabled) {
      enableScreenshot();
    } else {
      disableScreenshot();
    }
  });
}

// Listen for changes in the storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.autoThanksEnabled) {
    autoThanksHandler();
  }

  if (changes.screenshotEnabled) {
    screenshotHandler();
  }
});

// Init
function init() {
  autoThanksHandler();
  screenshotHandler();
}

init();
