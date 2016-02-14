
// hold references of event handlers
// { element -> Set of handlers }
const wm = new WeakMap();

/**
 * parse an event string with optional namespace
 *
 * @param {string} event   - event string with optional namespace
 * @returns {object}
 */
function parseEvent(event) {
  let dotIndex = event.indexOf('.');
  return dotIndex < 0 ?
    { t: event, ns: null } :
    { t: event.slice(0, dotIndex), ns: event };
}

/**
 * wrap a function as delegator function
 *
 * @param {string} selector
 * @param {Function} fn
 * @returns {Function}
 */
function delegatorWrap(selector, fn) {
  return function (event) {
    let els = this.querySelectorAll(selector);
    let target = event.target || event.srcElement;
    for (let i = 0; i < els.length; i++) {
      let el = els[i];
      if (el === target || el.contains(target)) {
        return fn.apply(el, arguments);
      }
    }
  }
}

function bindEvent(el, eventName, selector, fn) {
  let isDelegator = !!selector;

  let {t, ns} = parseEvent(eventName);

  let handler = isDelegator ? delegatorWrap(selector, fn) : fn;
  if (el.addEventListener) {
    el.addEventListener(t, handler, false);
  } else if (el.attachEvent) {
    el.attachEvent('on' + t, handler);
  }

  let handlers = null;
  if (wm.has(el)) {
    handlers = wm.get(el);
  } else {
    handlers = new Set();
    wm.set(el, handlers);
  }
  handlers.add({
    t: t, // type
    ns: ns, // namespace
    fn: fn, // param function
    isDelegator: isDelegator,
    selector: selector,
    handler: handler // event listener
  });
}

/**
 * find matched handlers
 *
 * @param {EventTarget} el
 * @param {string} eventName
 * @param {string} selector
 * @param {Function} fn
 * @returns {*}
 */
function findHandlers(el, eventName, selector, fn) {
  if (!wm.has(el)) return [];

  let isDelegator = !!selector;
  let { t, ns } = parseEvent(eventName);

  return Array.from(wm.get(el))
    .filter(h => h.t === t
      && (isDelegator === h.isDelegator)
      && (isDelegator ? h.selector === selector : true)
      && (!!ns ? h.ns === ns : true)
      && (!!fn ? h.fn === fn : true)
    );
}

function removeEvent(el, eventName, selector, fn) {
  if (!wm.has(el)) return;

  let handlerSet = wm.get(el);
  let matchedHandlers = findHandlers(el, eventName, selector, fn);

  matchedHandlers.forEach(h => {
    if (el.removeEventListener) {
      el.removeEventListener(h.t, h.handler, false);
    } else if (el.detachEvent) {
      el.detachEvent('on' + h.t, h.handler);
    }
    handlerSet.delete(h);
  });
}

const Event = {
  on(el, eventName, fn) {
    bindEvent(el, eventName, null, fn);
  },

  off(el, eventName, fn) {
    removeEvent(el, eventName, null, fn)
  },

  delegate(el, eventName, selector, fn) {
    el.querySelectorAll(selector);
    bindEvent(el, eventName, selector, fn);
  },

  undelegate(el, eventName, selector, fn) {
    removeEvent(el, eventName, selector, fn);
  },

  once(el, event, fn) {
    function onceWrapper(e) {
      fn.apply(this, arguments);
      if (this.removeEventListener) {
        this.removeEventListener(event, onceWrapper, false);
      } else if (this.detachEvent) {
        this.detachEvent('on' + event, onceWrapper);
      }
    }
    if (el.addEventListener) {
      el.addEventListener(event, onceWrapper, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + event, onceWrapper);
    }
  },

  trigger() {
    //todo: trigger
  },

  _: {
    getTarget(e) {
      return e && e.target || e.srcElement;
    },
    preventDefault(e) {
      e.preventDefault ? e.preventDefault() : e.returnValue = false;
    }
  }
};

export default Event;