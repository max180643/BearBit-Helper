import { enableBlurNsfw } from './nsfw';

const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

function createImageElement(
  src: string,
  maxWidth: string,
  maxHeight: string
): HTMLImageElement {
  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = maxWidth;
  img.style.maxHeight = maxHeight;
  return img;
}

function insertScreenshotCellInTable(table: HTMLTableElement) {
  if (table) {
    for (let i = 0, row; (row = table.rows[i]); i++) {
      const cellIndex = 1;
      const newCell = row.insertCell(cellIndex);
      const siblingCell = newCell.nextSibling as HTMLElement;

      newCell.setAttribute('bearbit-helper', 'screenshot');
      newCell.setAttribute('width', '120');
      newCell.setAttribute('align', 'center');
      newCell.setAttribute(
        'bgcolor',
        siblingCell.getAttribute('bgcolor') ?? ''
      );

      if (i === 0) {
        newCell.classList.add('colhead');
        newCell.textContent = 'รูปภาพตัวอย่าง';
      } else {
        let extension = '';

        const cameraIcon = row.querySelector(
          '[title="รูปภาพตัวอย่าง"], [title="รูปภาพ"]'
        ) as HTMLElement;

        if (cameraIcon) {
          extension =
            (cameraIcon.parentNode as HTMLAnchorElement).href
              .split('.')
              .pop() ?? '';
        }

        if (allowedExtensions.indexOf(extension) !== -1) {
          const img = createImageElement(
            (cameraIcon.parentNode as HTMLAnchorElement).href,
            '120px',
            '150px'
          );

          newCell.appendChild(img);
          newCell.setAttribute('bearbit-screenshot', 'preview');
        } else {
          const img = createImageElement(
            'https://i.imgur.com/eScU17W.png',
            '64px',
            '64px'
          );
          img.style.marginLeft = '10px';
          newCell.appendChild(img);
          newCell.setAttribute('bearbit-screenshot', 'no-preview');
        }
      }
    }
  }
}

function enableScreenshot(blurNsfw: boolean) {
  const path = window.location.pathname;
  if (
    path === '/' ||
    path === '/index.php' ||
    path === '/viewno18sb.php' ||
    path === '/viewbrsb.php'
  ) {
    const table = document.querySelector(
      '[title="รูปภาพตัวอย่าง"], [title="รูปภาพ"]'
    )?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;

    insertScreenshotCellInTable(table as HTMLTableElement);

    if (blurNsfw) {
      enableBlurNsfw();
    }
  }
}

function disableScreenshot() {
  const path = window.location.pathname;

  if (
    path === '/' ||
    path === '/index.php' ||
    path === '/viewno18sb.php' ||
    path === '/viewbrsb.php'
  ) {
    const screenshots = document.querySelectorAll(
      '[bearbit-helper="screenshot"]'
    );

    if (screenshots) {
      screenshots.forEach(elem => elem.remove());
    }
  }
}

export { enableScreenshot, disableScreenshot };
