let target, timer, timeoutId, continueButton, closeButton, waited = false;

function navigate() { window.open(target, '_self')?.focus(); }
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

const init = () => {
  target = window.location.search.replace('?url=', '');
  const host = (new URL(target)).hostname;

  document.title = `Attempting to visit ${host}`;
  document.querySelectorAll('.host').forEach(span => span.innerText = host);

  timer = document.getElementById('timer');
  continueButton = document.getElementById('continue');

  timeoutId = window.setTimeout(onTimeout, 8000);

  window.onblur = pause;
  window.onfocus = restart;
};

init();