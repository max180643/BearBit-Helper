import { fetchData, parseDocument, responseTextDecode } from '../utils/http';
import { findCellIndexByValue } from '../utils/table';
import { sendThanksRequest } from './thanks';

async function enableDownloadButton(): Promise<void> {
  const path = window.location.pathname;
  if (path === '/viewno18sb.php' || path === '/viewbrsb.php') {
    const prevPage = document.querySelector('[title="หน้าที่แล้ว"]');
    const table = (prevPage?.parentNode?.parentNode as HTMLElement)
      .nextElementSibling as HTMLTableElement;

    if (table) {
      let cellValue = -1;
      for (let i = 0, row: HTMLTableRowElement; (row = table.rows[i]); i++) {
        if (i === 0) {
          // header row
          cellValue = findCellIndexByValue(row, 'ชื่อไฟล์');
        } else if (i !== -1) {
          // get cell - filename column
          const cells = row.getElementsByTagName('td');
          const filename = cells[cellValue];
          // get torrent detail url
          const torrentDetailUrl = filename.querySelector('a')?.href ?? '';
          const isValidTorrentDetailUrl =
            torrentDetailUrl.includes('/details.php');
          if (isValidTorrentDetailUrl) {
            // get torrent id / hash info
            const regex = torrentDetailUrl.match(/\?(.*)$/);
            if (regex) {
              const queryString = regex[0];
              const urlSearchParams = new URLSearchParams(queryString);
              const torrentId = urlSearchParams.get('id') ?? '';
              // const torrentHashInfo = urlSearchParams.get('hashinfo') ?? '';
              if (torrentDetailUrl && torrentId) {
                // add download button
                filename.appendChild(
                  generateDownloadButton(torrentDetailUrl, torrentId)
                );
              }
            }
          }
        }
      }
    }
  }
}

function disableDownloadButton() {
  const path = window.location.pathname;

  if (path === '/viewno18sb.php' || path === '/viewbrsb.php') {
    const downloadButtons = document.querySelectorAll(
      '[bearbit-helper="download-btn"]'
    );

    if (downloadButtons) {
      downloadButtons.forEach(elem => elem.remove());
    }
  }
}

function generateDownloadButton(
  torrentDetailUrl: string,
  torrentId: string
): HTMLButtonElement {
  const button = document.createElement('button');
  button.setAttribute('bearbit-helper', 'download-btn');
  button.style.display = 'block';
  button.style.borderRadius = '4px';
  button.style.backgroundColor = '#fcd34c';
  button.style.marginTop = '5px';
  button.style.cursor = 'pointer';
  button.style.border = '0';
  button.style.padding = '4px';
  button.style.boxShadow =
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
  button.addEventListener('mouseover', function () {
    button.style.backgroundColor = '#fde68a';
  });
  button.addEventListener('mouseout', function () {
    button.style.backgroundColor = '#fcd34c';
  });

  const span = document.createElement('span');
  span.textContent = 'Download+';
  span.style.margin = '4px';
  span.style.fontWeight = 'bold';
  span.style.color = '#2664ff';

  button.addEventListener('click', () =>
    thanksAndDownload(torrentDetailUrl, torrentId)
  );

  button.appendChild(span);

  return button;
}

async function thanksAndDownload(
  torrentDetailUrl: string,
  torrentId: string
): Promise<void> {
  // get torrent detail
  const bodyResponse = await fetchData(torrentDetailUrl);
  const htmlContent = await responseTextDecode(bodyResponse, 'TIS-620');
  const detailDocument = parseDocument(htmlContent);

  // get download url
  const download = detailDocument.querySelector(
    '[title="Download this file"]'
  ) as HTMLLinkElement;
  const downloadUrl = download.href;
  const downloadFilename = fixDownloadFilename(download.innerText);

  // send thanks request
  const response = await sendThanksRequest(torrentId);
  if (response.ok) {
    // download torrent
    await downloadFile(downloadUrl, downloadFilename);
  }
}

async function downloadFile(fileUrl: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    // Remove the anchor element after download
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

function fixDownloadFilename(filename: string) {
  let name = filename;
  name = name.replace('[email protected]', '');
  name = name.replace(/ /g, '_').replace('@', '_');
  if (!name.includes('.torrent')) {
    name = `${name}.torrent`;
  }
  return name;
}

export { enableDownloadButton, disableDownloadButton };
