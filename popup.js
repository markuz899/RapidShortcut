// Rapid Shortcut — cross-browser (Chrome MV3 + Firefox). Vanilla, no deps.

// ---- pure helpers (also unit-tested in popup.test.mjs) ----

export const looksSecret = (label = "") =>
  /(pass|pwd|secret|token|key|pin|api)/i.test(label);

export const hueFromString = (s = "") => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

// old format was [{serviceName, serviceToken}] under key "services"
export const migrate = (oldArr = []) =>
  oldArr.map((o) => ({
    id: o.id || cryptoId(),
    title: o.serviceName || "Untitled",
    fields: [{ label: "token", value: o.serviceToken || "" }],
  }));

function cryptoId() {
  return (globalThis.crypto?.randomUUID?.() ?? "id-" + Math.random().toString(36).slice(2));
}

// turn one imported record into normalized fields (handles v1 + v2 shapes)
function normalizeFields(e) {
  if (Array.isArray(e.fields)) {
    return e.fields
      .map((f) => ({ label: String(f.label ?? ""), value: String(f.value ?? "") }))
      .filter((f) => f.label || f.value);
  }
  if (e.serviceToken != null) return [{ label: "token", value: String(e.serviceToken) }];
  return [];
}

// validate + coerce an import file (trust boundary) — throws on garbage
export function parseImport(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.entries;
  if (!Array.isArray(arr)) throw new Error("Not a Stash backup");
  return arr.map((e) => ({
    id: cryptoId(),
    title: String(e.title ?? e.serviceName ?? "Untitled").slice(0, 200),
    fields: normalizeFields(e),
  }));
}

// stop here when imported by the test runner (no DOM, no chrome.*)
if (typeof document === "undefined") {
  // exported helpers only
} else {
  main();
}

