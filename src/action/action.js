let target, host, timer, timeoutId, continueButton, closeButton, waited = false;

async function navigate() {
  const { timers, settings } = await browser.storage.sync.get();
  timers[host] = Date.now();
  await browser.storage.sync.set({ timers });
  if (settings.reintervene) browser.alarms.create(host, { delayInMinutes: settings.timeout });

  browser.runtime.sendMessage('resolve');
  window.open(target, '_self')?.focus();
}
function onTimeout() {
  continueButton.removeAttribute('disabled');
  continueButton.onclick = navigate;
  waited = true;
}
function pause() {
  if (!waited) {
    timer.style.animationPlayState = 'paused';
    timer.classList.remove('animate-wait');
    clearTimeout(timeoutId);
  }
}
function restart() {
  if (!waited) {
    timer.classList.add('animate-wait');
    timer.style.animationPlayState = 'running';
    timeoutId = window.setTimeout(onTimeout, 8000);
  }
}

function closeExternally() { // workaround to use tabs api to close non-script-opened tabs
  browser.runtime.sendMessage('close');
}

const init = () => {
  target = window.location.search.replace('?url=', '');
  host = (new URL(target)).hostname;

  document.title = `Attempting to visit ${host}`;
  document.querySelectorAll('.host').forEach(span => span.innerText = host);

  timer = document.getElementById('timer');
  continueButton = document.getElementById('continue');
  closeButton = document.getElementById('close');

  closeButton.addEventListener('click', closeExternally);

  if (document.hasFocus()) timeoutId = window.setTimeout(onTimeout, 8000);

  window.onblur = pause;
  window.onfocus = restart;
};

init();