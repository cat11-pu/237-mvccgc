// gc.js：可见性判定与回收计划（版本链一次扫描，每个版本只看一次）
import { chainOk } from "./version.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function planGc(spec) {
  const times = spec && spec.times;
  const values = spec && spec.values;
  const snapshots = spec && spec.snapshots;

  if (!Array.isArray(times) || !Array.isArray(values)
      || !chainOk(times) || times.length !== values.length) {
    fail("E_BAD_CHAIN", "版本链时刻必须严格递增，且与值表等长");
  }
  if (!Array.isArray(snapshots) || snapshots.length === 0
      || snapshots.some((s) => !Number.isInteger(s) || s < 0)) {
    fail("E_BAD_SNAPSHOT", "快照表必须非空，且每个快照都是非负整数");
  }

  const n = times.length;
  const m = snapshots.length;

  let water = snapshots[0];
  for (let j = 1; j < m; j += 1) {
    if (snapshots[j] < water) water = snapshots[j];
  }

  const order = Array.from({ length: m }, (_, j) => j);
  order.sort((a, b) => snapshots[a] - snapshots[b]);

  const visible = new Array(m);
  let keptStart = n;
  let early = -1;
  let lastValue = -1;
  let cursor = 0;

  for (let i = 0; i < n; i += 1) {
    const when = times[i];
    if (when >= water && keptStart === n) keptStart = i;
    if (when <= 0) early = values[i];
    while (cursor < m && snapshots[order[cursor]] < when) {
      visible[order[cursor]] = lastValue;
      cursor += 1;
    }
    lastValue = values[i];
  }
  while (cursor < m) {
    visible[order[cursor]] = lastValue;
    cursor += 1;
  }

  const reclaimed = times.slice(0, keptStart);
  return {
    visible,
    water,
    kept_count: n - keptStart,
    reclaimed_count: keptStart,
    reclaimed,
    early
  };
}
