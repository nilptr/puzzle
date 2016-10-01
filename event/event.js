define(function () {
  var wm = {};

  // 序列编号
  var seq = 1;
  // DOM Element 上保存编号的属性
  var seqKey = '__ev__' + (Math.random() * 1e9 >>> 0) + '__nilptr__';

  // 添加 handler 记录
  function addHandler(el, rcd) {
    if (el) {
      if (seqKey in el && el[seqKey] in wm) {
        wm[el[seqKey]].push(rcd);
      } else {
        el[seqKey] = seq;
        wm[seq++] = [rcd];
      }
    }
  }

  // 获取 handler 的记录
  function getHandlers(el) {
    if (el && seqKey in el)
      return wm[el[seqKey]] || [];
    else
      return [];
  }

  // 兼容性的 addEventListener 方法,仅支持冒泡
  function addEventListener(el, t, fn) {
    if (typeof el.addEventListener === 'function') {
      el.addEventListener(t, fn, false);
    } else if (typeof el.attachEvent === 'function') {
      el.attachEvent('on' + t, fn);
    }
  }

  // 兼容性的 removeEventListener 方法
  function removeEventListener(el, t, fn) {
    if (typeof el.removeEventListener === 'function') {
      el.removeEventListener(t, fn, false);
    } else if (typeof el.detachEvent === 'function') {
      el.detachEvent('on' + t, fn);
    }
  }

  // 包装为委托函数
  function delegatorWrap(selector, fn) {
    return function (event) {
      var els = this.querySelectorAll(selector);
      var target = event.target || event.srcElement;
      var i, el;
      for (i = 0; i < els.length; i++) {
        el = els[i];
        if (el === target || el.contains(target)) {
          return fn.apply(el, arguments);
        }
      }
    }
  }

  function addEventHandler(el, eventName, selector, fn) {
    var isDelegator = !!selector;

    var tmp = parseEvent(eventName);

    var t = tmp.t;
    var ns = tmp.ns;

    var handler = isDelegator ? delegatorWrap(selector, fn) : fn;
    addEventListener(el, t, handler);

    addHandler(el, {
      t: t, // type
      ns: ns, // namespace
      fn: fn, // param function
      isDelegator: isDelegator,
      selector: selector,
      handler: handler // event listener
    });
  }

  // 从记录中获得符合条件的 handler 记录
  function findMatchedHandlers(el, eventName, selector, fn) {
    var handlers = getHandlers(el);
    if (handlers.length === 0) return [];

    var isDelegator = !!selector;
    var tmp = parseEvent(eventName);
    var t = tmp.t;
    var ns = tmp.ns;

    return handlers
      .filter(function (h) {
        return h.t === t
          && (isDelegator === h.isDelegator)
          && (isDelegator ? h.selector === selector : true)
          && (!!ns ? h.ns === ns : true)
          && (!!fn ? h.fn === fn : true)
      });
  }

  function removeEventHandler(el, eventName, selector, fn) {
    var handlers = getHandlers(el);
    var matchedHandlers = findMatchedHandlers(el, eventName, selector, fn);

    matchedHandlers.forEach(function (h) {
      removeEventListener(el, h.t, h.handler);
      handlers.splice(handlers.indexOf(h), 1);
    });
  }

  var Event = {
    on: addEventHandler,
    off: removeEventHandler,
    // 添加一次性的事件监听函数,自动移除
    once: function once(el, event, fn) {
      function onceWrapper(e) {
        fn.apply(this, arguments);
        removeEventListener(el, event, onceWrapper);
      }
      addEventListener(el, event, onceWrapper);
    },

    // 工具函数
    addEventListener: addEventListener,
    removeEventListener: removeEventListener
  };

  return Event;
});