// Datele de piață pentru ticker, panoul de piață, top-uri și grafic, fără serverul bimx.md.
// Tema le cere prin fetch('/wp-admin/admin-ajax.php?action=…'); aici răspundem din snapshot-ul
// window.BIMX_MARKET_DATA (generat la build din src/bimx-mirror/data/market.json).
(function () {
  var data = window.BIMX_MARKET_DATA || {};
  var nativeFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var m = url.match(/admin-ajax\.php\?action=([^#]+)$/);
    if (m) {
      var key = decodeURIComponent(m[1]);
      var body = Object.prototype.hasOwnProperty.call(data, key) ? data[key]
        : key.indexOf('get_bimx_chart') === 0 ? [] : null;
      if (body !== null) {
        return Promise.resolve(new Response(JSON.stringify(body), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        }));
      }
    }
    return nativeFetch ? nativeFetch(input, init) : Promise.reject(new TypeError('fetch unavailable'));
  };
})();
