// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  parts.log.textContent = "版本 " + (spec.times || []).length + " 个，快照 " + (spec.snapshots || []).length + " 个。";

  function draw() {
    let view = null;
    try {
      view = render(spec);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (spec.times || []).forEach(function (when, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = "版本 " + (spot + 1) + " 时刻 " + when + " 值 " + (spec.values || [])[spot];
      row.appendChild(head);
      const mark = document.createElement("span");
      const gone = (view.reclaimed || []).indexOf(when) !== -1;
      mark.className = "chip" + (gone ? " bad" : " ok");
      mark.textContent = gone ? "可回收" : "保留";
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "水位 " + view.water + "，保留 " + view.kept_count + " 个版本，可回收 "
      + view.reclaimed_count + " 个";
    parts.log.textContent = "可见值 " + JSON.stringify(view.visible) + "，过早快照给 " + view.early;
  }

  const whenInput = document.createElement("input");
  whenInput.type = "number";
  whenInput.value = "9";
  parts.controls.appendChild(whenInput);

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "算一遍";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一个版本";
  addButton.addEventListener("click", function () {
    const next = Number(whenInput.value);
    const when = Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0;
    spec.times = (spec.times || []).concat([when]);
    spec.values = (spec.values || []).concat([when * 10]);
    draw();
  });
  parts.controls.appendChild(addButton);

  const dropButton = document.createElement("button");
  dropButton.textContent = "删最后一个版本";
  dropButton.addEventListener("click", function () {
    spec.times = (spec.times || []).slice(0, Math.max(0, (spec.times || []).length - 1));
    spec.values = (spec.values || []).slice(0, Math.max(0, (spec.values || []).length - 1));
    draw();
  });
  parts.controls.appendChild(dropButton);

  const snapButton = document.createElement("button");
  snapButton.textContent = "快照加一";
  snapButton.addEventListener("click", function () {
    const list = spec.snapshots || [];
    const last = list.length ? list[list.length - 1] : 0;
    spec.snapshots = list.concat([last + 1]);
    draw();
  });
  parts.controls.appendChild(snapButton);

  draw();
}
