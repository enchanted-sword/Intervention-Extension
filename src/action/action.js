let target, host, timer, timeoutId, continueButton, closeButton, waited = false;

function navigate() { window.open(target, '_self')?.focus(); }
async function onTimeout() {
  continueButton.removeAttribute('disabled');
  continueButton.onclick = navigate;

  const { timers } = await browser.storage.sync.get('timers');
  timers[host] = (Date.now() + 10800000);
  browser.storage.sync.set({ timers });

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

  timeoutId = window.setTimeout(onTimeout, 8000);

  window.onblur = pause;
  window.onfocus = restart;
};

init();