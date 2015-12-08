(() => {
  'use strict';

  let url = 'http://localhost:8080/devices/*';
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

  let processes = () => {
    get('/processes')
      .then(processes => {
        if (!$processes) {
          document.getElementById('processes').removeAttribute('hidden');
          $processes = new Vue({
            el: '#processes',
            data: { processes }
          });
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
      document.querySelector(selector).removeAttribute('hidden');
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

  document.querySelector('[data-selector=".processes"]').addEventListener('click', e => {
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
})();
