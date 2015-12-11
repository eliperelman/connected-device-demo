(() => {
  'use strict';

  let $deviceList = document.getElementById('device-list');
  let $loading = document.querySelector('.inner.loading');
  let url;
  let $processes;

  let get = (endpoint) => fetch(`${url}${endpoint}`, { method: 'GET', mode: 'cors' }).then(r => r.json());
  let post = (endpoint) => fetch(`${url}${endpoint}`, { method: 'POST', mode: 'cors' });
  let del = (endpoint) => fetch(`${url}${endpoint}`, { method: 'DELETE', mode: 'cors' });
  let stream = (endpoint, callback) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${url}${endpoint}`, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState > 2) {
        callback(xhr.responseText);
      }
    };
    xhr.send();
  };

  let showLoading = el => {
    el.setAttribute('hidden', 'hidden');
    $loading.removeAttribute('hidden');
  };
  let hideLoading = el => {
    $loading.setAttribute('hidden', 'hidden');
    el.removeAttribute('hidden');
  };

  let processes = () => {
    get('/processes')
      .then(processes => {
        if (!$processes) {
          hideLoading(document.querySelector('.processes'));
          $processes = new Vue({
            el: '#processes',
            data: { processes }
          });
          document.getElementById('processes').removeAttribute('hidden');
        } else {
          $processes.processes = processes;
        }
      });
  };

  let logs = () => {
    let el = document.querySelector('#logs');

    stream('/logs', (chunk) => {
      let node = document.createTextNode(chunk);
      el.appendChild(node);
      el.scrollTop = el.scrollHeight;
    });
  };

  $deviceList.addEventListener('click', e => {
    if (!e.target.classList.contains('list-group-item')) {
      return;
    }

    url += `/devices/${e.target.getAttribute('id')}`;

    showLoading($deviceList);
    document.getElementById('processes-link').click();
  });

  let anchors = Array.from(document.querySelectorAll('.masthead-nav a'));

  anchors.forEach(el => {
    el.addEventListener('click', e => {
      anchors.forEach(a => a.parentNode.classList.remove('active'));
      e.preventDefault();
      Array.from(document.querySelectorAll('.cover')).forEach(el => {
        el.setAttribute('hidden', 'hidden');
        el.parentNode.classList.remove('active');
      });
      e.target.parentNode.classList.add('active');
      let selector = e.target.getAttribute('data-selector');

      if (selector !== '.processes') {
        hideLoading(document.querySelector(selector));
      }
    });
  });

  document.querySelector('table').addEventListener('click', e => {
    if (!e.target.classList.contains('kill')) {
      return;
    }

    e.preventDefault();

    let anchor = e.target;
    let url = anchor.getAttribute('href');

    del(url);
  });

  let processesLink = document.querySelector('[data-selector=".processes"]');

  processesLink.addEventListener('click', function handler(e) {
    processesLink.removeEventListener('click', handler);
    e.preventDefault();
    setInterval(() => processes(), 2000);
  });

  document.querySelector('[data-selector=".logs"]').addEventListener('click', e => {
    e.preventDefault();
    logs();
  });

  Array.from(document.querySelectorAll('.service-action')).forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      let endpoint = e.target.getAttribute('href');
      post(endpoint);
    });
  });

  document.getElementById('host-form').addEventListener('submit', e => {
    e.preventDefault();
    url = `http://${document.getElementById('host').value}:8080`;
    e.target.setAttribute('hidden', 'hidden');

    get('/devices')
      .then(devices => {
        new Vue({
          el: '#device-list',
          data: { devices }
        });

        $deviceList.removeAttribute('hidden');
      });
  });

})();
