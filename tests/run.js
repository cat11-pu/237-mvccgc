import assert from "node:assert";
import { visibleAt, chainOk } from "../version.js";
import { planGc } from "../gc.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("visibleAt returns a number", () => {
  assert.strictEqual(typeof visibleAt([1], [10], 0), "number");
});

check("chainOk returns a flag", () => {
  assert.strictEqual(typeof chainOk([1, 2]), "boolean");
});

check("planGc returns visible", () => {
  assert.ok(Array.isArray(planGc({ times: [1], values: [10], snapshots: [1] }).visible));
});

check("render counts versions", () => {
  assert.strictEqual(typeof render({ times: [1], values: [10], snapshots: [1] }).count, "number");
});

check("render exposes monotone flag", () => {
  assert.strictEqual(typeof render({ times: [1], values: [10], snapshots: [1] }).monotone, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
