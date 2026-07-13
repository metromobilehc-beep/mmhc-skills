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
      if (sectionRegistry["A"]) syncStateFromDOM("A");
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

function freshState(items) {
  return items.map(t => ({ text: t, include: true, selected: "" }));
}

function registerSection(prefix, bodyId, toolsId, options, addLabel) {
  sectionRegistry[prefix] = { bodyId, toolsId, options, addLabel: addLabel || "+ Add item" };
}

function getState(prefix) {
  return sectionRegistry[prefix].state;
}

function syncStateFromDOM(prefix) {
  const s = sectionRegistry[prefix];
  s.state.forEach((item, idx) => {
    if (!item.include) return;
    const sel = getRadioValue(`${prefix}_${idx}`);
    if (sel) item.selected = sel;
    const inp = document.querySelector(`input.item-edit[data-key="${prefix}"][data-idx="${idx}"]`);
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
    const name = `${prefix}_${idx}`;
    tr.innerHTML = `
      <td class="item-text">
        <div class="item-row-controls">
          <input type="text" class="item-edit" data-key="${prefix}" data-idx="${idx}" value="${escapeHtml(item.text)}">
          <button type="button" class="removeBtn" data-key="${prefix}" data-idx="${idx}" title="Not applicable / remove">✕</button>
        </div>
      </td>
      <td><div class="radiogrp">${radioGroupHTML(name, s.options, item.selected)}</div></td>
    `;
    tbody.appendChild(tr);
  });

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
  } else if (restoreBtn) {
    const { key, idx } = restoreBtn.dataset;
    syncStateFromDOM(key);
    getState(key)[+idx].include = true;
    renderSection(key);
  } else if (addBtn) {
    const key = addBtn.dataset.key;
    syncStateFromDOM(key);
    getState(key).push({ text: "", include: true, selected: "" });
    renderSection(key);
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
    sectionRegistry["B1"].state = freshState(OBSERVATION_ITEMS);
    registerSection("B2", "itemsBodyB2", "toolsB2", RESULT_OPTIONS_MET);
    sectionRegistry["B2"].state = freshState(CAR_STOCK_ITEMS);
    registerSection("C", "itemsBodyC", "toolsC", RESULT_OPTIONS_DRD);
    sectionRegistry["C"].state = freshState(PPE_ITEMS);
    registerSection("D", "itemsBodyD", "toolsD", RESULT_OPTIONS_OV);
    sectionRegistry["D"].state = freshState(HAND_HYGIENE_ITEMS);
    registerSection("E", "itemsBodyE", "toolsE", RESULT_OPTIONS_DRD);
    sectionRegistry["E"].state = freshState(RESPIRATOR_ITEMS);
  }

  // Section A is discipline-specific; cache each discipline's working copy
  // separately so edits/removals aren't lost when switching tabs.
  registerSection("A", "itemsBodyA", "toolsA", RESULT_OPTIONS_CNMT);
  const cacheKey = `A_${currentDiscipline}`;
  if (!disciplineItemCache[cacheKey]) {
    disciplineItemCache[cacheKey] = freshState(d.items);
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
  function drawItemsTable(prefix, colLabel) {
    syncStateFromDOM(prefix);
    const s = sectionRegistry[prefix];
    const options = s.options;
    const activeItems = s.state.filter(it => it.include);

    ensureSpace(22);
    page.drawText("Item", { x: MARGIN, y, size: 8.5, font: bold, color: rgb(0.36,0.42,0.49) });
    page.drawText(colLabel || "Result", { x: MARGIN + CONTENT_W*0.62, y, size: 8.5, font: bold, color: rgb(0.36,0.42,0.49) });
    y -= 6;
    page.drawLine({ start:{x:MARGIN,y}, end:{x:PAGE_W-MARGIN,y}, thickness:0.7, color: rgb(0.86,0.89,0.92) });
    y -= 12;

    const textColW = CONTENT_W * 0.58;
    activeItems.forEach((item, renderIdx) => {
      const text = item.text;
      const selected = item.selected;
      const lines = wrapText(text, textColW, font, 9);
      const rowH = Math.max(lines.length * 11, 14) + 8;
      ensureSpace(rowH);

      let ty = y;
      lines.forEach(l => {
        page.drawText(l, { x: MARGIN, y: ty, size: 9, font, color: rgb(0.11,0.16,0.22) });
        ty -= 11;
      });

      // radio group as PDF form field
      fieldCounter++;
      const rgName = `radio_${prefix}_${renderIdx}_${fieldCounter}`;
      const radioGroup = form.createRadioGroup(rgName);
      let optX = MARGIN + CONTENT_W * 0.62;
      options.forEach(opt => {
        const boxSize = 10;
        radioGroup.addOptionToPage(opt, page, { x: optX, y: y - 9, width: boxSize, height: boxSize });
        page.drawText(opt, { x: optX + boxSize + 3, y: y - 8, size: 8.5, font, color: rgb(0.11,0.16,0.22) });
        optX += boxSize + 6 + font.widthOfTextAtSize(opt, 8.5) + 12;
      });
      if (selected) {
        try { radioGroup.select(selected); } catch(e) {}
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
  drawItemsTable("A", "Self / Peer Rating");
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
