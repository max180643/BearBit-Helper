interface detailUrlParameter {
  torrentId: string;
  hashinfo: string;
}

function extractDetailsUrlParameter(url: string): detailUrlParameter {
  const data: detailUrlParameter = {
    torrentId: '',
    hashinfo: ''
  };

  const validUrl = url.includes('/details.php');
  if (validUrl) {
    const params = url.match(/\?(.*)$/);
    if (params) {
      const queryString = params[0];
      const urlSearchParams = new URLSearchParams(queryString);

      data.torrentId = urlSearchParams.get('id') ?? '';
      data.hashinfo = urlSearchParams.get('hashinfo') ?? '';
    }
  }

  return data;
}

export type { detailUrlParameter };
export { extractDetailsUrlParameter };
