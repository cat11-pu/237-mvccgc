// version.js：可见性与单调检查
export function visibleAt(times, values, snapshot) {
  let result = -1;
  for (let i = 0; i < times.length; i += 1) {
    if (times[i] <= snapshot) result = values[i];
    else break;
  }
  return result;
}

export function chainOk(times) {
  if (!Array.isArray(times)) return false;
  for (let i = 1; i < times.length; i += 1) {
    if (!(times[i] > times[i - 1])) return false;
  }
  return true;
}
