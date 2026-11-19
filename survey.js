(function () {
  var form = document.getElementById('survey');
  var send = document.getElementById('send');
  var err = document.getElementById('err');
  var QS = ['q0', 'q1', 'q2', 'q3', 'q4'];

  // "Clear selection" links, like Google Forms
  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (QS.indexOf(n) > -1) form.querySelector('[data-clear="' + n + '"]').classList.remove('hidden');
  });
  form.querySelectorAll('[data-clear]').forEach(function (b) {
    b.addEventListener('click', function () {
      form.querySelectorAll('input[name="' + b.dataset.clear + '"]').forEach(function (i) { i.checked = false; });
      b.classList.add('hidden');
    });
  });

  function val(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.textContent = '';
    if (form.website.value) return; // bot

    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = 'That email looks off. Fix it or leave it blank.';
      form.email.focus();
      return;
    }
    if (phone && phone.replace(/\D/g, '').length < 7) {
      err.textContent = 'That phone number looks too short. Fix it or leave it blank.';
      form.phone.focus();
      return;
    }

    var answers = {};
    QS.forEach(function (q) { answers[q] = val(q); });
    var empty = QS.every(function (q) { return !answers[q]; }) && !email && !phone;
    if (empty) {
      err.textContent = 'Nothing to send yet. Answer anything you like, then submit.';
      return;
    }

    var payload = { action: 'submit', answers: answers, contact: { email: email, phone: phone } };
    send.disabled = true;
    send.textContent = 'Sending…';

    var url = (window.LETTERED_CONFIG || {}).endpoint;
    var req = url && url.indexOf('PASTE') === -1
      ? fetch(url, { method: 'POST', body: JSON.stringify(payload) })
      : Promise.resolve(console.warn('No endpoint set in config.js. Submission not saved.', payload));

    req.then(function () {
      form.classList.add('hidden');
      document.getElementById('intro').classList.add('hidden');
      if (email || phone) document.getElementById('doneMsg').textContent =
        "You're on the early access list. We'll only reach out when there's something worth hearing.";
      var d = document.getElementById('done');
      d.classList.remove('hidden');
      d.focus();
      window.scrollTo({ top: 0 });
    }).catch(function () {
      send.disabled = false;
      send.textContent = 'Submit';
      err.textContent = "Couldn't send. Check your connection and try again.";
    });
  });
})();
