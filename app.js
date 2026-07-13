// ---------- LOCAL PERSISTENCE ----------
// Auto-saves edits (removed/reworded/added items) to this browser so a
// refresh doesn't lose work-in-progress. Does NOT sync across devices —
// use the Export button to make edits the permanent default for everyone.
const STORAGE_PREFIX = "mmhc_competency_v1_";

function saveState(key, state) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state)); } catch (e) {}
}
function loadState(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function storageKeyFor(prefix) {
  return prefix === "A" ? `A_${currentDiscipline}` : prefix;
}
function persistSection(prefix) {
  syncStateFromDOM(prefix);
  saveState(storageKeyFor(prefix), getState(prefix));
}
let saveDebounceTimer = null;
function persistSectionDebounced(prefix) {
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => persistSection(prefix), 400);
}

// ---------- UI RENDERING ----------
let currentDiscipline = "PT";

function renderDisciplineTabs() {
  const wrap = document.getElementById("disciplineTabs");
  wrap.innerHTML = "";
  Object.keys(DISCIPLINES).forEach(key => {
    const btn = document.createElement("button");
    btn.textContent = key;
    btn.className = key === currentDiscipline ? "active" : "";
    btn.onclick = () => {
      if (sectionRegistry["A"]) persistSection("A");
      currentDiscipline = key;
      renderAll();
    };
    wrap.appendChild(btn);
  });
}

function radioGroupHTML(name, options, defaultVal) {
  return options.map(opt => {
    const id = `${name}_${opt.replace(/[^a-zA-Z0-9]/g, "")}`;
    const checked = (opt === defaultVal) ? "checked" : "";
    return `<label><input type="radio" name="${name}" value="${opt}" ${checked}> ${opt}</label>`;
  }).join("");
}

// ---------- EDITABLE ITEM STATE ----------
// Each section keeps a mutable working list of {text, include, selected}
// so items can be reworded, marked not-applicable, removed, or added to
// without touching the original industry-standard defaults in data.js.
const sectionRegistry = {};       // prefix -> { bodyId, toolsId, options, addLabel }
const disciplineItemCache = {};   // "A_PT" etc -> state array (so edits survive tab switching)

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

document.addEventListener("input", (e) => {
  if (e.target.matches("textarea.item-edit")) {
    autoResize(e.target);
    persistSectionDebounced(e.target.dataset.key);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.matches('.radiogrp input[type="radio"]')) {
    const prefix = e.target.name.split("_")[0];
    persistSectionDebounced(prefix);
  }
});

function freshState(items) {
  return items.map(t => ({ text: t, include: true, selected: "", selected2: "" }));
}

function registerSection(prefix, bodyId, toolsId, options, addLabel, dual, options2) {
  sectionRegistry[prefix] = {
    bodyId, toolsId, options,
    addLabel: addLabel || "+ Add item",
    dual: !!dual,
    options2: options2 || options
  };
}

function getState(prefix) {
  return sectionRegistry[prefix].state;
}

function syncStateFromDOM(prefix) {
  const s = sectionRegistry[prefix];
  s.state.forEach((item, idx) => {
    if (!item.include) return;
    if (s.dual) {
      const selfSel = getRadioValue(`${prefix}_self_${idx}`);
      const peerSel = getRadioValue(`${prefix}_peer_${idx}`);
      if (selfSel) item.selected = selfSel;
      if (peerSel) item.selected2 = peerSel;
    } else {
      const sel = getRadioValue(`${prefix}_${idx}`);
      if (sel) item.selected = sel;
    }
    const inp = document.querySelector(`textarea.item-edit[data-key="${prefix}"][data-idx="${idx}"]`);
    if (inp) item.text = inp.value;
  });
}

