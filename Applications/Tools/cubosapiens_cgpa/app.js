/* ============================================================
   cuboCGPA – app.js
   Sections:
   1.  State
   2.  Grade presets
   3.  Element references
   4.  Theme toggle
   5.  Tab switching
   6.  Scale selector
   7.  Grade map — add / remove / render
   8.  Grade preset loader
   9.  Semester — add / remove
   10. Subject — add / remove
   11. Grade select builder
   12. CGPA calculation
   13. Result ring update
   14. Target CGPA calculator
   15. Export JSON
   16. Export PDF (print-friendly page)
   17. Toast helper
   18. Init
   ============================================================ */


/* ── 1. State ── */
let currentScale = 10;
let semesters    = [];   // [{ id, subjects: [{ name, credits, gradeKey }] }]
let gradeMap     = [];   // [{ letter, points }]  — user-defined
let semNextId    = 0;
let subNextId    = 0;


/* ── 2. Grade Presets ── */
const PRESETS = {
  anna: [
    { letter: 'O',  points: 10 },
    { letter: 'A+', points: 9  },
    { letter: 'A',  points: 8  },
    { letter: 'B+', points: 7  },
    { letter: 'B',  points: 6  },
    { letter: 'C',  points: 5  },
    { letter: 'U',  points: 0  },
  ],
  vtu: [
    { letter: 'O',  points: 10 },
    { letter: 'A+', points: 9  },
    { letter: 'A',  points: 8  },
    { letter: 'B+', points: 7  },
    { letter: 'B',  points: 6  },
    { letter: 'C',  points: 5  },
    { letter: 'P',  points: 4  },
    { letter: 'F',  points: 0  },
  ],
  cbse: [
    { letter: 'A1', points: 10 },
    { letter: 'A2', points: 9  },
    { letter: 'B1', points: 8  },
    { letter: 'B2', points: 7  },
    { letter: 'C1', points: 6  },
    { letter: 'C2', points: 5  },
    { letter: 'D1', points: 4  },
    { letter: 'D2', points: 3  },
    { letter: 'E',  points: 0  },
  ],
  usa4: [
    { letter: 'A',  points: 4.0 },
    { letter: 'A-', points: 3.7 },
    { letter: 'B+', points: 3.3 },
    { letter: 'B',  points: 3.0 },
    { letter: 'B-', points: 2.7 },
    { letter: 'C+', points: 2.3 },
    { letter: 'C',  points: 2.0 },
    { letter: 'C-', points: 1.7 },
    { letter: 'D',  points: 1.0 },
    { letter: 'F',  points: 0   },
  ],
};


/* ── 3. Element References ── */
const themeToggle   = document.getElementById('themeToggle');
const semesterList  = document.getElementById('semesterList');
const btnAddSemester= document.getElementById('btnAddSemester');
const gradeMapList  = document.getElementById('gradeMapList');
const btnAddGrade   = document.getElementById('btnAddGrade');
const cgpaValue     = document.getElementById('cgpaValue');
const cgpaSub       = document.getElementById('cgpaSub');
const ringFill      = document.getElementById('ringFill');
const ringLabel     = document.getElementById('ringLabel');
const btnExportJSON = document.getElementById('btnExportJSON');
const btnExportPDF  = document.getElementById('btnExportPDF');
const btnCalcTarget = document.getElementById('btnCalcTarget');
const targetResult  = document.getElementById('targetResult');
const toastEl       = document.getElementById('toast');


/* ── 4. Theme Toggle ── */
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});


/* ── 5. Tab Switching ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});


/* ── 6. Scale Selector ── */
document.querySelectorAll('.seg-btn[data-scale]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-scale]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentScale = btn.dataset.scale === 'custom' ? 'custom' : parseInt(btn.dataset.scale);
    recalcAll();
  });
});


/* ── 7. Grade Map — add / remove / render ── */
function addGradeEntry(letter = '', points = '') {
  const id = subNextId++;
  gradeMap.push({ id, letter, points });
  renderGradeMap();
  rebuildAllGradeSelects();
}

function removeGradeEntry(id) {
  gradeMap = gradeMap.filter(g => g.id !== id);
  renderGradeMap();
  rebuildAllGradeSelects();
}

function renderGradeMap() {
  gradeMapList.innerHTML = '';
  gradeMap.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'grade-map-row';

    const letterInput = document.createElement('input');
    letterInput.className = 'field-input';
    letterInput.placeholder = 'Grade (e.g. A+)';
    letterInput.value = entry.letter;
    letterInput.addEventListener('input', () => {
      entry.letter = letterInput.value.trim();
      rebuildAllGradeSelects();
    });

    const pointsInput = document.createElement('input');
    pointsInput.className = 'field-input';
    pointsInput.type = 'number';
    pointsInput.placeholder = 'Points (e.g. 9)';
    pointsInput.value = entry.points;
    pointsInput.min = 0;
    pointsInput.step = 0.1;
    pointsInput.addEventListener('input', () => {
      entry.points = parseFloat(pointsInput.value) || 0;
      recalcAll();
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-btn';
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeBtn.addEventListener('click', () => removeGradeEntry(entry.id));

    row.appendChild(letterInput);
    row.appendChild(pointsInput);
    row.appendChild(removeBtn);
    gradeMapList.appendChild(row);
  });
}

