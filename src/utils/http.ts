async function fetchData(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }
  return response;
}

async function responseText(response: Response): Promise<string> {
  const content = await response.text();
  return content;
}

async function responseTextDecode(
  response: Response,
  type: 'TIS-620'
): Promise<string> {
  if (type === 'TIS-620') {
    const content = new TextDecoder(type).decode(
      new Uint8Array(await response.arrayBuffer())
    );
    return content;
  }
  return '';
}

function parseDocument(content: string): Document {
  const parser = new DOMParser();
  const document = parser.parseFromString(content, 'text/html');
  return document;
}

async function fetchImage(imageUrl: string): Promise<Blob> {
  const response = await fetch(
    'https://corsproxy.io/?' + encodeURIComponent(imageUrl)
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
}

export {
  fetchData,
  responseText,
  responseTextDecode,
  parseDocument,
  fetchImage,
  convertBlobToBase64
};
