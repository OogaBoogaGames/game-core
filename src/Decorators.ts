import type { Game } from "./GameBase";

// Defines main game class
export function obg_main<T extends { new (...args: any[]): Game }>(
  constructor: T
) {
  // @ts-ignore
  globalThis.target = new constructor();

  return constructor;
}