function renderSection(prefix) {
  const s = sectionRegistry[prefix];
  const tbody = document.getElementById(s.bodyId);
  tbody.innerHTML = "";
  s.state.forEach((item, idx) => {
    if (!item.include) return;
    const tr = document.createElement("tr");
    const editControls = `
      <div class="item-row-controls">
        <textarea class="item-edit" data-key="${prefix}" data-idx="${idx}" rows="1">${escapeHtml(item.text)}</textarea>
        <button type="button" class="removeBtn" data-key="${prefix}" data-idx="${idx}" title="Not applicable / remove">✕</button>
      </div>`;
    if (s.dual) {
      const selfName = `${prefix}_self_${idx}`;
      const peerName = `${prefix}_peer_${idx}`;
      tr.innerHTML = `
        <td class="item-text">${editControls}</td>
        <td><div class="radiogrp">${radioGroupHTML(selfName, s.options, item.selected)}</div></td>
        <td><div class="radiogrp">${radioGroupHTML(peerName, s.options2, item.selected2)}</div></td>
      `;
    } else {
      const name = `${prefix}_${idx}`;
      tr.innerHTML = `
        <td class="item-text">${editControls}</td>
        <td><div class="radiogrp">${radioGroupHTML(name, s.options, item.selected)}</div></td>
      `;
    }
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("textarea.item-edit").forEach(autoResize);

  const toolsEl = document.getElementById(s.toolsId);
  const removedItems = s.state.map((item, idx) => ({ item, idx })).filter(x => !x.item.include);
  let chipsHtml = "";
  if (removedItems.length) {
    chipsHtml = `<div class="removedWrap"><span class="removedLabel">Not applicable (${removedItems.length}):</span>` +
      removedItems.map(({item, idx}) => `
        <span class="chip">${escapeHtml(item.text.slice(0,40))}${item.text.length>40?"…":""}
          <button type="button" class="restoreBtn" data-key="${prefix}" data-idx="${idx}" title="Restore item">↺</button>
        </span>`).join("") +
      `</div>`;
  }
  toolsEl.innerHTML = `<button type="button" class="addItemBtn" data-key="${prefix}">${s.addLabel}</button>${chipsHtml}`;
}

document.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".removeBtn");
  const restoreBtn = e.target.closest(".restoreBtn");
  const addBtn = e.target.closest(".addItemBtn");
  if (removeBtn) {
    const { key, idx } = removeBtn.dataset;
    syncStateFromDOM(key);
    getState(key)[+idx].include = false;
    renderSection(key);
    persistSection(key);
  } else if (restoreBtn) {
    const { key, idx } = restoreBtn.dataset;
    syncStateFromDOM(key);
    getState(key)[+idx].include = true;
    renderSection(key);
    persistSection(key);
  } else if (addBtn) {
    const key = addBtn.dataset.key;
    syncStateFromDOM(key);
    getState(key).push({ text: "", include: true, selected: "" });
    renderSection(key);
    persistSection(key);
  }
});


function renderAll() {
  renderDisciplineTabs();
  const d = DISCIPLINES[currentDiscipline];
  document.getElementById("discNameA").textContent = `${d.label} (${d.fullName})`;
  document.getElementById("discNameF").textContent = `${d.label} (${d.fullName})`;
  document.getElementById("discNameF2").textContent = `${d.label} (${d.fullName})`;

  // Register (once) all non-discipline-specific sections
  if (!sectionRegistry["B1"]) {
    registerSection("B1", "itemsBodyB1", "toolsB1", RESULT_OPTIONS_MET);
    sectionRegistry["B1"].state = loadState("B1") || freshState(OBSERVATION_ITEMS);
    registerSection("B2", "itemsBodyB2", "toolsB2", RESULT_OPTIONS_MET);
    sectionRegistry["B2"].state = loadState("B2") || freshState(CAR_STOCK_ITEMS);
    registerSection("C", "itemsBodyC", "toolsC", RESULT_OPTIONS_DRD);
    sectionRegistry["C"].state = loadState("C") || freshState(PPE_ITEMS);
    registerSection("D", "itemsBodyD", "toolsD", RESULT_OPTIONS_OV);
    sectionRegistry["D"].state = loadState("D") || freshState(HAND_HYGIENE_ITEMS);
    registerSection("E", "itemsBodyE", "toolsE", RESULT_OPTIONS_DRD);
    sectionRegistry["E"].state = loadState("E") || freshState(RESPIRATOR_ITEMS);
  }

  // Section A is discipline-specific; cache each discipline's working copy
  // separately so edits/removals aren't lost when switching tabs.
  registerSection("A", "itemsBodyA", "toolsA", RESULT_OPTIONS_CNMT, undefined, true, RESULT_OPTIONS_CNMT);
  const cacheKey = `A_${currentDiscipline}`;
  if (!disciplineItemCache[cacheKey]) {
    disciplineItemCache[cacheKey] = loadState(cacheKey) || freshState(d.items);
  }
  sectionRegistry["A"].state = disciplineItemCache[cacheKey];

  renderSection("A");
  renderSection("B1");
  renderSection("B2");
  renderSection("C");
  renderSection("D");
  renderSection("E");
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  renderSignaturePads();
});

