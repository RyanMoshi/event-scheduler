'use strict';

class OnceTrigger {
  constructor() {
    this._pending = new Map();
  }

  schedule(name, delayMs, fn) {
    if (this._pending.has(name)) throw new Error('Trigger already scheduled: ' + name);
    const id = setTimeout(async () => {
      this._pending.delete(name);
      try { await fn(); } catch (err) { console.error('[OnceTrigger] ' + name + ':', err.message); }
    }, delayMs);
    this._pending.set(name, { id, scheduledAt: Date.now(), delayMs });
    return this;
  }

  cancel(name) {
    const entry = this._pending.get(name);
    if (entry) { clearTimeout(entry.id); this._pending.delete(name); return true; }
    return false;
  }

  pending() {
    return [...this._pending.keys()];
  }
}

module.exports = OnceTrigger;
