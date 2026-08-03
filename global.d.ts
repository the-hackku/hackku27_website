import type { Env } from "./env";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
