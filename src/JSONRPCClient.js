// biome-ignore lint/style/useNodejsImportProtocol: nodePolyfills cannot polyfill if the module is imported with the node: protocol
import { EventEmitter } from "events";

import Deferred from "./Deferred.js";
import JSONRPCError from "./JSONRPCError.js";
import promiseEvent from "./promiseEvent.js";

class JSONRPCClient extends EventEmitter {
  constructor(options) {
    super();
    this.deferreds = Object.create(null);
    this.lastId = 0;

    Object.assign(this, this.constructor.defaultOptions, options);
  }

  id() {
    return this.lastId++;
  }

  url(protocol) {
    return `${protocol + (this.secure ? "s" : "")}://${this.host}:${this.port}${this.path}`;
  }

  websocket(message) {
    return new Promise((resolve, reject) => {
      const cb = (err) => {
        if (err) reject(err);
        else resolve();
      };
      this.socket.send(JSON.stringify(message), cb);
      if (globalThis.WebSocket && this.socket instanceof globalThis.WebSocket) cb();
    });
  }

  async http(message) {
    const response = await this.fetch(this.url("http"), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    response
      .json()
      .then((msg) => this._onmessage(msg))
      .catch((err) => {
        this.emit("error", err);
      });

    return response;
  }

  _buildMessage(method, params) {
    if (typeof method !== "string") {
      throw new TypeError(`${method} is not a string`);
    }

    const message = {
      method,
      "json-rpc": "2.0",
      id: this.id(),
    };

    if (params) Object.assign(message, { params });
    return message;
  }

  async batch(calls) {
    const _promises = [];

    const message = calls.map(([method, params]) => {
      return this._buildMessage(method, params);
    });

    await this._send(message);

    return message.map(({ id }) => {
      this.deferreds[id] = new Deferred();
      const { promise } = this.deferreds[id];
      return promise;
    });
  }

  async call(method, parameters) {
    const message = this._buildMessage(method, parameters);
    await this._send(message);

    this.deferreds[message.id] = new Deferred();
    const { promise } = this.deferreds[message.id];

    return promise;
  }

  async _send(message) {
    this.emit("output", message);

    const { socket } = this;
    return socket && socket.readyState === 1 ? this.websocket(message) : this.http(message);
  }

  _onresponse({ id, error, result }) {
    const deferred = this.deferreds[id];
    if (!deferred) return;
    if (error) deferred.reject(new JSONRPCError(error));
    else deferred.resolve(result);
    delete this.deferreds[id];
  }

  _onrequest({ method, params }) {
    return this.onrequest(method, params);
  }

  _onnotification({ method, params }) {
    this.emit(method, params);
  }

  _onmessage(message) {
    this.emit("input", message);

    if (Array.isArray(message)) {
      for (const object of message) {
        this._onobject(object);
      }
    } else {
      this._onobject(message);
    }
  }

  _onobject(message) {
    if (message.method === undefined) this._onresponse(message);
    else if (message.id === undefined) this._onnotification(message);
    else this._onrequest(message);
  }

  async open() {
    this.socket = new this.WebSocket(this.url("ws"));
    const socket = this.socket;

    socket.onclose = (...args) => {
      this.emit("close", ...args);
    };
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (err) {
        this.emit("error", err);
        return;
      }
      this._onmessage(message);
    };
    socket.onopen = (...args) => {
      this.emit("open", ...args);
    };
    socket.onerror = (...args) => {
      this.emit("error", ...args);
    };

    return promiseEvent(this, "open");
  }

  async close() {
    const { socket } = this;
    socket.close();
    return promiseEvent(this, "close");
  }
}

JSONRPCClient.defaultOptions = {
  secure: false,
  host: "localhost",
  port: 80,
  secret: "",
  path: "/jsonrpc",
  WebSocket: globalThis.WebSocket,
  fetch: globalThis.fetch.bind(globalThis),
};

export default JSONRPCClient;
