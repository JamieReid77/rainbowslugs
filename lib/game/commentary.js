/**
 * Paced race commentary — queues lines so callouts aren't overwritten instantly.
 */
export class Commentary {
  /**
   * @param {HTMLElement} el
   * @param {{ onShow?: (msg: string, meta?: object) => void }} [hooks]
   */
  constructor(el, hooks = {}) {
    this.el = el;
    this.hooks = hooks;
    /** @type {{ msg: string, priority: number, hold: number, meta?: object }[]} */
    this.queue = [];
    this.busy = false;
    this._timer = 0;
    this.minGap = 400;
    this.defaultHold = 2600;
  }

  clear() {
    clearTimeout(this._timer);
    this.queue = [];
    this.busy = false;
    this.el.textContent = "";
    this.el.classList.remove("flash");
  }

  /**
   * @param {string} msg
   * @param {{ priority?: number, hold?: number, meta?: object }} [opts]
   */
  say(msg, opts = {}) {
    const priority = opts.priority ?? 0;
    const hold = opts.hold ?? this.defaultHold;
    const entry = { msg, priority, hold, meta: opts.meta };

    // High priority (finish / DNF) jumps the queue
    if (priority >= 2) {
      this.queue = this.queue.filter((q) => q.priority >= 2);
      this.queue.unshift(entry);
      if (this.busy && priority >= 3) {
        clearTimeout(this._timer);
        this.busy = false;
      }
    } else {
      // Drop duplicate spam
      if (this.queue.some((q) => q.msg === msg)) return;
      if (this.el.textContent === msg && this.busy) return;
      this.queue.push(entry);
    }
    this._pump();
  }

  _pump() {
    if (this.busy || this.queue.length === 0) return;
    this.busy = true;
    // Highest priority first, then FIFO among equals
    this.queue.sort((a, b) => b.priority - a.priority);
    const next = this.queue.shift();
    if (!next) {
      this.busy = false;
      return;
    }

    this.el.textContent = next.msg;
    this.el.classList.remove("flash");
    void this.el.offsetWidth;
    this.el.classList.add("flash");
    this.hooks.onShow?.(next.msg, next.meta);

    this._timer = window.setTimeout(() => {
      this.busy = false;
      this._timer = window.setTimeout(() => this._pump(), this.minGap);
    }, next.hold);
  }
}
