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
    path === '/viewbrsb.php'
  ) {
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
        const cameraIcon = row.querySelector(
          '[title="รูปภาพตัวอย่าง"], [title="รูปภาพ"]'
        ) as HTMLElement;

        if (cameraIcon) {
          const imageWidth = '120px';
          const imageHeight = '150px';

          const cell = cameraIcon?.parentNode?.parentNode as HTMLElement;
          const torrentDetailUrl = cell.querySelector('a')?.href ?? '';
          const details = extractDetailsUrlParameter(torrentDetailUrl);

          const cache: PosterDetails = await getCacheData(
            details.torrentId,
            DB_POSTER_OBJECT_NAME
          );

          if (cache) {
            const image = createImageElement(
              cache?.image,
              imageWidth,
              imageWidth
            );
            newCell.appendChild(image);
            newCell.setAttribute('bearbit-screenshot', 'preview');
            blurNsfwHandler();
          } else {
            const imageUrl =
              (cameraIcon.parentNode as HTMLAnchorElement).href ?? '';
            const extension = imageUrl.split('.').pop() ?? '';

            if (allowedExtensions.indexOf(extension) !== -1) {
              const image = createImageElement(
                imageUrl,
                imageWidth,
                imageHeight
              );
              newCell.appendChild(image);
              newCell.setAttribute('bearbit-screenshot', 'preview');
              blurNsfwHandler();

              // set cache
              try {
                const imageBlob = await fetchImage(imageUrl);
                const imageBase64 = await convertBlobToBase64(imageBlob);

                const cacheData: PosterDetails = {
                  id: details.torrentId,
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
                  imageWidth
                );
                newCell.appendChild(image);
                newCell.setAttribute('bearbit-screenshot', 'no-preview');
              } else {
                const imageUrl = 'https://i.imgur.com/eScU17W.png';
                const image = createImageElement(
                  imageUrl,
                  imageWidth,
                  imageHeight
                );
                image.style.marginLeft = '10px';
                newCell.appendChild(image);
                newCell.setAttribute('bearbit-screenshot', 'no-preview');

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

export { enableScreenshot, disableScreenshot };
