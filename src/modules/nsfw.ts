const nsfwCategory = [
  '901',
  '902',
  '903',
  '904',
  '905',
  '906',
  '907',
  '908',
  '910',
  '911',
  '912'
];

function enableBlurNsfw() {
  const path = window.location.pathname;

  if (
    path === '/' ||
    path === '/index.php' ||
    path === '/viewno18sb.php' ||
    path === '/viewbrsb.php'
  ) {
    const screenshots = document.querySelectorAll(
      '[bearbit-screenshot="preview"]:not([bearbit-nsfw="checked"])'
    );

    if (screenshots) {
      screenshots.forEach(td => {
        const row = td.parentNode;
        if (row) {
          // get category id
          const category = row.querySelector('td > a') as HTMLLinkElement;
          let categoryId = '';
          if (category) {
            const categoryUrl = category.href.split('?').pop() ?? '';
            const categoryParams = new URLSearchParams(categoryUrl);
            categoryId = categoryParams.get('cat') ?? '';
          }
          // blur nsfw
          if (nsfwCategory.indexOf(categoryId) !== -1) {
            const img = td.firstElementChild;
            if (img) {
              (img as HTMLImageElement).style.filter = 'blur(5px)';
            }
          }
        }
        td.setAttribute('bearbit-nsfw', 'checked');
      });
    }
  }
}

function disableBlurNsfw() {
  const path = window.location.pathname;

  if (
    path === '/' ||
    path === '/index.php' ||
    path === '/viewno18sb.php' ||
    path === '/viewbrsb.php'
  ) {
    const screenshots = document.querySelectorAll(
      '[bearbit-screenshot="preview"] > img'
    );

    if (screenshots) {
      screenshots.forEach(img => {
        const styles = window.getComputedStyle(img);
        if (styles.getPropertyValue('filter')) {
          (img as HTMLImageElement).style.removeProperty('filter');
        }
        const td = img.parentNode;
        (td as HTMLElement).removeAttribute('bearbit-nsfw');
      });
    }
  }
}

export { enableBlurNsfw, disableBlurNsfw };
