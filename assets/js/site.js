// The Quest Team: progressive enhancements only. Every page works without this file.
(function () {
  // Keyword filter on Insights list pages.
  document.querySelectorAll('[data-filter]').forEach(function (input) {
    var list = document.querySelector(input.getAttribute('data-filter'));
    var count = document.querySelector('[data-count]');
    var empty = document.querySelector('[data-empty]');
    var items = Array.prototype.slice.call(list.children);
    var noun = count ? count.textContent.replace(/^\d+\s*/, '') : '';
    input.addEventListener('input', function () {
      var terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (li) {
        var hay = li.getAttribute('data-q') || '';
        var hit = terms.every(function (t) { return hay.indexOf(t) !== -1; });
        li.hidden = !hit;
        if (hit) shown++;
      });
      if (count) count.textContent = shown + ' ' + noun;
      if (empty) empty.hidden = shown !== 0;
    });
  });

  // Design-prototype build: disabled transactional links, and #anchors that open an Insights entry.
  document.querySelectorAll('a[data-disabled]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
  var openHash = function () {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView(); }
  };
  openHash();
  window.addEventListener('hashchange', openHash);

  // Expand / collapse all course-outline modules.
  document.querySelectorAll('[data-outline]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('data-outline') === 'open';
      document.querySelectorAll('.outline details').forEach(function (d) { d.open = open; });
    });
  });

  // Close the mobile menu after choosing an in-page link or pressing Escape.
  var menu = document.querySelector('.menu');
  if (menu) {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  }

  // Contact form: prefill from ?topic=&course=, show team size only for in-house, and hand off to email.
  var form = document.getElementById('contact');
  if (form) {
    var params = new URLSearchParams(location.search);
    var topic = params.get('topic');
    var course = params.get('course');
    if (topic) {
      var radio = form.querySelector('input[name="topic"][value="' + topic + '"]');
      if (radio) radio.checked = true;
    }
    if (course) form.course.value = course;
    var sizeField = form.querySelector('[data-show="inhouse"]');
    var syncTopic = function () {
      var t = form.querySelector('input[name="topic"]:checked').value;
      sizeField.hidden = t !== 'inhouse';
    };
    form.addEventListener('change', syncTopic);
    syncTopic();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('status');
      // Errors appear under the field that needs fixing; focus moves to the first one.
      var problems = [];
      var check = function (field, ok, msg) {
        var err = document.getElementById(field.id + '-err');
        err.hidden = ok; err.textContent = ok ? '' : msg;
        field.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) problems.push(field);
      };
      check(form.name, !!form.name.value.trim(), 'Add your name so we know who to reply to.');
      check(form.email, !!form.email.value && form.email.checkValidity(), 'Enter a work email, like name@company.com.');
      status.hidden = true;
      if (problems.length) { problems[0].focus(); return; }
      if (document.body.getAttribute('data-preview')) {
        status.hidden = false;
        status.textContent = 'This is a design prototype, so the message was not sent. To reach The Quest Team, call 408.261.3484 or email admin@questteam.com.';
        return;
      }
      var t = form.querySelector('input[name="topic"]:checked').parentNode.textContent.trim();
      var lines = [
        'Topic: ' + t,
        'Course: ' + (form.course.options[form.course.selectedIndex].text),
        'Name: ' + form.name.value,
        'Company: ' + form.company.value,
        'Email: ' + form.email.value,
        'Phone: ' + form.phone.value
      ];
      if (!sizeField.hidden) lines.push('Team size: ' + form.size.value);
      lines.push('', form.msg.value);
      status.hidden = false;
      status.textContent = 'Opening your email app with this message. If nothing opens, email admin@questteam.com or call 408.261.3484.';
      location.href = 'mailto:admin@questteam.com?subject=' + encodeURIComponent('Website enquiry: ' + t) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
