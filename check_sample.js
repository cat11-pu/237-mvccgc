import fs from "node:fs";
import { visibleAt, chainOk } from "./version.js";
import { planGc } from "./gc.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/chain.json", "utf8"));
const view = render(spec);

emit("可见值列表 =", JSON.stringify(view.visible));
emit("回收水位 =", view.water);
emit("保留版本数 =", view.kept_count);
emit("可回收版本数 =", view.reclaimed_count);
emit("可回收时刻列表 =", JSON.stringify(view.reclaimed));
emit("过早快照的可见值 =", view.early);
emit("版本条数 =", view.count);
emit("单调复核 =", view.monotone);
emit("快照条数 =", view.snap_count);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  planGc({ times: [4, 1], values: [10, 12], snapshots: [2] });
  emit("链写错的错误码", "没有报错");
} catch (error) {
  emit("链写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  planGc({ times: [1], values: [10], snapshots: [] });
  emit("快照写错的错误码", "没有报错");
} catch (error) {
  emit("快照写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "可见值列表": [
    10,
    12,
    15
  ],
  "回收水位": 2,
  "保留版本数": 2,
  "可回收版本数": 1,
  "可回收时刻列表": [
    1
  ],
  "过早快照的可见值": -1,
  "版本条数": 3,
  "单调复核": true,
  "快照条数": 3,
  "链写错的错误码": "E_BAD_CHAIN",
  "快照写错的错误码": "E_BAD_SNAPSHOT"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
