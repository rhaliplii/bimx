// Comportamentul care, pe bimx.md, depindea de server: formulare și partajare.
(function () {
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var MSG = EN ? 'This feature is currently unavailable.' : 'Această funcție nu este disponibilă momentan.';

  // Formularele marcate la build (căutare, newsletter, contact) nu trimit date nicăieri.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.hasAttribute || !form.hasAttribute('data-unavailable')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var note = form.querySelector('.replica-note');
    if (!note) {
      note = document.createElement('p');
      note.className = 'replica-note';
      note.setAttribute('role', 'status');
      note.style.cssText = 'margin:8px 0 0;font-size:14px;color:#b42318';
      form.appendChild(note);
    }
    note.textContent = MSG;
  }, true);

  // Linkurile marcate la build (autentificarea) afișează același mesaj, fără să părăsească pagina.
  var toast;
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-unavailable]');
    if (!link) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!toast) {
      toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100000;' +
        'background:#1A1F67;color:#fff;padding:12px 20px;border-radius:8px;font-size:15px;' +
        'box-shadow:0 8px 24px rgba(0,0,0,.2);transition:opacity .3s';
      document.body.appendChild(toast);
    }
    toast.textContent = MSG;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.style.opacity = '0'; }, 3000);
  }, true);

  // Partajarea folosește adresa paginii curente.
  function share() {
    var url = location.href.split('#')[0];
    document.querySelectorAll('[data-share-base]').forEach(function (a) {
      a.href = a.getAttribute('data-share-base') + encodeURIComponent(url) + (a.getAttribute('data-share-rest') || '');
    });
    document.querySelectorAll('[data-share-self]').forEach(function (b) {
      b.setAttribute('data-link', url);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', share);
  else share();
})();
