let globalTimers = {}, globalSettings = {
  timeout: 180,
  reintervene: true
};

function navigateListener(details) {
  const url = new URL(details.url);
  let expiry = globalTimers[url.hostname] || 0;
  expiry += (globalSettings.timeout * 60000);

  console.log(expiry);
  if (expiry < Date.now()) { // only redirect if the re-intervention timer is up
    browser.tabs.update(details.tabId, { loadReplace: false, url: encodeURI(`action/action.html?url=${url.href}`) });
  }
}

const updateNavigateListeners = hosts => {
  url = Object.values(hosts).map(host => ({ hostEquals: host }));
  console.log(url);

  if (url.length) {
    browser.webNavigation.onBeforeNavigate.addListener(navigateListener, { url });
  }
}

const init = async () => {
  let { hosts, timers, settings } = await browser.storage.sync.get();

  if (typeof hosts === 'undefined' || typeof timers === 'undefined' || typeof settings === 'undefined') {
    hosts ??= {};
    timers ??= {};
    settings ??= globalSettings
    browser.storage.sync.set({ hosts, timers, settings });
  }

  console.log(hosts, timers, settings);

  globalTimers = timers;
  globalSettings = settings;
  updateNavigateListeners(hosts);
}

browser.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'menu/menu.html' });
  }
});

browser.storage.onChanged.addListener((changes, areaName) => {
  const { hosts, timers, settings } = changes;
  console.log('storaged changed:', changes);

  timers?.newValue && (globalTimers = timers?.newValue);
  settings?.newValue && (globalSettings = settings.newValue);

  if (areaName === 'sync' && typeof hosts !== 'undefined') {
    browser.webNavigation.onBeforeNavigate.removeListener(navigateListener);
    updateNavigateListeners(hosts.newValue);
  }
});

browser.runtime.onMessage.addListener((message, { envType, tab }) => { // workaround to use tabs api to close non-script-opened tabs
  if (message === 'close' && envType === 'addon_child') {
    browser.tabs.remove(tab.id);
  }
});

init();

