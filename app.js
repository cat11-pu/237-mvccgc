// app.js：渲染结果
import { visibleAt, chainOk } from "./version.js";
import { planGc } from "./gc.js";

export function render(spec) {
  const times = spec.times || [];
  const values = spec.values || [];
  const snapshots = spec.snapshots || [];
  const view = planGc(spec);
  return { visible: view.visible || [], water: view.water || 0,
           kept_count: view.kept_count || 0, reclaimed_count: view.reclaimed_count || 0,
           reclaimed: view.reclaimed || [], early: view.early === undefined ? -1 : view.early,
           count: times.length, monotone: chainOk(times),
           tail: visibleAt([1, 4], [10, 12], 0), snap_count: snapshots.length };
}
