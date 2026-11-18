/* ---------- bookmarklet link ---------- */

const bookmarkletLink = document.getElementById('bookmarklet-link') as HTMLAnchorElement | null;
if (bookmarkletLink) {
  const scriptUrl = new URL('bookmarklet.js', document.baseURI).href;
  bookmarkletLink.href = `javascript:(function(){var s=document.createElement('script');s.src=${JSON.stringify(
    scriptUrl,
  )}+'?t='+Date.now();document.body.appendChild(s);})();`;
  bookmarkletLink.addEventListener('click', (event) => {
    // Clicking the button on this page shouldn't run it here — it's meant to be dragged.
    event.preventDefault();
    window.alert(
      'Drag this button up into your bookmarks bar instead of clicking it. Then visit the site you want to check and click the bookmark there.',
    );
  });
}
