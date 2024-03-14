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

export { fetchData, responseText, responseTextDecode, parseDocument };
