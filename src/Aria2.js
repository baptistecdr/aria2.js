import JSONRPCClient, { JSONRPCNotificationEvent } from "./JSONRPCClient.js";
import JSONRPCError from "./JSONRPCError.js";

function prefix(str) {
  let prefixedStr = str;
  if (!str.startsWith("system.") && !str.startsWith("aria2.")) {
    prefixedStr = `aria2.${str}`;
  }
  return prefixedStr;
}

function unprefix(str) {
  return str.startsWith("aria2.") ? str.slice("aria2.".length) : str;
}

class Aria2 extends JSONRPCClient {
  addSecret(parameters) {
    let params = this.secret ? [`token:${this.secret}`] : [];
    if (Array.isArray(parameters)) {
      params = params.concat(parameters);
    }
    return params;
  }

  _onnotification(notification) {
    const { method, params } = notification;
    const event = unprefix(method);
    if (event !== method) {
      this.dispatchEvent(new JSONRPCNotificationEvent(event, { params }));
    }
    return super._onnotification(notification);
  }

  async call(method, ...params) {
    return super.call(prefix(method), this.addSecret(params));
  }

  async multicall(calls) {
    const multi = [
      calls.map(([method, ...params]) => {
        return { methodName: prefix(method), params: this.addSecret(params) };
      }),
    ];
    const results = await super.call("system.multicall", multi);
    return results.map((result) => {
      if (Array.isArray(result)) return result[0];
      throw new JSONRPCError({ code: result.faultCode, message: result.faultString });
    });
  }

  async batch(calls) {
    return super.batch(calls.map(([method, ...params]) => [prefix(method), this.addSecret(params)]));
  }

  async listNotifications() {
    const events = await this.call("system.listNotifications");
    return events.map((event) => unprefix(event));
  }

  async listMethods() {
    const methods = await this.call("system.listMethods");
    return methods.map((method) => unprefix(method));
  }

  static prefix;

  static unprefix;

  static defaultOptions = {
    ...JSONRPCClient.defaultOptions,
    ...{
      secure: false,
      host: "localhost",
      port: 6800,
      secret: "",
      path: "/jsonrpc",
    },
  };
}

export default Aria2;