btnAddGrade.addEventListener('click', () => addGradeEntry());


/* ── 8. Grade Preset Loader ── */
document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = PRESETS[btn.dataset.preset];
    if (!preset) return;
    gradeMap = preset.map((g, i) => ({ id: i, letter: g.letter, points: g.points }));
    subNextId = gradeMap.length;
    renderGradeMap();
    rebuildAllGradeSelects();
    showToast(`${btn.textContent.trim()} grade map loaded`);
  });
});


/* ── 9. Semester — add / remove ── */
function addSemester() {
  const id  = semNextId++;
  const sem = { id, subjects: [] };
  semesters.push(sem);
  const block = buildSemesterBlock(sem);
  semesterList.appendChild(block);
  addSubject(sem, block);  // start with one empty subject
}

function removeSemester(id, block) {
  semesters = semesters.filter(s => s.id !== id);
  block.style.opacity    = '0';
  block.style.transform  = 'scale(0.97)';
  block.style.transition = 'all 0.2s ease';
  setTimeout(() => { block.remove(); recalcAll(); }, 200);
}

function buildSemesterBlock(sem) {
  const block = document.createElement('div');
  block.className = 'semester-block';
  block.dataset.semId = sem.id;

  // Header
  const header = document.createElement('div');
  header.className = 'semester-header';

  const titleInput = document.createElement('input');
  titleInput.className = 'field-input';
  titleInput.style.cssText = 'width:140px;font-weight:600;';
  titleInput.value = `Semester ${sem.id + 1}`;
  titleInput.placeholder = 'Semester name';

  const gpaLabel = document.createElement('span');
  gpaLabel.className = 'semester-gpa';
  gpaLabel.dataset.role = 'semGpa';
  gpaLabel.textContent = 'GPA: —';

  const actions = document.createElement('div');
  actions.className = 'semester-actions';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'icon-btn';
  removeBtn.title = 'Remove semester';
  removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  removeBtn.addEventListener('click', () => removeSemester(sem.id, block));

  actions.appendChild(gpaLabel);
  actions.appendChild(removeBtn);
  header.appendChild(titleInput);
  header.appendChild(actions);
  block.appendChild(header);

  // Column headers
  const colHeader = document.createElement('div');
  colHeader.className = 'subject-header';
  colHeader.innerHTML = `
    <span>Subject</span>
    <span>Credits</span>
    <span>Grade</span>
    <span></span>
  `;
  block.appendChild(colHeader);

  // Subject list container
  const subjectContainer = document.createElement('div');
  subjectContainer.dataset.role = 'subjectContainer';
  block.appendChild(subjectContainer);

  // Add subject button
  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add-subject';
  addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add subject';
  addBtn.addEventListener('click', () => addSubject(sem, block));
  block.appendChild(addBtn);

  return block;
}

btnAddSemester.addEventListener('click', () => {
  addSemester();
  recalcAll();
});


/* ── 10. Subject — add / remove ── */
function addSubject(sem, block) {
  const id  = subNextId++;
  const sub = { id, name: '', credits: 0, gradeKey: '' };
  sem.subjects.push(sub);

  const container = block.querySelector('[data-role="subjectContainer"]');
  const row = buildSubjectRow(sub, sem, block);
  container.appendChild(row);
}

function removeSubject(subId, sem, block) {
  sem.subjects = sem.subjects.filter(s => s.id !== subId);
  const container = block.querySelector('[data-role="subjectContainer"]');
  const row = container.querySelector(`[data-sub-id="${subId}"]`);
  if (row) {
    row.style.opacity    = '0';
    row.style.transition = 'opacity 0.2s ease';
    setTimeout(() => { row.remove(); recalcAll(); }, 200);
  }
}

