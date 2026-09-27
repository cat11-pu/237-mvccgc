// gc.js：可见性判定与回收计划（基线：一律给空表）
import { visibleAt, chainOk } from "./version.js";

export function planGc(spec) {
  return { visible: [], water: 0, kept_count: 0, reclaimed_count: 0, reclaimed: [], early: -1 };
}
