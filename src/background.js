let globalTimers = {};

function navigateListener(details) {
  const url = new URL(details.url);
  const expiry = globalTimers[url.hostname] || 0;
  if (expiry > Date.now()) return;
  browser.tabs.update(details.tabId, { loadReplace: false, url: encodeURI(`action/action.html?url=${url.href}`) });
}

const eventUrlFilter = hosts => Object.values(hosts).map(host => ({ hostEquals: host }));
const updateNavigateListeners = hosts => {
  url = eventUrlFilter(hosts);
  console.log(url);

  if (url.length) {
    browser.webNavigation.onBeforeNavigate.addListener(navigateListener, { url });
  }
}

const init = async () => {
  let { hosts, timers } = await browser.storage.sync.get();

  if (typeof hosts === 'undefined' || typeof timers === 'undefined') {
    hosts ??= {};
    timers ??= {};
    browser.storage.sync.set({ hosts, timers });
  }

  console.log(hosts, timers);

  globalTimers = timers;
  updateNavigateListeners(hosts);
}

browser.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'menu/menu.html' });
  }
});

browser.storage.onChanged.addListener((changes, areaName) => {
  const { hosts, timers } = changes;

  timers?.newValue && (globalTimers = timers?.newValue);
  if (areaName !== 'sync' || typeof hosts === 'undefined') return;

  browser.webNavigation.onBeforeNavigate.removeListener(navigateListener);

  updateNavigateListeners(hosts.newValue);
});

browser.runtime.onMessage.addListener((message, { envType, tab }) => { // workaround to use tabs api to close non-script-opened tabs
  if (message === 'close' && envType === 'addon_child') {
    browser.tabs.remove(tab.id);
  }
});

init();