function buildSubjectRow(sub, sem, block) {
  const row = document.createElement('div');
  row.className = 'subject-row';
  row.dataset.subId = sub.id;

  // Subject name
  const nameInput = document.createElement('input');
  nameInput.className = 'field-input';
  nameInput.placeholder = 'Subject name';
  nameInput.value = sub.name;
  nameInput.addEventListener('input', () => { sub.name = nameInput.value; });

  // Credits
  const creditsInput = document.createElement('input');
  creditsInput.className = 'field-input';
  creditsInput.type = 'number';
  creditsInput.placeholder = '3';
  creditsInput.min = 0; creditsInput.step = 0.5;
  creditsInput.value = sub.credits || '';
  creditsInput.addEventListener('input', () => {
    sub.credits = parseFloat(creditsInput.value) || 0;
    recalcAll();
  });

  // Grade select
  const gradeSelect = buildGradeSelect(sub);
  gradeSelect.addEventListener('change', () => {
    sub.gradeKey = gradeSelect.value;
    recalcAll();
  });

  // Remove
  const removeBtn = document.createElement('button');
  removeBtn.className = 'icon-btn';
  removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  removeBtn.addEventListener('click', () => removeSubject(sub.id, sem, block));

  row.appendChild(nameInput);
  row.appendChild(creditsInput);
  row.appendChild(gradeSelect);
  row.appendChild(removeBtn);

  return row;
}


/* ── 11. Grade Select Builder ── */
function buildGradeSelect(sub) {
  const sel = document.createElement('select');
  sel.className = 'grade-select';
  sel.dataset.subId = sub.id;

  populateGradeSelect(sel, sub.gradeKey);
  return sel;
}

function populateGradeSelect(sel, currentKey) {
  sel.innerHTML = '';

  // Blank option
  const blank = document.createElement('option');
  blank.value = ''; blank.textContent = '— Grade —';
  sel.appendChild(blank);

  if (gradeMap.length > 0) {
    gradeMap.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.letter;
      opt.textContent = `${g.letter} (${g.points})`;
      if (g.letter === currentKey) opt.selected = true;
      sel.appendChild(opt);
    });
  } else {
    // Numeric fallback based on scale
    const max = currentScale === 4 ? 4.0 : 10;
    const step = currentScale === 4 ? 0.1 : 1;
    for (let v = max; v >= 0; v = parseFloat((v - step).toFixed(2))) {
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      if (String(v) === String(currentKey)) opt.selected = true;
      sel.appendChild(opt);
    }
  }
}

function rebuildAllGradeSelects() {
  semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      const sel = document.querySelector(`select[data-sub-id="${sub.id}"]`);
      if (sel) populateGradeSelect(sel, sub.gradeKey);
    });
  });
  recalcAll();
}


/* ── 12. CGPA Calculation ── */
function getGradePoints(gradeKey) {
  if (!gradeKey) return null;
  // Try grade map first
  const mapped = gradeMap.find(g => g.letter === gradeKey);
  if (mapped) return parseFloat(mapped.points);
  // Fallback: it's already a number
  const num = parseFloat(gradeKey);
  return Number.isNaN(num) ? null : num;
}

function calcSemesterGPA(sem) {
  let totalCredits = 0, totalPoints = 0;
  sem.subjects.forEach(sub => {
    const pts = getGradePoints(sub.gradeKey);
    if (pts !== null && sub.credits > 0) {
      totalCredits += sub.credits;
      totalPoints  += pts * sub.credits;
    }
  });
  if (totalCredits === 0) return null;
  return totalPoints / totalCredits;
}

function recalcAll() {
  let grandCredits = 0, grandPoints = 0;

  semesters.forEach(sem => {
    const gpa = calcSemesterGPA(sem);
    const gpaLabel = document.querySelector(
      `.semester-block[data-sem-id="${sem.id}"] [data-role="semGpa"]`
    );
    if (gpaLabel) {
      gpaLabel.textContent = gpa !== null ? `GPA: ${gpa.toFixed(2)}` : 'GPA: —';
    }

    sem.subjects.forEach(sub => {
      const pts = getGradePoints(sub.gradeKey);
      if (pts !== null && sub.credits > 0) {
        grandCredits += sub.credits;
        grandPoints  += pts * sub.credits;
      }
    });
  });

  if (grandCredits === 0) {
    cgpaValue.textContent = '—';
    cgpaSub.textContent   = 'Add subjects to calculate';
    updateRing(0);
    return;
  }

  const cgpa = grandPoints / grandCredits;
  cgpaValue.textContent = cgpa.toFixed(2);

  const scale = currentScale === 'custom' ? 10 : currentScale;
  const pct   = Math.min((cgpa / scale) * 100, 100);
  cgpaSub.textContent = `${grandCredits} total credits · ${pct.toFixed(1)}% of scale`;
  updateRing(pct);
}


/* ── 13. Result Ring Update ── */
function updateRing(pct) {
  const circumference = 213.6; // 2πr where r=34
  const offset = circumference - (pct / 100) * circumference;
  ringFill.style.strokeDashoffset = offset;
  ringLabel.textContent = pct.toFixed(0) + '%';
}


