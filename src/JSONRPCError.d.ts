export default class JSONRPCError extends Error {
  code: number;
  data?: unknown;
  name: string;

  constructor(error: { message: string; code: number; data?: unknown });
}
