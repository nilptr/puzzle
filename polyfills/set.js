if (typeof Set === 'undefined') {
  (function () {
    function Set(iterable) {
      if (!(this instanceof Set))
        return new Set(iterable);

      // init
      this.clear();

      var self = this;
      if (typeof iterable === 'object' && iterable !== null) {
        if (typeof iterable.forEach === 'function') {
          iterable.forEach(function (item) {
            self.add(item);
          });
        } else {
          throw new TypeError(' is not iterable');
        }
      }
    }

    Set.prototype.add = function(val) {
      switch (typeof val) {
        case 'number':
        case 'boolean':
        case 'undefined':
          if (!this._map[val])
            this._map[val] = true;
          break;
        case 'string':
          if (!this._map['$' + val])
            this._map['$' + val] = true;
          break;
        case 'object':
        case 'function':
        default:
          if (val === null && !this._map[val])
            this._map[val] = true;
          else if (this._arr.indexOf(val) < 0)
            this._arr.push(val);
          break;
      }
      return this;
    };

    Set.prototype.delete = function(val) {
      switch (typeof val) {
        case 'number':
        case 'boolean':
        case 'undefined':
          return this._map[val] && !(this._map[val] = false);
        case 'string':
          return this._map['$' + val] && !(this._map['$' + val] = false);
        case 'object':
        case 'function':
        default:
          var idx;
          return val === null
            ? (this._map[val] && !(this._map[val] = false))
            : ((idx = this._arr.indexOf(val)) > 0 && this._arr.splice(idx, 1));
      }
    };

    Set.prototype.has = function(val) {
      switch (typeof val) {
        case 'number':
        case 'boolean':
        case 'undefined':
          return !!this._map[val];
        case 'string':
          return !!this._map['$' + val];
        case 'object':
        case 'function':
        default:
          return val === null
            ? !!this._map['null']
            : this._arr.indexOf(val) > -1;
      }
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
  })();
}