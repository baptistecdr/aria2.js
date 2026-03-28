import { EventEmitter } from "node:events";

export interface JSONRPCClientOptions {
  secure?: boolean;
  host?: string;
  port?: number;
  secret?: string;
  path?: string;
  WebSocket?: typeof WebSocket;
  fetch?: typeof fetch;
}

export interface JSONRPCMessage {
  method: string;
  "json-rpc": "2.0";
  id: number;
  params?: unknown;
}

export interface JSONRPCResponse {
  id: number;
  result?: unknown;
  error?: { message: string; code: number; data?: unknown };
}

export interface JSONRPCNotification {
  method: string;
  params?: unknown;
}

export interface JSONRPCRequest {
  method: string;
  id: number;
  params?: unknown;
}

export type JSONRPCCall = [method: string, ...params: unknown[]];

export default class JSONRPCClient extends EventEmitter {
  static defaultOptions: Required<JSONRPCClientOptions>;

  secure: boolean;
  host: string;
  port: number;
  secret: string;
  path: string;
  WebSocket: typeof WebSocket;
  fetch: typeof fetch;
  socket: WebSocket | undefined;
  deferreds: Record<number, import("./Deferred.js").default>;
  lastId: number;

  constructor(options?: JSONRPCClientOptions);

  id(): number;
  url(protocol: string): string;

  websocket(message: JSONRPCMessage | JSONRPCMessage[]): Promise<void>;
  http(message: JSONRPCMessage | JSONRPCMessage[]): Promise<Response>;

  _buildMessage(method: string, params?: unknown): JSONRPCMessage;

  batch(calls: JSONRPCCall[]): Promise<Promise<unknown>[]>;
  call(method: string, parameters?: unknown): Promise<unknown>;

  _send(message: JSONRPCMessage | JSONRPCMessage[]): Promise<undefined | Response>;
  _onresponse(response: JSONRPCResponse): void;
  _onrequest(request: JSONRPCRequest): void;
  _onnotification(notification: JSONRPCNotification): void;
  _onmessage(message: JSONRPCMessage | JSONRPCMessage[]): void;
  _onobject(message: JSONRPCMessage): void;

  open(): Promise<unknown>;
  close(): Promise<unknown>;

  onrequest(method: string, params?: unknown): void;
}
