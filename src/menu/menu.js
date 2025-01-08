let timer, timeoutId, countdownTime, waited = false, timeout, reintervene, countdown;

function onTimeout() {
  if (!waited) {
    timer.parentElement.remove();

    const disabledSection = document.querySelector('.disabled');
    disabledSection.classList.remove('disabled');

    document.getElementById('add').addEventListener('click', addHost);
    document.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', removeHost);
    });
    document.querySelectorAll('[data-host]').forEach(input => {
      input.addEventListener('change', updateHost);
    });
    document.querySelectorAll(`[id*="open-"]`).forEach(button => button.addEventListener('click', function () {
      const { uuid } = this.closest('[data-uuid]').dataset;
      if (this.dataset.open) {
        this.dataset.open = '';
        document.getElementById(`config-${uuid}`).classList.replace('flex', 'hidden');
      } else {
        this.dataset.open = 'true';
        document.getElementById(`config-${uuid}`).classList.replace('hidden', 'flex');
      }
    }));
    timeout.addEventListener('change', async function ({ target }) {
      if (target.checkValidity()) {
        const { settings } = await browser.storage.sync.get('settings');

        settings.timeout = +target.value;
        browser.storage.sync.set({ settings }).then(console.log(`timeout setting adjusted to ${settings.timeout} mins`));
      }
    });
    reintervene.addEventListener('change', async function ({ target }) {
      const state = !!target.checked;
      const { settings } = await browser.storage.sync.get('settings');

      settings.reintervene = state;
      browser.storage.sync.set({ settings }).then(console.log(`reintervention setting changed to ${state}`));
    });
    countdown.addEventListener('change', async function ({ target }) {
      if (target.checkValidity()) {
        const { settings } = await browser.storage.sync.get('settings');

        settings.countdown = +target.value;
        browser.storage.sync.set({ settings }).then(console.log(`countdown setting adjusted to ${settings.countdown} seconds`));
      }
    });
    document.querySelectorAll('[disabled]').forEach(input => input.removeAttribute('disabled'));
    document.querySelector('[data-waiting]').removeAttribute('data-waiting');

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
    timeoutId = window.setTimeout(onTimeout, countdownTime);
  }
}

async function addHost() {
  const uuid = window.crypto.randomUUID();
  const { hosts } = await browser.storage.sync.get('hosts');

  hosts[uuid] = "not-a-real.hostname";
  const hostElement = newHost([uuid, 'host not set'], true);
  document.getElementById('hosts').append(hostElement);
  hostElement.querySelector('input').focus();

  browser.storage.sync.set({ hosts }).then(console.log(`host ${uuid} created`));
}
async function updateHost({ target }) {
  const { value } = target;
  const { uuid } = target.closest('[data-uuid]').dataset;
  const { hosts } = await browser.storage.sync.get('hosts');

  hosts[uuid] = value;
  document.getElementById('host-' + uuid).textContent = value;

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

const newHost = ([uuid, host], operable = false) => {
  const wrapper = document.createElement('div');
  typeof operable === 'number' && (operable = false); // since function is used as an array map, operable will otherwise be assigned the index;

  wrapper.innerHTML = `
    <li class="rounded-xl p-2 border-2 border-blue-500/25" data-uuid="${uuid}">
      <button id="open-${uuid}" class="group flex flex-row justify-between items-center w-full">
        <span></span>
        <h3 id="host-${uuid}">${host}</h3>
        <span class="group-data-[open=true]:rotate-180 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>
      <ul id="config-${uuid}" class="flex-col gap-2 divide-y-2 divide-blue-500/25 mt-2 hidden">
        <li class="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-between items-center">
          <label class="text-xl" for="hostname-${uuid}">hostname</label>
          <input type="text" data-has-icon placeholder="crouton.net" pattern="(?:www\\.)?[a-z\\d\\-]+\\.[a-z]{2,3}"
            class="bg-blue-100 text-blue-950" id="hostname-${uuid}" required value="${host}" data-host ${operable ? '' : 'disabled'}/>
        </li>
        <li class="flex flex-row justify-between items-center">
          <button data-remove
            class="mt-2 border-2 border-red-500 rounded-full p-2 flex flex-row justify-between items-center w-full text-red-500 text-xl">
            <span></span>
            <span>remove</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="size-8 text-red-500">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </li>
      </ul>
    </li>
  `;

  const hostElement = wrapper.firstElementChild;

  if (operable) {
    hostElement.querySelectorAll('[data-remove]').forEach(button => {
      button.addEventListener('click', removeHost);
    });
    hostElement.querySelectorAll('[data-host]').forEach(button => {
      button.addEventListener('change', updateHost);
    });
    hostElement.querySelector(`#open-${uuid}`).addEventListener('click', function () {
      if (this.dataset.open) {
        this.dataset.open = '';
        document.getElementById(`config-${uuid}`).classList.replace('flex', 'hidden');
      } else {
        this.dataset.open = 'true';
        document.getElementById(`config-${uuid}`).classList.replace('hidden', 'flex');
      }
    });
  }

  return hostElement;
};

const init = async () => {
  timer = document.getElementById('timer');

  const { hosts, settings } = await browser.storage.sync.get();
  countdownTime = settings.countdown * 1000;

  document.getElementById('animation-override').textContent = `
    .animate-wait {
      animation: wait ${settings.countdown}s ease-in-out !important;
    }`;

  const hostElements = Object.entries(hosts).map(newHost);
  timeout = document.getElementById('timeout');
  reintervene = document.getElementById('reintervene');
  countdown = document.getElementById('countdown');

  document.getElementById('hosts').replaceChildren(...hostElements);
  timeout.value = settings.timeout;
  countdown.value = settings.countdown;
  settings.reintervene && reintervene.setAttribute('checked', '');

  document.querySelectorAll('button.tab').forEach(tab => {
    const target = tab.getAttribute('target');
    tab.addEventListener('click', function () {
      document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
      const section = document.getElementById(target);
      section.classList.add('flex');
      section.classList.remove('hidden');

      document.querySelectorAll('button.tab').forEach(sectionTab => sectionTab.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
    });
  });

  if (window.location.search === '?popup=true') {
    document.body.style.width = '360px';
  }

  timeoutId = window.setTimeout(onTimeout, countdownTime);

  window.onblur = pause;
  window.onfocus = restart;
};

init();