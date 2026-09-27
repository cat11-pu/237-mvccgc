// app.js：渲染结果
import { visibleAt, chainOk } from "./version.js";
import { planGc } from "./gc.js";

export function render(spec) {
  const times = (spec && spec.times) || [];
  const values = (spec && spec.values) || [];
  const snapshots = (spec && spec.snapshots) || [];
  const view = planGc({ times, values, snapshots });
  return {
    visible: view.visible,
    water: view.water,
    kept_count: view.kept_count,
    reclaimed_count: view.reclaimed_count,
    reclaimed: view.reclaimed,
    early: view.early,
    count: times.length,
    monotone: chainOk(times),
    tail: visibleAt([1, 4], [10, 12], 0),
    snap_count: snapshots.length
  };
}
