// =============================================================================
// ui-bridge.js — WebSocket Bridge
// Runs a WebSocket server for real-time communication with:
//   - Angular frontend (admin panel overlay)
//   - VS Code extension
// Protocol: JSON messages with type-based routing
// =============================================================================

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

/**
 * @typedef {Object} BridgeMessage
 * @property {string} type - Message type
 * @property {*} [payload] - Message payload
 * @property {string} [requestId] - Request ID for request/response correlation
 */

export class UIBridge extends EventEmitter {
  /** @type {WebSocketServer|null} */
  #wss = null;

  /** @type {Set<WebSocket>} */
  #clients = new Set();

  /** @type {number} */
  #port;

  /** @type {boolean} */
  #running = false;

  /** @type {Array<import('./analyzer.js').AnalysisResult>} */
  #pendingSuggestions = [];

  /**
   * @param {number} [port=9876]
   */
  constructor(port = 9876) {
    super();
    this.#port = port;
  }

  /**
   * Start the WebSocket server.
   * @returns {Promise<void>}
   */
  start() {
    return new Promise((resolve, reject) => {
      if (this.#running) {
        resolve();
        return;
      }

      this.#wss = new WebSocketServer({ port: this.#port }, () => {
        this.#running = true;
        this.emit('started', { port: this.#port });
        resolve();
      });

      this.#wss.on('error', (err) => {
        if (!this.#running) {
          reject(err);
        }
        this.emit('server-error', err);
      });

      this.#wss.on('connection', (ws, req) => {
        const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        this.#clients.add(ws);

        this.emit('client-connected', {
          clientId,
          ip: req.socket.remoteAddress,
          totalClients: this.#clients.size,
        });

        // Send any pending suggestions to the new client
        for (const suggestion of this.#pendingSuggestions) {
          this.#sendToClient(ws, {
            type: 'fix-suggestion',
            payload: suggestion,
          });
        }

        ws.on('message', (data) => {
          try {
            /** @type {BridgeMessage} */
            const message = JSON.parse(data.toString());
            this.#handleMessage(message, ws, clientId);
          } catch (err) {
            this.#sendToClient(ws, {
              type: 'error',
              payload: { message: 'Invalid JSON message' },
            });
          }
        });

        ws.on('close', () => {
          this.#clients.delete(ws);
          this.emit('client-disconnected', {
            clientId,
            totalClients: this.#clients.size,
          });
        });

        ws.on('error', (err) => {
          this.#clients.delete(ws);
          this.emit('client-error', { clientId, error: err.message });
        });
      });
    });
  }

  /**
   * Handle an incoming message from a client.
   * @param {BridgeMessage} message
   * @param {WebSocket} ws
   * @param {string} clientId
   */
  #handleMessage(message, ws, clientId) {
    switch (message.type) {
      case 'apply-fix':
        this.emit('apply-fix-request', {
          ...message.payload,
          clientId,
          requestId: message.requestId,
        });
        break;

      case 'ignore':
        this.emit('ignore-request', {
          ...message.payload,
          clientId,
          requestId: message.requestId,
        });
        break;

      case 'rollback':
        this.emit('rollback-request', {
          ...message.payload,
          clientId,
          requestId: message.requestId,
        });
        break;

      case 'get-suggestions':
        this.#sendToClient(ws, {
          type: 'all-suggestions',
          payload: this.#pendingSuggestions,
          requestId: message.requestId,
        });
        break;

      case 'get-status':
        this.emit('status-request', { clientId, requestId: message.requestId });
        break;

      case 'ping':
        this.#sendToClient(ws, { type: 'pong', requestId: message.requestId });
        break;

      default:
        this.emit('unknown-message', { message, clientId });
    }
  }

  /**
   * Broadcast an error detection to all connected clients.
   * @param {import('./watcher.js').LogEntry} logEntry
   */
  broadcastError(logEntry) {
    this.#broadcast({
      type: 'error-detected',
      payload: logEntry,
    });
  }

  /**
   * Broadcast a fix suggestion to all connected clients.
   * @param {import('./analyzer.js').AnalysisResult} suggestion
   */
  broadcastSuggestion(suggestion) {
    this.#pendingSuggestions.push(suggestion);
    this.#broadcast({
      type: 'fix-suggestion',
      payload: suggestion,
    });
  }

  /**
   * Broadcast a fix-applied notification to all connected clients.
   * @param {import('./fixer.js').FixResult} result
   */
  broadcastFixApplied(result) {
    // Remove from pending
    this.#pendingSuggestions = this.#pendingSuggestions.filter(
      (s) => !(s.filePath === result.filePath && s.line === result.line && s.ruleId === result.ruleId)
    );

    this.#broadcast({
      type: 'fix-applied',
      payload: result,
    });
  }

  /**
   * Broadcast a fix-ignored notification to all connected clients.
   * @param {Object} details
   */
  broadcastFixIgnored(details) {
    // Remove from pending
    this.#pendingSuggestions = this.#pendingSuggestions.filter(
      (s) => !(s.filePath === details.filePath && s.line === details.line && s.ruleId === details.ruleId)
    );

    this.#broadcast({
      type: 'fix-ignored',
      payload: details,
    });
  }

  /**
   * Send a response to a specific client.
   * @param {string} clientId - Not used directly, but kept for API consistency
   * @param {BridgeMessage} message
   */
  broadcastResponse(message) {
    this.#broadcast(message);
  }

  /**
   * Send a message to a specific WebSocket client.
   * @param {WebSocket} ws
   * @param {BridgeMessage} message
   */
  #sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast a message to all connected clients.
   * @param {BridgeMessage} message
   */
  #broadcast(message) {
    const data = JSON.stringify(message);
    for (const client of this.#clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  /**
   * Get the number of connected clients.
   * @returns {number}
   */
  getClientCount() {
    return this.#clients.size;
  }

  /**
   * Get pending suggestions count.
   * @returns {number}
   */
  getPendingCount() {
    return this.#pendingSuggestions.length;
  }

  /**
   * Clear all pending suggestions.
   */
  clearPending() {
    this.#pendingSuggestions = [];
  }

  /**
   * Stop the WebSocket server.
   * @returns {Promise<void>}
   */
  stop() {
    return new Promise((resolve) => {
      this.#running = false;

      // Close all client connections
      for (const client of this.#clients) {
        client.close(1000, 'Server shutting down');
      }
      this.#clients.clear();

      if (this.#wss) {
        this.#wss.close(() => {
          this.#wss = null;
          this.emit('stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
