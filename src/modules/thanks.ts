import { fetchData, responseTextDecode } from '../utils/http';

async function enableAutoThanks(): Promise<void> {
  const path = window.location.pathname;
  if (path === '/details.php') {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const torrentId = urlSearchParams.get('id') ?? '';

    const thanksRequest = document.getElementById('saythanks');
    if (thanksRequest && torrentId) {
      try {
        const response = await sendThanksRequest(torrentId);
        const body = await responseTextDecode(response, 'TIS-620');

        if (body.includes('กดขอบคุณ')) {
          const thanksGuideElement = document.querySelector(
            'body > table.mainouter > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td.rowhead > font'
          ) as HTMLElement;
          thanksGuideElement.style.color = '#D91BEA';
          thanksGuideElement.innerHTML = 'Download';
          const thanksRequestParentElement =
            thanksRequest.parentNode as HTMLElement;
          thanksRequestParentElement.remove();
        }

        if (body.includes('ผิดพลาด')) {
          throw new Error('fail to thanks / already thanks');
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

async function sendThanksRequest(torrentId: string): Promise<Response> {
  try {
    const url = `${window.location.origin}/ajax.php?action=say_thanks&id=${torrentId}`;
    const bodyResponse = await fetchData(url);
    return bodyResponse;
  } catch (error) {
    throw new Error('fail to thanks / already thanks');
  }
}

export { enableAutoThanks, sendThanksRequest };
