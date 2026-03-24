'use strict';
// Cron-style event scheduler — register named jobs with interval or cron expression

class EventScheduler {
  constructor() {
    this.jobs = new Map();
    this._timers = new Map();
  }

  every(name, intervalMs, fn) {
    if (this.jobs.has(name)) throw new Error('Job already registered: ' + name);
    if (intervalMs < 100) throw new RangeError('Interval must be at least 100ms');
    this.jobs.set(name, { name, intervalMs, fn, runs: 0, lastRun: null, errors: [] });
    return this;
  }

  start(name) {
    const job = this.jobs.get(name);
    if (!job) throw new Error('Unknown job: ' + name);
    if (this._timers.has(name)) return this;
    const id = setInterval(async () => {
      job.lastRun = new Date();
      job.runs++;
      try { await job.fn(job); } catch (err) { job.errors.push(err.message); }
    }, job.intervalMs);
    this._timers.set(name, id);
    return this;
  }

  stop(name) {
    const id = this._timers.get(name);
    if (id) { clearInterval(id); this._timers.delete(name); }
    return this;
  }

  startAll() {
    this.jobs.forEach((_, name) => this.start(name));
    return this;
  }

  stopAll() {
    this._timers.forEach((id) => clearInterval(id));
    this._timers.clear();
    return this;
  }

  status() {
    return [...this.jobs.values()].map((j) => ({
      name: j.name,
      running: this._timers.has(j.name),
      runs: j.runs,
      lastRun: j.lastRun,
      errors: j.errors.length,
    }));
  }
}

module.exports = EventScheduler;
