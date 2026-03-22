// =============================================================================
// watcher.js — File Watcher Module
// Monitors TypeScript source files and log output for changes in real-time.
// Uses chokidar for efficient cross-platform file watching.
// =============================================================================

import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} LogEntry
 * @property {string} id
 * @property {string} timestamp
 * @property {'ERROR'|'WARN'|'INFO'|'DEBUG'} level
 * @property {string} category
 * @property {string} service
 * @property {string} [method]
 * @property {string} message
 * @property {*} [data]
 * @property {number} [durationMs]
 */

/**
 * @typedef {Object} FileChangeEvent
 * @property {string} filePath - Absolute path of the changed file
 * @property {'add'|'change'|'unlink'} eventType
 * @property {number} timestamp
 */

export class Watcher extends EventEmitter {
  /** @type {chokidar.FSWatcher|null} */
  #sourceWatcher = null;

  /** @type {chokidar.FSWatcher|null} */
  #logWatcher = null;

  /** @type {string} */
  #projectRoot;

  /** @type {string} */
  #logFilePath;

  /** @type {number} */
  #lastLogSize = 0;

  /** @type {boolean} */
  #running = false;

  /**
   * @param {string} projectRoot - Absolute path to the project root
   */
  constructor(projectRoot) {
    super();
    this.#projectRoot = projectRoot;
    this.#logFilePath = path.join(projectRoot, 'debug-bot', 'logs', 'app-output.log');
  }

  /**
   * Start watching source files and log output.
   */
  start() {
    if (this.#running) return;
    this.#running = true;

    // Ensure the log file exists
    const logDir = path.dirname(this.#logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    if (!fs.existsSync(this.#logFilePath)) {
      fs.writeFileSync(this.#logFilePath, '', 'utf-8');
    }
    this.#lastLogSize = fs.statSync(this.#logFilePath).size;

    // ── Source File Watcher ──────────────────────────────────────────────
    const srcPath = path.join(this.#projectRoot, 'src');
    this.#sourceWatcher = chokidar.watch(srcPath, {
      ignored: [
        /(^|[\/\\])\../, // dotfiles
        /node_modules/,
        /\.spec\.ts$/,
        /\.test\.ts$/,
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.#sourceWatcher.on('change', (filePath) => {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.html')) return;
      /** @type {FileChangeEvent} */
      const event = {
        filePath: path.resolve(filePath),
        eventType: 'change',
        timestamp: Date.now(),
      };
      this.emit('source-change', event);
    });

    this.#sourceWatcher.on('add', (filePath) => {
      if (!filePath.endsWith('.ts')) return;
      this.emit('source-change', {
        filePath: path.resolve(filePath),
        eventType: 'add',
        timestamp: Date.now(),
      });
    });

    this.#sourceWatcher.on('error', (error) => {
      this.emit('watcher-error', { type: 'source', error });
    });

    // ── Log File Watcher ────────────────────────────────────────────────
    this.#logWatcher = chokidar.watch(this.#logFilePath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    this.#logWatcher.on('change', () => {
      this.#processNewLogEntries();
    });

    this.#logWatcher.on('error', (error) => {
      this.emit('watcher-error', { type: 'log', error });
    });

    this.emit('started', {
      srcPath,
      logPath: this.#logFilePath,
    });
  }

  /**
   * Read new content appended to the log file and parse log entries.
   */
  #processNewLogEntries() {
    try {
      const stat = fs.statSync(this.#logFilePath);
      if (stat.size <= this.#lastLogSize) {
        // File was truncated or unchanged
        this.#lastLogSize = stat.size;
        return;
      }

      const fd = fs.openSync(this.#logFilePath, 'r');
      const buffer = Buffer.alloc(stat.size - this.#lastLogSize);
      fs.readSync(fd, buffer, 0, buffer.length, this.#lastLogSize);
      fs.closeSync(fd);

      this.#lastLogSize = stat.size;

      const newContent = buffer.toString('utf-8');
      const lines = newContent.split('\n').filter((l) => l.trim());

      for (const line of lines) {
        const entry = this.#parseLogLine(line);
        if (entry) {
          this.emit('log-entry', entry);
        }
      }
    } catch (err) {
      this.emit('watcher-error', { type: 'log-parse', error: err });
    }
  }

  /**
   * Parse a single log line into a structured LogEntry.
   * Supports JSON format and the emoji-prefixed console format from DebugService.
   * @param {string} line
   * @returns {LogEntry|null}
   */
  #parseLogLine(line) {
    // Try JSON format first
    try {
      const parsed = JSON.parse(line);
      if (parsed.level && parsed.message) {
        return {
          id: parsed.id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: parsed.timestamp || new Date().toISOString(),
          level: parsed.level,
          category: parsed.category || 'ERROR',
          service: parsed.service || 'Unknown',
          method: parsed.method,
          message: parsed.message,
          data: parsed.data,
          durationMs: parsed.durationMs,
        };
      }
    } catch {
      // Not JSON, try pattern matching
    }

    // Pattern: [🔴 ERROR] [ServiceName] [method] message
    const emojiPattern =
      /\[(🔴|🟡|🔵|⚪)\s*(ERROR|WARN|INFO|DEBUG)\]\s*\[([^\]]+)\]\s*(?:\[([^\]]+)\]\s*)?(.+)/;
    const match = line.match(emojiPattern);
    if (match) {
      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        level: /** @type {'ERROR'|'WARN'|'INFO'|'DEBUG'} */ (match[2]),
        category: match[2] === 'ERROR' ? 'ERROR' : match[2] === 'WARN' ? 'WARN' : 'METHOD',
        service: match[3],
        method: match[4] || undefined,
        message: match[5].trim(),
        data: undefined,
      };
    }

    return null;
  }

  /**
   * Write a log entry to the log file (for external integration).
   * @param {LogEntry} entry
   */
  writeLogEntry(entry) {
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.#logFilePath, line, 'utf-8');
  }

  /**
   * Get the log file path.
   * @returns {string}
   */
  getLogFilePath() {
    return this.#logFilePath;
  }

  /**
   * Stop all watchers and clean up.
   */
  async stop() {
    this.#running = false;
    if (this.#sourceWatcher) {
      await this.#sourceWatcher.close();
      this.#sourceWatcher = null;
    }
    if (this.#logWatcher) {
      await this.#logWatcher.close();
      this.#logWatcher = null;
    }
    this.emit('stopped');
  }
}
