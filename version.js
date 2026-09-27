// version.js：可见性与单调检查
export function visibleAt(times, values, snapshot) {
  let answer = -1;
  for (let i = 0; i < times.length; i += 1) {
    if (times[i] <= snapshot) { answer = values[i]; } else { break; }
  }
  return answer;
}

export function chainOk(times) {
  for (let i = 1; i < times.length; i += 1) {
    if (!(times[i - 1] < times[i])) { return false; }
  }
  return true;
}
