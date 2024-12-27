function navigateListener(details) {
  const url = new URL(details.url);
  browser.tabs.update(details.tabId, { loadReplace: false, url: encodeURI(`action/action.html?url=${url.href}`) });
}

const init = async () => {
  let { hosts } = await browser.storage.sync.get('hosts') || {};

  if (typeof hosts === 'undefined') {
    hosts = {};
    browser.storage.sync.set({ hosts });
  }

  url = Object.values(hosts).map(host => ({ hostContains: host }));

  if (url.length) {
    browser.webNavigation.onBeforeNavigate.addListener(navigateListener, { url });
  }
}

browser.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'menu/menu.html' });
  }
});

init();

