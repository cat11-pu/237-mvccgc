// gc.js：可见性判定与回收计划（基线：一律给空表）
import { visibleAt, chainOk } from "./version.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function planGc(spec) {
  const times = Array.isArray(spec.times) ? spec.times : [];
  const values = Array.isArray(spec.values) ? spec.values : [];
  const snapshots = Array.isArray(spec.snapshots) ? spec.snapshots : [];

  if (!chainOk(times) || times.length !== values.length) {
    fail("E_BAD_CHAIN", "版本链时刻必须严格递增且与值表等长");
  }
  if (snapshots.length === 0 || snapshots.some(function (s) {
    return typeof s !== "number" || !Number.isInteger(s) || s < 0;
  })) {
    fail("E_BAD_SNAPSHOT", "快照表必须非空且每项为非负整数");
  }

  let water = snapshots[0];
  for (let i = 1; i < snapshots.length; i += 1) {
    if (snapshots[i] < water) { water = snapshots[i]; }
  }

  // 一次扫描：找首个时刻不小于水位的版本（保留段起点），同时算每个快照的可见值。
  // 一次扫描：找首个时刻不小于水位的版本（保留段起点）；快照不保证有序，
  // 按快照值排序索引后与版本链归并，算出每个快照看到的最新版本值。
  const order = snapshots.map(function (_s, i) { return i; })
    .sort(function (a, b) { return snapshots[a] - snapshots[b]; });
  let keptStart = times.length;
  const visible = new Array(snapshots.length).fill(-1);
  let scan = 0;
  let lastValue = -1;
  for (let i = 0; i < times.length; i += 1) {
    if (keptStart === times.length && times[i] >= water) { keptStart = i; }
    while (scan < order.length && snapshots[order[scan]] < times[i]) {
      visible[order[scan]] = lastValue;
      scan += 1;
    }
    lastValue = values[i];
  }
  for (; scan < order.length; scan += 1) {
    visible[order[scan]] = lastValue;
  }

  const reclaimed = times.slice(0, keptStart);
  return {
    visible: visible,
    water: water,
    kept_count: times.length - keptStart,
    reclaimed_count: keptStart,
    reclaimed: reclaimed,
    early: visibleAt(times, values, 0)
  };
}