// ---------- SIGNATURE PADS ----------
function renderSignaturePads() {
  document.querySelectorAll(".sigpad-slot").forEach(slot => {
    const id = slot.dataset.id;
    const label = slot.dataset.label || "Signature";
    slot.innerHTML = `
      <label>${label}</label>
      <div class="sigpad-wrap">
        <canvas id="${id}" class="sigpad" width="480" height="110"></canvas>
        <div class="sigpad-actions">
          <span class="small-muted">Sign with mouse, finger, or stylus</span>
          <button type="button" data-clear="${id}">Clear</button>
        </div>
      </div>
    `;
    const canvas = document.getElementById(id);
    setupSignaturePad(canvas);
  });
  document.querySelectorAll("[data-clear]").forEach(btn => {
    btn.addEventListener("click", () => {
      const canvas = document.getElementById(btn.dataset.clear);
      if (canvas && canvas._clearSig) canvas._clearSig();
    });
  });
}

function setupSignaturePad(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#0b2340";
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  let drawing = false;
  let hasInk = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  function start(e) {
    drawing = true;
    hasInk = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.preventDefault();
  }
  function move(e) {
    if (!drawing) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    e.preventDefault();
  }
  function end() { drawing = false; }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  canvas._hasInk = () => hasInk;
  canvas._clearSig = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk = false;
  };
}

// ---------- helpers to read selected radio values ----------
function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

