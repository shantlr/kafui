import { logger } from '../../config';

export class Interval {
  /**
   *
   * @param {Object} options
   * @param {(input: { count: number }) => Promise<void> | void} options.handler
   * @param {number} [options.delay]
   */
  constructor({ name, handler, delay = 60 * 1000 }) {
    this.name = name;
    this.handler = handler;
    this.delay = delay;

    this.count = 0;

    this.intervalHandle = null;
    this.executing = false;

    this.ongoing = false;
  }

  updateNextDelay() {}

  /**
   * Start interval
   */
  async start() {
    if (this.ongoing) {
      return;
    }

    this.ongoing = true;
    logger.info(`[interval] ${this.name} started with delay ${this.delay}ms`);
    await this.exec();
    this.setupNextTimeout();
  }
  /**
   * Setup next call
   */
  setupNextTimeout() {
    if (!this.ongoing) {
      return;
    }

    if (this.intervalHandle) {
      clearTimeout(this.intervalHandle);
    }

    this.intervalHandle = setTimeout(async () => {
      try {
        await this.exec();
      } finally {
        this.intervalHandle = null;
        this.setupNextTimeout();
      }
    }, this.delay);
  }

  /**
   * Execute handler
   */
  async exec() {
    logger.info(`[interval] ${this.name}: start`);
    try {
      this.executing = true;
      await this.handler({
        count: this.count,
      });
      logger.info(`[interval] ${this.name}: done`);
    } catch (err) {
      logger.error(`[interval] ${this.name} failed: ${err.message}`);
    } finally {
      this.count += 1;
      this.executing = false;
    }
  }

  /**
   * Exec immediatly and reset timer
   */
  async flush() {
    if (!this.executing) {
      try {
        await this.exec();
      } finally {
        this.setupNextTimeout();
      }
    }
  }
}
