if (typeof WeakSet !== 'function') {
  (function () {
    var defineProperty = Object.defineProperty;
    var counter = Date.now() % 1e9;

    function WeakSet() {
      this.name = '__ws__' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
    }

    WeakSet.prototype.add = function (value) {
      if (isObject(value)) {
        defineProperty(value, this.name, {
          value: true,
          writable: true
        });
      } else {
        throw new TypeError('Invalid value used in weak set');
      }
      return this;
    };

    WeakSet.prototype.delete = function (value) {
      return isObject(value) && !(value[this.name] = false);
    };

    WeakSet.prototype.has = function (value) {
      return isObject(value) && !!value[this.name];
    };

    function isObject(value) {
      return typeof value === 'object' && value !== null;
    }

    window.WeakSet = WeakSet;
  })();
}