// ---------- PDF GENERATION ----------
async function generatePDF() {
  const statusMsg = document.getElementById("statusMsg");
  const clinicianName = val("clinicianName").trim();
  if (!clinicianName) {
    statusMsg.textContent = "Please enter the Team Member Name before generating the PDF.";
    statusMsg.style.color = "#b3261e";
    return;
  }
  statusMsg.style.color = "";
  statusMsg.textContent = "Building PDF...";

  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const form = pdfDoc.getForm();

  const MARGIN = 46;
  const PAGE_W = 612, PAGE_H = 792;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  let fieldCounter = 0;

  function newPage() {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  }
  function ensureSpace(needed) {
    if (y - needed < MARGIN) newPage();
  }
  function wrapText(text, maxWidth, f, size) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  function drawHeading(title) {
    ensureSpace(40);
    page.drawText(title, { x: MARGIN, y: y - 14, size: 13, font: bold, color: rgb(0.043,0.14,0.25) });
    page.drawLine({ start: {x: MARGIN, y: y - 20}, end: {x: PAGE_W-MARGIN, y: y-20}, thickness: 1.2, color: rgb(0.79,0.64,0.31) });
    y -= 34;
  }
  function drawSub(text) {
    const lines = wrapText(text, CONTENT_W, font, 9);
    ensureSpace(lines.length * 11 + 6);
    lines.forEach(l => {
      page.drawText(l, { x: MARGIN, y: y, size: 9, font, color: rgb(0.36,0.42,0.49) });
      y -= 11;
    });
    y -= 6;
  }
  function drawKeyValueLine(pairs) {
    // pairs: [[label, value], ...] evenly spaced across content width
    ensureSpace(16);
    const colW = CONTENT_W / pairs.length;
    pairs.forEach(([label, value], i) => {
      const x = MARGIN + i * colW;
      page.drawText(`${label}: `, { x, y, size: 9.5, font: bold, color: rgb(0.07,0.16,0.29) });
      const lw = bold.widthOfTextAtSize(`${label}: `, 9.5);
      page.drawText(value || "___________", { x: x + lw, y, size: 9.5, font, color: rgb(0.1,0.1,0.1) });
    });
    y -= 18;
  }
  function drawTextFieldRow(label, value, widthFrac) {
    ensureSpace(30);
    const w = CONTENT_W * (widthFrac || 1);
    page.drawText(label, { x: MARGIN, y, size: 9, font: bold, color: rgb(0.07,0.16,0.29) });
    y -= 12;
    fieldCounter++;
    const tf = form.createTextField(`field_${fieldCounter}_${label.replace(/[^a-zA-Z0-9]/g,'')}`);
    tf.setText(value || "");
    tf.addToPage(page, { x: MARGIN, y: y - 14, width: w, height: 16, borderWidth: 0.7 });
    y -= 26;
  }
  async function embedSignature(canvasId, x, yTop, w, h) {
    page.drawRectangle({ x, y: yTop - h, width: w, height: h, borderColor: rgb(0.75,0.79,0.83), borderWidth: 0.7 });
    const canvas = document.getElementById(canvasId);
    if (canvas && canvas._hasInk && canvas._hasInk()) {
      const dataUrl = canvas.toDataURL("image/png");
      const pngBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
      const png = await pdfDoc.embedPng(pngBytes);
      const dims = png.scaleToFit(w - 10, h - 10);
      page.drawImage(png, {
        x: x + (w - dims.width) / 2,
        y: yTop - h + (h - dims.height) / 2,
        width: dims.width,
        height: dims.height
      });
    }
  }

  async function drawSigPair(labelSig, canvasId, labelDate, valueDate) {
    const boxH = 42;
    ensureSpace(boxH + 20);
    const w1 = CONTENT_W * 0.65, w2 = CONTENT_W * 0.30;
    page.drawText(labelSig, { x: MARGIN, y, size: 9, font: bold, color: rgb(0.07,0.16,0.29) });
    page.drawText(labelDate, { x: MARGIN + w1 + 10, y, size: 9, font: bold, color: rgb(0.07,0.16,0.29) });
    y -= 12;
    await embedSignature(canvasId, MARGIN, y, w1, boxH);
    fieldCounter++;
    const tf2 = form.createTextField(`sigdate_${fieldCounter}`);
    tf2.setText(valueDate || "");
    tf2.addToPage(page, { x: MARGIN + w1 + 10, y: y - 16, width: w2, height: 16, borderWidth: 0.7 });
    y -= (boxH + 12);
  }

  function drawNameDatePair(labelName, valueName, labelDate, valueDate) {
    ensureSpace(30);
    const w1 = CONTENT_W * 0.65, w2 = CONTENT_W * 0.30;
    page.drawText(labelName, { x: MARGIN, y, size: 9, font: bold, color: rgb(0.07,0.16,0.29) });
    page.drawText(labelDate, { x: MARGIN + w1 + 10, y, size: 9, font: bold, color: rgb(0.07,0.16,0.29) });
    y -= 12;
    fieldCounter++;
    const tf1 = form.createTextField(`name_${fieldCounter}`);
    tf1.setText(valueName || "");
    tf1.addToPage(page, { x: MARGIN, y: y - 14, width: w1, height: 16, borderWidth: 0.7 });
    fieldCounter++;
    const tf2 = form.createTextField(`namedate_${fieldCounter}`);
    tf2.setText(valueDate || "");
    tf2.addToPage(page, { x: MARGIN + w1 + 10, y: y - 14, width: w2, height: 16, borderWidth: 0.7 });
    y -= 26;
  }

  async function drawSignatureOnly(labelSig, canvasId) {
    const boxH = 42;
    ensureSpace(boxH + 16);
    const w1 = CONTENT_W * 0.65;
    page.drawText(labelSig, { x: MARGIN, y, size: 9, font: bold, color: rgb(0.07,0.16,0.29) });
    y -= 12;
    await embedSignature(canvasId, MARGIN, y, w1, boxH);
    y -= (boxH + 12);
  }
  function drawItemsTable(prefix, colLabel, colLabel2) {
    syncStateFromDOM(prefix);
    const s = sectionRegistry[prefix];
    const activeItems = s.state.filter(it => it.include);

    ensureSpace(22);
    page.drawText("Item", { x: MARGIN, y, size: 8.5, font: bold, color: rgb(0.36,0.42,0.49) });
    if (s.dual) {
      page.drawText(colLabel || "Self", { x: MARGIN + CONTENT_W*0.56, y, size: 8.5, font: bold, color: rgb(0.36,0.42,0.49) });
      page.drawText(colLabel2 || "Peer", { x: MARGIN + CONTENT_W*0.79, y, size: 8.5, font: bold, color: rgb(0.36,0.42,0.49) });
    } else {
      page.drawText(colLabel || "Result", { x: MARGIN + CONTENT_W*0.62, y, size: 8.5, font: bold, color: rgb(0.36,0.42,0.49) });
    }
    y -= 6;
    page.drawLine({ start:{x:MARGIN,y}, end:{x:PAGE_W-MARGIN,y}, thickness:0.7, color: rgb(0.86,0.89,0.92) });
    y -= 12;

    const textColW = CONTENT_W * (s.dual ? 0.52 : 0.58);
    activeItems.forEach((item, renderIdx) => {
      const text = item.text;
      const lines = wrapText(text, textColW, font, 9);
      const rowH = Math.max(lines.length * 11, 14) + 8;
      ensureSpace(rowH);

      let ty = y;
      lines.forEach(l => {
        page.drawText(l, { x: MARGIN, y: ty, size: 9, font, color: rgb(0.11,0.16,0.22) });
        ty -= 11;
      });

      function drawRadioGroup(options, selectedVal, startX, namePrefix) {
        fieldCounter++;
        const rgName = `radio_${namePrefix}_${renderIdx}_${fieldCounter}`;
        const radioGroup = form.createRadioGroup(rgName);
        let optX = startX;
        options.forEach(opt => {
          const boxSize = 10;
          radioGroup.addOptionToPage(opt, page, { x: optX, y: y - 9, width: boxSize, height: boxSize });
          page.drawText(opt, { x: optX + boxSize + 3, y: y - 8, size: 8.5, font, color: rgb(0.11,0.16,0.22) });
          optX += boxSize + 6 + font.widthOfTextAtSize(opt, 8.5) + 10;
        });
        if (selectedVal) {
          try { radioGroup.select(selectedVal); } catch(e) {}
        }
      }

      if (s.dual) {
        drawRadioGroup(s.options, item.selected, MARGIN + CONTENT_W * 0.56, `${prefix}_self`);
        drawRadioGroup(s.options2, item.selected2, MARGIN + CONTENT_W * 0.79, `${prefix}_peer`);
      } else {
        drawRadioGroup(s.options, item.selected, MARGIN + CONTENT_W * 0.62, prefix);
      }

      y -= rowH;
      page.drawLine({ start:{x:MARGIN,y:y+4}, end:{x:PAGE_W-MARGIN,y:y+4}, thickness:0.5, color: rgb(0.92,0.94,0.96) });
    });
    y -= 6;
  }

  const d = DISCIPLINES[currentDiscipline];

  // ---- Cover / header info ----
  page.drawText("Metro Mobile Health Care", { x: MARGIN, y: y, size: 16, font: bold, color: rgb(0.043,0.14,0.25) });
  y -= 20;
  page.drawText(`Home Health ${d.label} (${d.fullName}) — Clinical Competency & Onboarding Packet`, { x: MARGIN, y, size: 11, font, color: rgb(0.36,0.42,0.49) });
  y -= 24;
  page.drawLine({ start:{x:MARGIN,y}, end:{x:PAGE_W-MARGIN,y}, thickness:1.4, color: rgb(0.79,0.64,0.31) });
  y -= 20;

  drawKeyValueLine([
    ["Team Member", clinicianName],
    ["Role", val("clinicalRole")]
  ]);
  drawKeyValueLine([
    ["Agency", val("agencyName")],
    ["Date of Review", val("reviewDate")]
  ]);
  drawKeyValueLine([
    ["Trainer/Leader", val("trainerName")],
    ["Trainer Title", val("trainerTitle")]
  ]);
  y -= 6;

  // ---- Section A ----
  drawHeading(`Section A — Clinical Competency Review Checklist (${d.label})`);
  drawSub("C = Competent; NMT = Needs More Training. Self-rating completed prior to observation; peer/leader rating completed during joint visit.");
  drawItemsTable("A", "Self Rating", "Peer/Leader Rating");
  drawTextFieldRow("Comments", val("commentsA"));
  await drawSigPair("Team Member Signature", "sigA_member", "Date", val("sigA_member_date"));
  await drawSigPair("Trainer/Leader Signature", "sigA_trainer", "Date", val("sigA_trainer_date"));

  // ---- Section B ----
  newPage();
  drawHeading("Section B — Clinical Observation Visit Checklist");
  drawKeyValueLine([
    ["Reason for Visit", val("obsReason")],
    ["Setting", val("obsSetting")]
  ]);
  drawItemsTable("B1", "Result");
  drawSub("Clinical Staff Car Inspection / Stock Checklist");
  drawItemsTable("B2", "Result");
  drawTextFieldRow("Comments", val("commentsB"));
  await drawSigPair("Team Member Signature", "sigB_member", "Date", val("sigB_member_date"));
  await drawSigPair("Trainer/Leader Signature", "sigB_trainer", "Date", val("sigB_trainer_date"));

  // ---- Section C ----
  newPage();
  drawHeading("Section C — Personal Protective Equipment (PPE) Competency");
  drawKeyValueLine([["Review Type", val("ppeType")]]);
  drawItemsTable("C", "D / R-D / N-A");
  drawSub("Attestation: Team member participated in an evaluation for the use of PPE and received training on infection control, and agrees to follow standards of practice related to infection control including PPE and hand hygiene.");
  await drawSigPair("Team Member Signature", "sigC_member", "Date", val("sigC_member_date"));
  await drawSigPair("Director of Clinical Services", "sigC_trainer", "Date", val("sigC_trainer_date"));

  // ---- Section D ----
  newPage();
  drawHeading("Section D — Hand Hygiene & Clinical Bag Technique Competency");
  drawItemsTable("D", "O / V / N-A");
  await drawSigPair("Team Member Signature", "sigD_member", "Date", val("sigD_member_date"));
  await drawSigPair("Trainer/Leader Signature", "sigD_trainer", "Date", val("sigD_trainer_date"));

  // ---- Section E ----
  newPage();
  drawHeading("Section E — Filtering Face Mask / Particulate Respirator Training & Competency");
  drawKeyValueLine([["Type of Review", val("respType")]]);
  drawItemsTable("E", "D / R-D / N-A");
  drawSub("Attestation: Trainer/leader certifies training was provided on the above items and the team member is prepared to perform these procedures independently.");
  await drawSigPair("Team Member Signature", "sigE_member", "Date", val("sigE_member_date"));
  await drawSigPair("Trainer/Leader Signature", "sigE_trainer", "Date", val("sigE_trainer_date"));

  // ---- Section F ----
  newPage();
  drawHeading("Section F — Conclusion of Orientation & Onboarding");
  drawSub(`Attestation for New Team Member: I attest I have completed all required training and learning experiences as outlined in the Home Health ${d.label} (${d.fullName}) Onboarding Guide, had the opportunity to ask questions and work with peers/leaders and patients under direct supervision, and feel prepared and ready to practice independently with appropriate indirect supervision.`);
  drawNameDatePair("Team Member Printed Name", val("sigF_member_print"), "Date", val("sigF_member_date"));
  await drawSignatureOnly("Team Member Signature", "sigF_member_sig");
  y -= 6;
  drawSub(`Attestation for Direct Leader: I attest the above-named team member has completed all required training and learning experiences as outlined in the Home Health ${d.label} (${d.fullName}) Onboarding Guide and is prepared and ready to practice independently with appropriate indirect supervision.`);
  drawNameDatePair("Leader's Printed Name", val("sigF_leader_print"), "Date", val("sigF_leader_date"));
  await drawSignatureOnly("Leader Signature", "sigF_leader_sig");
  drawSub("This attestation must be uploaded to Cred Track along with the completed competency forms and onboarding checklist.");

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = clinicianName.replace(/[^a-zA-Z0-9]+/g, "_");
  a.href = url;
  a.download = `${d.label}_Competency_Onboarding_${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  statusMsg.textContent = "PDF generated and downloaded — upload it to the clinician's file in Cred Track.";
  statusMsg.style.color = "#1f7a4d";
}

document.getElementById("generateBtn").addEventListener("click", generatePDF);

// ---------- EXPORT CURATED STATE AS NEW data.js ----------
function jsArrayLiteral(arr, indent) {
  if (!arr.length) return "[]";
  return "[\n" + arr.map(t => `${indent}  ${JSON.stringify(t)}`).join(",\n") + `\n${indent}]`;
}

function buildExportDataJS() {
  persistSection("A");
  ["B1", "B2", "C", "D", "E"].forEach(persistSection);

  function itemsFor(disciplineKey) {
    const cacheKey = `A_${disciplineKey}`;
    const source = disciplineItemCache[cacheKey] || loadState(cacheKey) || freshState(DISCIPLINES[disciplineKey].items);
    return source.filter(it => it.include).map(it => it.text);
  }

  const disciplineBlocks = Object.keys(DISCIPLINES).map(key => {
    const d = DISCIPLINES[key];
    const items = itemsFor(key);
    return `  ${key}: {\n    label: ${JSON.stringify(d.label)},\n    fullName: ${JSON.stringify(d.fullName)},\n    items: ${jsArrayLiteral(items, "    ")}\n  }`;
  }).join(",\n");

  const sharedArr = (name, prefix) => {
    const items = getState(prefix).filter(it => it.include).map(it => it.text);
    return `const ${name} = ${jsArrayLiteral(items, "")};`;
  };

  return `// Metro Mobile Health Care — Clinical Competency & Onboarding Checklist data
// Exported from the live tool on ${new Date().toISOString()}
// Reflects the current curated item lists (removed items excluded, edits applied).
// Replace data.js in the mmhc-skills repo with this file to make these the
// permanent defaults for everyone.

const DISCIPLINES = {
${disciplineBlocks}
};

${sharedArr("OBSERVATION_ITEMS", "B1")}
${sharedArr("CAR_STOCK_ITEMS", "B2")}
${sharedArr("PPE_ITEMS", "C")}
${sharedArr("HAND_HYGIENE_ITEMS", "D")}
${sharedArr("RESPIRATOR_ITEMS", "E")}

const RESULT_OPTIONS_CNMT = ["C", "NMT"];
const RESULT_OPTIONS_MET = ["Met", "Unmet", "N/A"];
const RESULT_OPTIONS_DRD = ["D", "R/D", "N/A"];
const RESULT_OPTIONS_OV = ["O", "V", "N/A"];
`;
}

document.getElementById("exportBtn").addEventListener("click", () => {
  const statusMsg = document.getElementById("statusMsg");
  const code = buildExportDataJS();
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  statusMsg.style.color = "#1f7a4d";
  statusMsg.textContent = "data.js downloaded — upload it to mmhc-skills (same filename) to make these edits permanent.";
});
