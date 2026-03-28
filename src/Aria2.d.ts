import JSONRPCClient, { type JSONRPCCall, type JSONRPCClientOptions } from "./JSONRPCClient.js";

export interface Aria2Options extends JSONRPCClientOptions {
  secure?: boolean;
  host?: string;
  port?: number;
  secret?: string;
  path?: string;
}

export default class Aria2 extends JSONRPCClient {
  static defaultOptions: Required<Aria2Options>;
  static prefix(str: string): string;
  static unprefix(str: string): string;

  constructor(options?: Aria2Options);

  addSecret(parameters: unknown[]): unknown[];

  call(method: string, ...params: unknown[]): Promise<unknown>;
  multicall(calls: JSONRPCCall[]): Promise<unknown>;
  batch(calls: JSONRPCCall[]): Promise<Promise<unknown>[]>;

  listNotifications(): Promise<string[]>;
  listMethods(): Promise<string[]>;
}