/* ── 14. Target CGPA Calculator ── */
btnCalcTarget.addEventListener('click', () => {
  const current   = parseFloat(document.getElementById('tCurrentCGPA').value);
  const done      = parseFloat(document.getElementById('tDoneCredits').value);
  const target    = parseFloat(document.getElementById('tTargetCGPA').value);
  const remaining = parseFloat(document.getElementById('tRemainingCredits').value);

  if ([current, done, target, remaining].some(isNaN)) {
    showToast('Fill in all four fields');
    return;
  }

  const scale = currentScale === 'custom' ? 10 : currentScale;
  if (target > scale) {
    showToast(`Target CGPA can't exceed scale (${scale})`);
    return;
  }

  // Required = (target × totalCredits − current × doneCredits) / remainingCredits
  const totalCredits = done + remaining;
  const required = (target * totalCredits - current * done) / remaining;

  targetResult.style.display = 'block';

  if (required > scale) {
    targetResult.innerHTML = `
      <p>To reach a CGPA of <strong>${target}</strong>, you need a GPA of
      <strong>${required.toFixed(2)}</strong> in the remaining
      <strong>${remaining}</strong> credits — which exceeds the maximum scale of
      <strong>${scale}</strong>.</p>
      <p style="margin-top:8px;color:var(--text-2);">Try adjusting your target or timeline.</p>
    `;
  } else if (required < 0) {
    targetResult.innerHTML = `
      <p>You have already achieved a CGPA above <strong>${target}</strong> with your current
      <strong>${current}</strong> — you're on track! 🎉</p>
    `;
  } else {
    targetResult.innerHTML = `
      <p>You need a GPA of <strong>${required.toFixed(2)}</strong> across the remaining
      <strong>${remaining}</strong> credits to reach an overall CGPA of
      <strong>${target}</strong>.</p>
      <p style="margin-top:8px;color:var(--text-2);">
        Total credits: ${totalCredits} · Current earned points: ${(current * done).toFixed(1)}
      </p>
    `;
  }
});


/* ── 15. Export JSON ── */
btnExportJSON.addEventListener('click', () => {
  const data = {
    scale: currentScale,
    gradeMap,
    cgpa: cgpaValue.textContent,
    semesters: semesters.map(sem => ({
      name: `Semester ${sem.id + 1}`,
      gpa: calcSemesterGPA(sem),
      subjects: sem.subjects.map(s => ({
        name: s.name,
        credits: s.credits,
        grade: s.gradeKey,
        points: getGradePoints(s.gradeKey)
      }))
    })),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cuboCGPA-results.json';
  a.click();
  showToast('JSON exported!');
});


/* ── 16. Export PDF ── */
btnExportPDF.addEventListener('click', () => {
  const scale = currentScale === 'custom' ? 10 : currentScale;

  let rows = '';
  semesters.forEach(sem => {
    const gpa = calcSemesterGPA(sem);
    rows += `<tr class="sem-row"><td colspan="4"><strong>Semester ${sem.id + 1}</strong> &nbsp; GPA: ${gpa !== null ? gpa.toFixed(2) : '—'}</td></tr>`;
    sem.subjects.forEach(sub => {
      const pts = getGradePoints(sub.gradeKey);
      rows += `<tr>
        <td>${sub.name || '—'}</td>
        <td>${sub.credits}</td>
        <td>${sub.gradeKey || '—'}</td>
        <td>${pts !== null ? pts : '—'}</td>
      </tr>`;
    });
  });

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>cuboCGPA Report</title>
  <style>
    body { font-family: 'DM Sans', sans-serif; padding: 32px; color: #1d1d1f; }
    h1 { font-size: 1.6rem; color: #e34949; margin-bottom: 4px; }
    p  { color: #6e6e73; font-size: 0.85rem; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th { background: #f5f5f7; padding: 8px 12px; text-align: left;
         font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: #aeaeb2; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
    .sem-row td { background: #fff5f5; color: #e34949; font-size: 0.82rem; }
    .cgpa-summary { margin-top: 24px; padding: 16px; background: #f5f5f7;
                    border-radius: 12px; font-size: 1rem; }
    .cgpa-summary strong { font-size: 1.6rem; color: #e34949; }
  </style></head><body>
  <h1>cuboCGPA Report</h1>
  <p>Generated on ${new Date().toLocaleDateString()} · Scale: ${scale}-point</p>
  <table>
    <thead><tr><th>Subject</th><th>Credits</th><th>Grade</th><th>Points</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="cgpa-summary">Overall CGPA: <strong>${cgpaValue.textContent}</strong></div>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
});


/* ── 17. Toast Helper ── */
let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}


/* ── 18. Init ── */
// Load Anna University preset by default
gradeMap = PRESETS.anna.map((g, i) => ({ id: i, letter: g.letter, points: g.points }));
subNextId = gradeMap.length;
renderGradeMap();
addSemester();   // start with one semester
recalcAll();
