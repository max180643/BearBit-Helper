const allowedExtensions = ["jpg", "jpeg", "png", "gif"];

function createImageElement(src: string, maxWidth: string, maxHeight: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = maxWidth;
  img.style.maxHeight = maxHeight;
  return img;
}

function insertScreenshotCellInTable(tableSelector: string) {
  const table = document.querySelector(tableSelector) as HTMLTableElement;

  if (table) {
    for (let i = 0, row; (row = table.rows[i]); i++) {
      const cellIndex = 1;
      const newCell = row.insertCell(cellIndex);
      const siblingCell = newCell.nextElementSibling as HTMLElement;

      newCell.setAttribute("bearbit-helper", "screenshot");
      newCell.setAttribute("width", "120");
      newCell.setAttribute("align", "center");
      newCell.setAttribute("bgcolor", siblingCell.getAttribute("bgcolor") ?? "");

      if (i === 0) {
        newCell.classList.add("colhead");
        newCell.textContent = "รูปภาพตัวอย่าง";
      } else {
        const cameraIcon = row.querySelector('[title="รูปภาพตัวอย่าง"], [title="รูปภาพ"]') as HTMLElement;
        let extension = "";

        if (cameraIcon) {
          extension = (cameraIcon.parentNode as HTMLAnchorElement).href.split(".").pop() ?? ""
        }

        if (allowedExtensions.indexOf(extension) !== -1) {
          const img = createImageElement((cameraIcon.parentNode as HTMLAnchorElement).href, "120px", "150px");
          newCell.appendChild(img);
        } else {
          const img = createImageElement("https://i.imgur.com/eScU17W.png", "64px", "64px");
          img.style.marginLeft = "10px";
          newCell.appendChild(img);
        }
      }
    }
  }
}

function enableScreenshot() {
  const path = window.location.pathname;
  if (path === "/" || path === "/index.php") {
    insertScreenshotCellInTable("body > table.mainouter > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table:nth-child(6)");
  }

  if (path === "/viewno18sb.php" || path === "/viewbrsb.php") {
    insertScreenshotCellInTable("body > table.mainouter > tbody > tr:nth-child(3) > td > table");
  }
}

function disableScreenshot() {
  const path = window.location.pathname;
  
  if (path === "/" || path === "/index.php" || path === "/viewno18sb.php" || path === "/viewbrsb.php") {
    const screenshots = document.querySelectorAll('[bearbit-helper="screenshot"]');
    
    if (screenshots) {
      screenshots.forEach((elem) => elem.remove());
    }
  }
}

export { enableScreenshot, disableScreenshot }
