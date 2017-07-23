
(function (window) {
  if ('URLSearchParams' in window) return;

  function URLSearchParams(init) {
    if (!(this instanceof URLSearchParams)) {
      return new URLSearchParams(init);
    }
    if (init instanceof URLSearchParams) {
      return new URLSearchParams(init.toString());
    }
    this.query = (typeof init === 'string' || init instanceof String)
      ? parseQuery(init)
      : Object.create(null);
  }

  URLSearchParams.prototype.append = function (name, value) {
    if (name in this.query) {
      this.query[name].push(value);
    } else {
      this.query[name] = [value];
    }
  };

  URLSearchParams.prototype['delete'] = function (name) {
    return delete this.query[name];
  };

  URLSearchParams.prototype.set = function (name, value) {
    this.query[name] = [value];
  };

  URLSearchParams.prototype.get = function (name) {
    var query = this.query;
    return name in query
      ? query[name][0]
      : null;
  };

  URLSearchParams.prototype.getAll = function (name) {
    return this.query[name] || null;
  };

  URLSearchParams.prototype.toString = function () {
    var pairs = [];
    var query = this.query;
    Object.keys(query).forEach(function (name) {
      var enc = encodeURIComponent(name);
      query[name].forEach(function (value) {
        pairs.push(enc + '=' + encodeURIComponent(value));
      });
    });
    return pairs.join('&');
  };

  function parseQuery(queryString) {
    var query = Object.create(null);
    var leading = queryString.lastIndexOf('?');
    queryString.slice(leading + 1).split('&').map(function (s) {
      var tmp = s.split('=');
      return [
        decodeURIComponent(tmp[0]),
        decodeURIComponent(tmp[1] || '')
      ];
    }).forEach(function (pair) {
      var name = pair[0];
      var value = pair[1];
      if (name in query) {
        query[name].push(value);
      } else {
        query[name] = [value];
      }
    });
    return query;
  }
  return window.URLSearchParams = URLSearchParams;
})(this);