function main() {
  const store = globalThis.chrome?.storage?.sync;
  const $ = (sel) => document.querySelector(sel);

  const I = {
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    back:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
    chevron:
      '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
    copy:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 13l4 4L19 7"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.9M6.1 6.1A16 16 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3-.5"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  $(".bar-icon").innerHTML = I.search;
  $("#add").innerHTML = I.plus;
  $("#cancel").innerHTML = I.back;

  let entries = [];
  let editingId = null; // null while editing means "new"

  // ---- storage ----
  const load = () =>
    new Promise((res) => {
      store.get(["entries", "services"], async (v) => {
        if (Array.isArray(v.entries)) {
          entries = v.entries;
        } else if (v.services) {
          // one-time migration from the old extension
          entries = migrate(JSON.parse(v.services));
          await save();
        } else {
          entries = [];
        }
        res();
      });
    });

  const save = () =>
    new Promise((res) => store.set({ entries }, res));

  // ---- views ----
  const listView = $("#list-view");
  const formView = $("#form-view");

  function showList() {
    formView.hidden = true;
    listView.hidden = false;
    $("#search").value = "";
    render();
  }

  function showForm(id) {
    editingId = id ?? null;
    const entry = entries.find((e) => e.id === id);
    $("#form-title").textContent = entry ? "Edit credential" : "New credential";
    $("#entry-name").value = entry ? entry.title : "";
    const fields = entry
      ? entry.fields
      : [
          { label: "user", value: "" },
          { label: "pass", value: "" },
        ];
    $("#form-fields").innerHTML = "";
    fields.forEach(addFieldRow);
    listView.hidden = true;
    formView.hidden = false;
    $("#entry-name").focus();
  }

  // ---- list render ----
  function render() {
    const q = $("#search").value.trim().toLowerCase();
    const box = $("#entries");
    const empty = $("#empty");
    box.innerHTML = "";

    const matches = entries.filter((e) => {
      if (!q) return true;
      const hay =
        e.title +
        " " +
        e.fields.map((f) => f.label + " " + f.value).join(" ");
      return hay.toLowerCase().includes(q);
    });

    if (entries.length === 0) {
      empty.hidden = false;
      empty.textContent = "No credentials yet. Tap + to add your first.";
      return;
    }
    if (matches.length === 0) {
      empty.hidden = false;
      empty.textContent = `Nothing matches “${q}”.`;
      return;
    }
    empty.hidden = true;

    matches.forEach((entry, i) => box.appendChild(renderEntry(entry, i)));
  }

  function renderEntry(entry, i) {
    const el = document.createElement("div");
    el.className = "entry";
    el.style.setProperty("--i", i);

    const head = document.createElement("button");
    head.className = "entry-head";
    head.innerHTML = `
      <span class="chip" style="--h:${hueFromString(entry.title)}">${
      (entry.title[0] || "?").trim() || "?"
    }</span>
      <span class="entry-title">${esc(entry.title)}</span>
      <span class="entry-meta">${entry.fields.length}</span>
      ${I.chevron}`;
    head.addEventListener("click", () => el.classList.toggle("open"));

    const body = document.createElement("div");
    body.className = "entry-body";
    const inner = document.createElement("div");

    entry.fields.forEach((f) => inner.appendChild(renderField(f)));

    const actions = document.createElement("div");
    actions.className = "entry-actions";
    const edit = mkTextBtn("Edit", () => showForm(entry.id));
    const del = mkTextBtn("Delete", async () => {
      entries = entries.filter((e) => e.id !== entry.id);
      await save();
      render();
    });
    del.classList.add("danger");
    actions.append(edit, del);
    inner.appendChild(actions);

    body.appendChild(inner);
    el.append(head, body);
    return el;
  }

  function renderField(f) {
    const secret = looksSecret(f.label);
    const row = document.createElement("div");
    row.className = "field";

    const value = document.createElement("span");
    value.className = "f-value" + (secret ? " secret" : "");
    value.textContent = secret ? mask(f.value) : f.value;

    row.innerHTML = `<span class="f-label">${esc(f.label)}</span>`;
    row.appendChild(value);

    if (secret) {
      let shown = false;
      const reveal = mkIconBtn(I.eye, () => {
        shown = !shown;
        value.textContent = shown ? f.value : mask(f.value);
        reveal.innerHTML = shown ? I.eyeOff : I.eye;
      });
      row.appendChild(reveal);
    }

    const copy = mkIconBtn(I.copy, async () => {
      await navigator.clipboard.writeText(f.value);
      row.classList.add("copied");
      copy.innerHTML = I.check;
      copy.classList.add("ok");
      setTimeout(() => {
        row.classList.remove("copied");
        copy.innerHTML = I.copy;
        copy.classList.remove("ok");
      }, 900);
    });
    row.appendChild(copy);
    return row;
  }

  // ---- form ----
  function addFieldRow(f = { label: "", value: "" }) {
    const row = document.createElement("div");
    row.className = "field-row";

    const label = document.createElement("input");
    label.className = "label-in";
    label.placeholder = "label";
    label.value = f.label;

    const value = document.createElement("input");
    value.className = "value-in";
    value.placeholder = "value";
    value.value = f.value;

    const remove = mkIconBtn(I.x, () => row.remove());
    remove.classList.add("icon-btn");

    row.append(label, value, remove);
    $("#form-fields").appendChild(row);
  }

  async function saveForm() {
    const title = $("#entry-name").value.trim();
    const fields = [...$("#form-fields").querySelectorAll(".field-row")]
      .map((r) => ({
        label: r.querySelector(".label-in").value.trim(),
        value: r.querySelector(".value-in").value,
      }))
      .filter((f) => f.label || f.value);

    if (!title || fields.length === 0) {
      $("#entry-name").focus();
      $("#entry-name").placeholder = "Name is required";
      return;
    }

    if (editingId) {
      const e = entries.find((x) => x.id === editingId);
      e.title = title;
      e.fields = fields;
    } else {
      entries.push({ id: cryptoId(), title, fields });
    }
    await save();
    showList();
  }

  // ---- tiny dom helpers ----
  function mkIconBtn(svg, onClick) {
    const b = document.createElement("button");
    b.className = "icon-btn";
    b.innerHTML = svg;
    b.addEventListener("click", onClick);
    return b;
  }
  function mkTextBtn(text, onClick) {
    const b = document.createElement("button");
    b.className = "text-btn";
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }
  const mask = (s) => "•".repeat(Math.max(s.length, 4));
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );

  // ---- wire up ----
  $("#search").addEventListener("input", render);
  $("#add").addEventListener("click", () => showForm());
  $("#cancel").addEventListener("click", showList);
  $("#add-field").addEventListener("click", () => addFieldRow());
  $("#save").addEventListener("click", saveForm);

  // ---- import / export ----
  $("#export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `stash-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const fileInput = $("#import-file");
  $("#import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    fileInput.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const imported = parseImport(await file.text());
      entries = entries.concat(imported); // merge, never overwrite
      await save();
      render();
    } catch {
      const empty = $("#empty");
      empty.hidden = false;
      empty.textContent = "Couldn't read that file — expected a Stash backup.";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !formView.hidden) showList();
  });

  load().then(render);
}
