let timer, timeoutId, waited = false;

function onTimeout() {
  if (!waited) {
    timer.parentElement.remove();
    document.querySelector('.disabled').classList.remove('disabled');

    document.getElementById('add').addEventListener(addHost);
    document.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', removeHost);
    });
    document.querySelectorAll('[data-host]').forEach(button => {
      button.addEventListener('change', updateHost);
    });

    waited = true;
  }
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

async function addHost() {
  const uuid = window.crypto.randomUUID();
  const { hosts } = await browser.storage.sync.get('hosts');

  hosts[uuid] = "";

  browser.storage.sync.set({ hosts }).then(console.log(`host ${uuid} created`));
}
async function updateHost({ target, value }) {
  const { uuid } = target.closest('[data-uuid]').dataset;
  const { hosts } = await browser.storage.sync.get('hosts');

  hosts[uuid] = value;

  browser.storage.sync.set({ hosts }).then(console.log(`host ${uuid} updated to ${value}`));
}
async function removeHost({ target }) {
  const { uuid } = target.closest('[data-uuid]').dataset;
  const { hosts } = await browser.storage.sync.get('hosts');
  const host = hosts[uuid];

  delete hosts[uuid];
  target.closest('[data-uuid]').remove();

  browser.storage.sync.set({ hosts }).then(console.log(`host ${uuid} (${host}) deleted`));
}


const init = () => {
  timer = document.getElementById('timer');

  timeoutId = window.setTimeout(onTimeout, 8000);

  window.onblur = pause;
  window.onfocus = restart;
};

init();