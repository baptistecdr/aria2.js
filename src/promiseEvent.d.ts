import type { EventEmitter } from "node:events";

export default function promiseEvent(target: EventEmitter, event: string): Promise<unknown>;
