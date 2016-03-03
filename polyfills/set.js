if (typeof Set === 'undefined') {
  (function () {
    function Set(values) {
      if (!(this instanceof Set))
        return new Set(values);

      // init
      this.clear();

      if (values) {
        if (typeof values.forEach === 'function') {
          values.forEach(function (v) {
            this.add(v);
          }, this);
        } else {
          throw new TypeError(values + ' is not iterable');
        }
      }
    }

    Set.prototype.add = function(value) {
      var val = transformValue(value);
      if (isString(val))
        this._map[val] = true;
      else
        this._arr.indexOf(val) < 0 && this._arr.push(val);
      return this;
    };

    Set.prototype.delete = function(value) {
      var val = transformValue(value);
      var idx = null;
      if (isString(val))
        return this._map[val]
          && !(this._map[val] = false);
      else
        return (idx = this._arr.indexOf(val)) >= 0
          && this._arr.splice(idx, 1);
    };

    Set.prototype.has = function(value) {
      var val = transformValue(value);
      return isString(val)
        ? this._map[val]
        : this._arr.indexOf(val) >= 0;
    };

    Set.prototype.clear = function() {
      this._map = Object.create(null);
      this._arr = [];
    };

    Object.defineProperty(Set.prototype, 'size', {
      get: function get() {
        return this._arr.length + Object.keys(this._map).length;
      }
    });

    Set.prototype.keys = Set.prototype.values = function () {};

    Set.prototype.forEach = function (callback, thisArg) {
      this._map.map(function (v) {
          return restoreValue(v);
      }).concat(this._arr).forEach(callback, thisArg);
    };

    function isString(val) {
      return typeof val === 'string';
    }

    function transformValue(value) {
      switch (typeof value) {
        case 'number':
        case 'boolean':
        case 'undefined':
          return '' + value;
        case 'string':
          return '$' + value;
        case 'object':
        case 'function':
        default:
          return value === null ? 'null' : value;
      }
    }

    function restoreValue(value) {
      if (isString(value)) {
        switch (value) {
          case 'null':
            return null;
          case 'NaN':
            return NaN;
          case 'undefined':
            return undefined;
          case 'true':
          case 'false':
            return value;
          default:
            if (value[0] === '$')
              return value.slice(1);
            else
              return Number(value);
        }
      }
      return value;
    }
  })();
}