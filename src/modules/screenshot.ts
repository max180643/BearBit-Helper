import { blurNsfwHandler } from '../content';
import {
  addCacheData,
  CACHE_DEFAULT_EXPIRE,
  DB_POSTER_OBJECT_NAME,
  getCacheData,
  PosterDetails
} from '../utils/cache';
import { convertBlobToBase64, fetchImage } from '../utils/http';
import { extractDetailsUrlParameter } from '../utils/url';
import { enableBlurNsfw } from './nsfw';

const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

function enableScreenshot(blurNsfw: boolean) {
  const path = window.location.pathname;
  if (
    path === '/' ||
    path === '/index.php' ||
    path === '/viewno18sb.php' ||
    path === '/viewno18sbx.php' ||
    path === '/viewbrsb.php'
  ) {
    prepareScreenshotModal();
    fixCameraIconNoAttribute();

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
    path === '/viewno18sbx.php' ||
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

async function insertScreenshotCellInTable(table: HTMLTableElement) {
  if (table) {
    for (let i = 0, row; (row = table.rows[i]); i++) {
      const cellIndex = 1;
      const newCell = row.insertCell(cellIndex);
      const siblingCell = newCell.nextSibling as HTMLElement;

      newCell.setAttribute('bearbit-helper', 'screenshot');
      newCell.setAttribute('width', '350px');
      newCell.setAttribute('align', 'center');
      newCell.setAttribute(
        'bgcolor',
        siblingCell.getAttribute('bgcolor') ?? ''
      );

      if (i === 0) {
        newCell.classList.add('colhead');
        newCell.textContent = 'รูปภาพตัวอย่าง';
      } else {
        // add loading image
        const imageLoading = 'loading';
        const imageWidth = '35px';
        const imageHeight = '35px';

        const cache: PosterDetails = await getCacheData(
          imageLoading,
          DB_POSTER_OBJECT_NAME
        );

        if (cache) {
          const image = createImageElement(
            cache?.image,
            imageWidth,
            imageWidth
          );
          newCell.appendChild(image);
        } else {
          const imageUrl = 'https://i.imgur.com/ik6XnmF.gif';
          const image = createImageElement(imageUrl, imageWidth, imageHeight);
          newCell.appendChild(image);

          // set cache
          try {
            const imageBlob = await fetchImage(imageUrl);
            const imageBase64 = await convertBlobToBase64(imageBlob);

            const cacheData: PosterDetails = {
              id: imageLoading,
              image: imageBase64
            };
            addCacheData(
              cacheData,
              CACHE_DEFAULT_EXPIRE,
              DB_POSTER_OBJECT_NAME
            );
          } catch (error) {
            console.error(error);
          }
        }

        newCell.setAttribute('bearbit-screenshot', `loading#${i}`);
      }
    }

    addScreenshotImage();
  }
}

function addScreenshotImage() {
  const loadingImage = document.querySelectorAll(
    '[bearbit-screenshot^="loading#"]'
  );

  if (loadingImage) {
    loadingImage.forEach(elem => {
      addScreenshotImageToCell(elem as HTMLTableCellElement);
    });
  }
}

async function addScreenshotImageToCell(cell: HTMLTableCellElement) {
  const tableRow = cell?.parentNode as HTMLElement;
  const cameraIcon = tableRow.querySelector(
    '[title="รูปภาพตัวอย่าง"], [title="รูปภาพ"]'
  ) as HTMLElement;

  if (cameraIcon) {
    const imageWidth = '120px';
    const imageHeight = '150px';

    const fileDetailCell = cameraIcon?.parentNode?.parentNode as HTMLElement;
    const torrentDetailUrl = fileDetailCell.querySelector('a')?.href ?? '';
    const details = extractDetailsUrlParameter(torrentDetailUrl);

    const cache: PosterDetails = await getCacheData(
      details.torrentId,
      DB_POSTER_OBJECT_NAME
    );

    if (cache) {
      const image = createImageElement(cache?.image, imageWidth, imageHeight);
      image.style.cursor = 'pointer';
      image.onclick = () => {
        openScreenshotModal(cache?.image);
      };
      cell.innerHTML = '';
      cell.appendChild(image);
      cell.setAttribute('bearbit-screenshot', 'preview');
      blurNsfwHandler();
    } else {
      const imageUrl = (cameraIcon.parentNode as HTMLAnchorElement).href ?? '';
      const extension = imageUrl.split('.').pop() ?? '';

      if (allowedExtensions.indexOf(extension) !== -1) {
        const image = createImageElement(imageUrl, imageWidth, imageHeight);
        image.style.cursor = 'pointer';
        image.onclick = () => {
          openScreenshotModal(imageUrl);
        };
        cell.innerHTML = '';
        cell.appendChild(image);
        cell.setAttribute('bearbit-screenshot', 'preview');
        blurNsfwHandler();

        // set cache
        try {
          const imageBlob = await fetchImage(imageUrl);
          const imageBase64 = await convertBlobToBase64(imageBlob);

          const cacheData: PosterDetails = {
            id: details.torrentId,
            image: imageBase64
          };
          addCacheData(cacheData, CACHE_DEFAULT_EXPIRE, DB_POSTER_OBJECT_NAME);
        } catch (error) {
          console.error(error);
        }
      } else {
        const imageNoPreview = 'nopreview';
        const imageWidth = '64px';
        const imageHeight = '64px';

        const cache: PosterDetails = await getCacheData(
          imageNoPreview,
          DB_POSTER_OBJECT_NAME
        );

        if (cache) {
          const image = createImageElement(
            cache?.image,
            imageWidth,
            imageHeight
          );
          cell.innerHTML = '';
          cell.appendChild(image);
          cell.setAttribute('bearbit-screenshot', 'no-preview');
        } else {
          const imageUrl = 'https://i.imgur.com/eScU17W.png';
          const image = createImageElement(imageUrl, imageWidth, imageHeight);
          image.style.marginLeft = '10px';
          cell.innerHTML = '';
          cell.appendChild(image);
          cell.setAttribute('bearbit-screenshot', 'no-preview');

          // set cache
          try {
            const imageBlob = await fetchImage(imageUrl);
            const imageBase64 = await convertBlobToBase64(imageBlob);

            const cacheData: PosterDetails = {
              id: imageNoPreview,
              image: imageBase64
            };
            addCacheData(
              cacheData,
              CACHE_DEFAULT_EXPIRE,
              DB_POSTER_OBJECT_NAME
            );
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  }
}

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

function fixCameraIconNoAttribute() {
  const cameraIcons = document.querySelectorAll("[src='pic/cams.gif ']");
  cameraIcons.forEach(icon => {
    const title = icon.getAttribute('title');
    if (!title) {
      icon.setAttribute('title', 'รูปภาพตัวอย่าง');
    }
  });
}

function prepareScreenshotModal() {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'screenshot-modal';
  modalDiv.style.display = 'none';
  modalDiv.style.position = 'fixed';
  modalDiv.style.zIndex = '9999';
  modalDiv.style.left = '0';
  modalDiv.style.top = '0';
  modalDiv.style.width = '100%';
  modalDiv.style.height = '100%';
  modalDiv.style.overflow = 'auto';
  modalDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
  modalDiv.onclick = closeScreenshotModal;

  const modalContent = document.createElement('div');
  modalContent.style.margin = 'auto';
  modalContent.style.display = 'block';
  modalContent.style.height = '100%';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '700px';
  modalContent.style.maxHeight = '100%';

  const closeContainer = document.createElement('div');
  closeContainer.style.display = 'flex';
  closeContainer.style.justifyContent = 'end';
  closeContainer.style.padding = '12px 0px';

  const closeButton = document.createElement('span');
  closeButton.style.color = '#fff';
  closeButton.style.fontSize = '28px';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.cursor = 'pointer';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = closeScreenshotModal;

  const imgContainer = document.createElement('div');
  imgContainer.style.display = 'flex';
  imgContainer.style.justifyContent = 'center';
  imgContainer.style.alignItems = 'center';
  imgContainer.style.height = '90%';

  const imgContent = document.createElement('div');
  imgContent.style.display = 'flex';
  imgContent.style.justifyContent = 'center';
  imgContent.style.maxHeight = '90%';

  const img = document.createElement('img');
  img.id = 'screenshot-modal-image';
  img.style.maxWidth = '70%';
  img.style.height = 'auto';

  imgContent.appendChild(img);
  imgContainer.appendChild(imgContent);
  closeContainer.appendChild(closeButton);
  modalContent.appendChild(closeContainer);
  modalContent.appendChild(imgContainer);
  modalDiv.appendChild(modalContent);

  document.body.appendChild(modalDiv);
}

function openScreenshotModal(imgSrc: string) {
  const image = document.getElementById('screenshot-modal-image');
  const modal = document.getElementById('screenshot-modal');
  if (modal && image) {
    (image as HTMLImageElement).src = imgSrc;
    modal.style.display = 'block';
  }
}

function closeScreenshotModal() {
  const image = document.getElementById('screenshot-modal-image');
  const modal = document.getElementById('screenshot-modal');
  if (modal && image) {
    (image as HTMLImageElement).src = '';
    modal.style.display = 'none';
  }
}

export { enableScreenshot, disableScreenshot };
