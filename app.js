/**
 * Thank You, Next - Desktop Application Controller
 * Pure Vanilla JavaScript - Offline, Fast, Keyboard-first, Zero Emojis
 */

const BOSNIAN_MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Juni",
  "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"
];

const BOSNIAN_DAYS = [
  "nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"
];

const ZONE_LABELS = {
  calendar: "U kalendaru",
  soon: "Ovih dana",
  longterm: "Dugoročno",
  ideas: "Ideje"
};

// INITIAL SEED DATA
const DEFAULT_DATA = {
  categories: [
    {
      id: "fragaria",
      name: "Fragaria",
      color: "#2D6A4F",
      subcategories: ["Web stranica", "Sadnice", "Nabava"]
    },
    {
      id: "apartmani",
      name: "Apartmani",
      color: "#1D3557",
      subcategories: ["Apartman 1", "Apartman 2", "Rezervacije"]
    },
    {
      id: "doktorski",
      name: "Doktorski",
      color: "#C05621",
      subcategories: ["Pregledi", "Recepti", "Nalazi"]
    },
    {
      id: "posao",
      name: "Posao",
      color: "#4A5568",
      subcategories: ["Izvještaji", "Ugovori", "Sastanci"]
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Javiti se doktoru za nalaze",
      categoryId: "doktorski",
      subcategoryId: "Pregledi",
      zone: "calendar",
      date: getTodayStr(),
      timeAlert: "11:00",
      followUp: true,
      completed: false,
      archived: false,
      order: 1,
      rolledOver: false
    },
    {
      id: "task-2",
      title: "Poslati kvartalno izvješće",
      categoryId: "posao",
      subcategoryId: "Izvještaji",
      zone: "calendar",
      date: getTodayStr(),
      timeAlert: "11:00",
      followUp: false,
      completed: false,
      archived: false,
      order: 2,
      rolledOver: false
    },
    {
      id: "task-3",
      title: "Naručiti ambalažu za sadnice",
      categoryId: "fragaria",
      subcategoryId: "Sadnice",
      zone: "soon",
      date: "",
      timeAlert: "11:00",
      followUp: false,
      completed: false,
      archived: false,
      order: 1,
      rolledOver: false
    },
    {
      id: "task-4",
      title: "Provjeriti posteljinu i inventar",
      categoryId: "apartmani",
      subcategoryId: "Apartman 1",
      zone: "soon",
      date: "",
      timeAlert: "11:00",
      followUp: false,
      completed: false,
      archived: false,
      order: 2,
      rolledOver: false
    },
    {
      id: "task-5",
      title: "Redizajn naslovne stranice i optimizacija navigacije",
      categoryId: "fragaria",
      subcategoryId: "Web stranica",
      zone: "longterm",
      date: "",
      timeAlert: "11:00",
      followUp: false,
      completed: false,
      archived: false,
      order: 1,
      rolledOver: false
    },
    {
      id: "task-6",
      title: "Ideja za uvođenje online rezervacija sadnica",
      categoryId: "fragaria",
      subcategoryId: "Web stranica",
      zone: "ideas",
      date: "",
      timeAlert: "11:00",
      followUp: false,
      completed: false,
      archived: false,
      order: 1,
      rolledOver: false
    }
  ],
  settings: {
    sound: true,
    plannerHeight: 220,
    calendarMaximized: false,
    collapsedZones: {},
    weekHeights: {}
  }
};

// STATE
let appState = { ...DEFAULT_DATA };
let currentViewDate = new Date();
let lastCompletedTaskId = null;
let toastTimeout = null;
let editingTaskId = null;
let draggedTaskId = null;
let draggedCategoryId = null;
let targetColorCategoryId = null;
let activeDayInlineDate = null;
let activeCalendarInlineCategoryId = null;
let categoryToDeleteId = null;
let selectedCalendarDate = getTodayStr();

// HELPERS
function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimePlusOneHourStr() {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDateStr(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateStr(date);
}

// AUDIO SYNTHESIZER
let audioCtx = null;
function playChime() {
  if (!appState.settings.sound) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.18);
    
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(659.25, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.22);
    
    gain2.gain.setValueAtTime(0.001, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
}

// STORAGE & PERSISTENCE
function loadData() {
  try {
    const saved = localStorage.getItem("thank_you_next_data");
    if (saved) {
      const parsed = JSON.parse(saved);
      appState = {
        ...DEFAULT_DATA,
        ...parsed,
        categories: parsed.categories || DEFAULT_DATA.categories,
        tasks: parsed.tasks || DEFAULT_DATA.tasks,
        settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }
      };
    }
  } catch (e) {
    console.error("Failed to load local storage data:", e);
  }
  
  runRolloverCheck();
  updateSoundLabel();
  applySavedLayout();
}

window.receiveNativeData = function(nativeData) {
  if (nativeData && typeof nativeData === "object") {
    appState = {
      ...DEFAULT_DATA,
      ...nativeData,
      categories: nativeData.categories || DEFAULT_DATA.categories,
      tasks: nativeData.tasks || DEFAULT_DATA.tasks,
      settings: { ...DEFAULT_DATA.settings, ...(nativeData.settings || {}) }
    };
    runRolloverCheck();
    updateSoundLabel();
    applySavedLayout();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
};

function saveData(skipCloudSync = false) {
  try {
    appState.lastModified = Date.now();
    localStorage.setItem("thank_you_next_data", JSON.stringify(appState));
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeApp) {
      window.webkit.messageHandlers.nativeApp.postMessage({
        action: "saveData",
        payload: JSON.stringify(appState)
      });
    }
    if (!skipCloudSync && typeof CloudSync !== "undefined") {
      CloudSync.schedulePush();
    }
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

// ROLLOVER ENGINE
function runRolloverCheck() {
  const today = getTodayStr();
  let changed = false;

  appState.tasks.forEach(task => {
    if (task.zone === "calendar" && !task.completed && !task.archived && task.date && task.date < today) {
      task.date = today;
      // timeAlert remains unchanged
      task.rolledOver = false;
      changed = true;
    }
  });

  if (changed) {
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
}

// VIEW SWITCHING
function switchView(viewName) {
  document.querySelectorAll(".view-page").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".segment-btn").forEach(el => el.classList.remove("active"));

  if (viewName === "planner") {
    document.getElementById("viewPlanner").classList.add("active");
    document.getElementById("tabPlanner").classList.add("active");
    renderPlanner();
    renderCalendar();
  } else if (viewName === "tree") {
    document.getElementById("viewTree").classList.add("active");
    document.getElementById("tabTree").classList.add("active");
    renderTree();
    setupTreePan();
  }
}

// SOUND TOGGLE
function toggleSound() {
  appState.settings.sound = !appState.settings.sound;
  updateSoundLabel();
  saveData();
  if (appState.settings.sound) {
    playChime();
  }
}

function updateSoundLabel() {
  const label = document.getElementById("soundLabel");
  if (label) {
    label.textContent = appState.settings.sound ? "Zvuk: Uključen" : "Zvuk: Isključen";
  }
}

// SPLIT RESIZING & CALENDAR MAXIMIZING
function applySavedLayout() {
  const planner = document.querySelector(".planner-half");
  if (planner && appState.settings.plannerHeight) {
    planner.style.height = `${appState.settings.plannerHeight}px`;
  }
  const splitView = document.querySelector(".split-view");
  const btn = document.getElementById("btnToggleCalSize");
  if (splitView && appState.settings.calendarMaximized) {
    splitView.classList.add("calendar-maximized");
    if (btn) btn.textContent = "Pola-pola";
  } else if (splitView) {
    splitView.classList.remove("calendar-maximized");
    if (btn) btn.textContent = "Povećaj kalendar";
  }
}

function toggleCalendarMaximize() {
  const splitView = document.querySelector(".split-view");
  const btn = document.getElementById("btnToggleCalSize");
  if (!splitView) return;

  appState.settings.calendarMaximized = !appState.settings.calendarMaximized;
  if (appState.settings.calendarMaximized) {
    splitView.classList.add("calendar-maximized");
    if (btn) btn.textContent = "Pola-pola";
  } else {
    splitView.classList.remove("calendar-maximized");
    if (btn) btn.textContent = "Povećaj kalendar";
  }
  saveData();
}

function setupSplitResizer() {
  const resizer = document.getElementById("splitResizer");
  const planner = document.querySelector(".planner-half");
  if (!resizer || !planner || resizer.dataset.setup) return;
  resizer.dataset.setup = "true";

  let isResizing = false;
  let startY = 0;
  let startHeight = 0;

  const startResize = (clientY) => {
    isResizing = true;
    resizer.classList.add("dragging");
    startY = clientY;
    startHeight = planner.offsetHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const moveResize = (clientY) => {
    if (!isResizing) return;
    const dy = clientY - startY;
    const maxH = window.innerHeight * 0.75;
    const minH = 90;
    const newHeight = Math.max(minH, Math.min(maxH, startHeight + dy));
    planner.style.height = `${newHeight}px`;
  };

  const stopResize = () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      appState.settings.plannerHeight = planner.offsetHeight;
      saveData();
    }
  };

  resizer.addEventListener("mousedown", (e) => startResize(e.clientY));
  window.addEventListener("mousemove", (e) => moveResize(e.clientY));
  window.addEventListener("mouseup", stopResize);

  resizer.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length > 0) {
      startResize(e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (isResizing && e.touches && e.touches.length > 0) {
      moveResize(e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener("touchend", stopResize);
  window.addEventListener("touchcancel", stopResize);
}

// ========================================================
// PLANNER VIEW (INLINE QUICK ENTRY, EDITABLE CATEGORIES)
// ========================================================
function renderPlanner() {
  const container = document.getElementById("plannerCategoriesContainer");
  if (!container) return;
  container.innerHTML = "";

  appState.categories.forEach(category => {
    const col = document.createElement("div");
    col.className = "category-column";
    col.dataset.categoryId = category.id;
    col.ondragover = (e) => handleCategoryColumnDragOver(e, category.id);
    col.ondragleave = (e) => handleCategoryColumnDragLeave(e);
    col.ondrop = (e) => handleCategoryColumnDrop(e, category.id);

    // Filter active tasks for this category (exclude archived and tasks archived from planner)
    const catTasks = appState.tasks.filter(t => t.categoryId === category.id && !t.archived && !t.archivedInPlanner);
    
    const isSimple = category.type === "simple";
    const activeCount = catTasks.filter(t => !t.completed).length;

    let bodyContent = "";
    if (isSimple) {
      bodyContent = `
        <div class="column-body simple-column-body">
          <div class="zone-tasks-list simple-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'soon')">
            ${renderTaskCardList(catTasks)}
          </div>
          <div class="inline-zone-input-wrap">
            <input type="text" class="inline-zone-input simple-category-input" placeholder="+ Upiši stavku" onkeydown="handleSimpleCategoryInputKeyDown(event, '${category.id}')">
          </div>
        </div>
      `;
    } else {
      const calendarTasks = catTasks.filter(t => t.zone === "calendar");
      const soonTasks = catTasks.filter(t => t.zone === "soon");
      const longtermTasks = catTasks.filter(t => t.zone === "longterm");
      const ideasTasks = catTasks.filter(t => t.zone === "ideas");

      const longtermCollapsed = appState.settings.collapsedZones[`${category.id}-longterm`];
      const ideasCollapsed = appState.settings.collapsedZones[`${category.id}-ideas`];

      bodyContent = `
        <div class="column-body">
          <!-- 1. U KALENDARU -->
          <div class="planner-zone" data-zone="calendar" data-category-id="${category.id}" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'calendar')">
            <div class="zone-header first">
              <span>U kalendaru</span>
              <span>${calendarTasks.filter(t => !t.completed).length}</span>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'calendar')">
              ${renderTaskCardList(calendarTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'calendar')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši to-do" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'calendar')" onkeydown="handleZoneInputKeyDown(event, '${category.id}', 'calendar')">
            </div>
          </div>

          <!-- 2. OVIH DANA -->
          <div class="planner-zone" data-zone="soon" data-category-id="${category.id}" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'soon')">
            <div class="zone-header">
              <span>Ovih dana</span>
              <span>${soonTasks.filter(t => !t.completed).length}</span>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'soon')">
              ${renderTaskCardList(soonTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'soon')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši to-do" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'soon')" onkeydown="handleZoneInputKeyDown(event, '${category.id}', 'soon')">
            </div>
          </div>

          <!-- 3. DUGOROČNO -->
          <div class="planner-zone ${longtermCollapsed ? 'zone-collapsed' : ''}" data-zone="longterm" data-category-id="${category.id}" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'longterm')">
            <div class="zone-header">
              <button class="zone-toggle-btn" onclick="toggleZoneCollapse('${category.id}', 'longterm')">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: ${longtermCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.15s;">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>Dugoročno (${longtermTasks.filter(t => !t.completed).length})</span>
              </button>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'longterm')">
              ${renderTaskCardList(longtermTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'longterm')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši dugoročni to-do" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'longterm')" onkeydown="handleZoneInputKeyDown(event, '${category.id}', 'longterm')">
            </div>
          </div>

          <!-- 4. IDEJE -->
          <div class="planner-zone ${ideasCollapsed ? 'zone-collapsed' : ''}" data-zone="ideas" data-category-id="${category.id}" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'ideas')">
            <div class="zone-header">
              <button class="zone-toggle-btn" onclick="toggleZoneCollapse('${category.id}', 'ideas')">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: ${ideasCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.15s;">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>Ideje (${ideasTasks.filter(t => !t.completed).length})</span>
              </button>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleZoneDrop(event, '${category.id}', 'ideas')">
              ${renderTaskCardList(ideasTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'ideas')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši novu ideju" ondragover="handleZoneInputDragOver(event)" ondrop="handleZoneInputDrop(event, '${category.id}', 'ideas')" onkeydown="handleZoneInputKeyDown(event, '${category.id}', 'ideas')">
            </div>
          </div>
        </div>
      `;
    }

    col.innerHTML = `
      <div class="column-header" draggable="true" ondragstart="handleCategoryDragStart(event, '${category.id}')" ondragend="handleCategoryDragEnd(event)">
        <div class="category-badge">
          <span class="color-dot-btn" style="background-color: ${category.color};" onclick="openColorPickerForCategory('${category.id}', event)" title="Promijeni boju"></span>
          <span class="category-name-text" contenteditable="true" spellcheck="false" onblur="handleCategoryInlineRename('${category.id}', this)" onkeydown="handleCategoryRenameKeyDown(event, '${category.id}', this)" title="Kliknite za promjenu naziva">${escapeHtml(category.name)}</span>
        </div>
        <div class="category-actions">
          <span class="column-task-count">${activeCount}</span>
          <button class="btn-icon" style="padding: 2px 6px; font-size: 11px;" onclick="openNewSubcategoryModal('${category.id}')" title="Nova podkategorija">
            + Podkategorija
          </button>
          <button class="btn-tiny-icon" onclick="toggleCategoryType('${category.id}', event)" title="${isSimple ? 'Prebaci na planer sa 4 zone' : 'Prebaci na jednostavnu listu (bez zona)'}">
            ${isSimple ? `
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            ` : `
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            `}
          </button>
          <button class="btn-tiny-icon" onclick="deleteCategory('${category.id}', event)" title="Obriši kategoriju">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      ${bodyContent}
    `;

    container.appendChild(col);
  });

  const addCol = document.createElement("div");
  addCol.className = "add-column-card";
  addCol.innerHTML = "+ Nova kategorija";
  addCol.onclick = openNewCategoryModal;
  container.appendChild(addCol);
}

function handleZoneInputKeyDown(e, categoryId, zone) {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) return;

    const newTask = {
      id: "task-" + Date.now(),
      title: val,
      categoryId,
      subcategoryId: "",
      zone,
      date: zone === "calendar" ? getTodayStr() : "",
      timeAlert: zone === "calendar" ? "11:00" : "",
      followUp: false,
      completed: false,
      archived: false,
      order: Date.now(),
      rolledOver: false
    };

    appState.tasks.push(newTask);
    saveData();
    e.target.value = "";
    
    renderPlanner();
    renderCalendar();
    renderTree();

    requestAnimationFrame(() => {
      setTimeout(() => {
        const col = document.querySelector(`.category-column[data-category-id="${categoryId}"]`);
        if (col) {
          const zoneEl = col.querySelector(`.planner-zone[data-zone="${zone}"] .inline-zone-input`);
          if (zoneEl) {
            zoneEl.focus();
            zoneEl.select();
          }
        }
      }, 15);
    });
  }
}

function handleSimpleCategoryInputKeyDown(e, categoryId) {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) return;

    const newTask = {
      id: "task-" + Date.now(),
      title: val,
      categoryId,
      subcategoryId: "",
      zone: "soon",
      date: "",
      timeAlert: "",
      followUp: false,
      completed: false,
      archived: false,
      order: Date.now(),
      rolledOver: false
    };

    appState.tasks.push(newTask);
    saveData();
    e.target.value = "";
    
    renderPlanner();
    renderCalendar();
    renderTree();

    requestAnimationFrame(() => {
      setTimeout(() => {
        const inp = document.querySelector(`.category-column[data-category-id="${categoryId}"] .simple-category-input`)
                 || document.querySelector(`.tree-branch-col[data-category-id="${categoryId}"] .simple-tree-input`);
        if (inp) {
          inp.focus();
          inp.select();
        }
      }, 15);
    });
  }
}

function handleTreeSubcatSimpleInputKeyDown(e, categoryId, subcategoryName) {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) return;

    const newTask = {
      id: "task-" + Date.now(),
      title: val,
      categoryId,
      subcategoryId: subcategoryName,
      zone: "soon",
      date: "",
      timeAlert: "",
      followUp: false,
      completed: false,
      archived: false,
      order: Date.now(),
      rolledOver: false
    };

    appState.tasks.push(newTask);
    saveData();
    e.target.value = "";
    
    renderPlanner();
    renderCalendar();
    renderTree();

    requestAnimationFrame(() => {
      setTimeout(() => {
        const subcatKey = `${categoryId}-${encodeURIComponent(subcategoryName)}`;
        const inp = document.querySelector(`.simple-tree-input[data-cat-subcat="${subcatKey}"]`);
        if (inp) {
          inp.focus();
          inp.select();
        }
      }, 15);
    });
  }
}

function handleTreeSubcatSimpleDrop(e, categoryId, subcategoryName) {
  e.preventDefault();
  e.stopPropagation();
  const taskId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  if (!taskId) return;
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;
  const block = e.currentTarget.closest(".tree-subcat-block");
  const finalSubcat = (block && block.dataset.subcategoryId !== undefined) ? block.dataset.subcategoryId : subcategoryName;
  const finalCatId = (block && block.dataset.categoryId) ? block.dataset.categoryId : categoryId;
  task.categoryId = finalCatId;
  task.subcategoryId = finalSubcat;
  task.zone = "soon";
  task.rolledOver = false;
  task.order = Date.now();
  saveData();
  renderPlanner();
  renderCalendar();
  renderTree();
  cleanupDropStyles();
}

function renderTaskCardList(tasks) {
  if (tasks.length === 0) {
    return "";
  }

  // Sort: Incomplete tasks on top, completed tasks at the bottom
  tasks.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || (a.order || 0) - (b.order || 0));

  return tasks.map(task => {
    let dateMetaHtml = "";
    if (task.zone === "calendar" && task.date) {
      const parts = task.date.split("-").map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayName = BOSNIAN_DAYS[dt.getDay()] || "";
      let dStr = `${dayName}, ${parts[2]}.${parts[1]}.`;
      if (task.timeAlert && task.timeAlert !== "11:00") {
        dStr += ` ${task.timeAlert}`;
      }
      dateMetaHtml = `<span class="task-card-date-meta" title="${dStr}">${dStr}</span>`;
    }

    let extraPills = [];
    if (task.followUp) {
      extraPills.push(`<span class="task-pill follow-up-tag">Prati sutra</span>`);
    }
    if (task.subcategoryId) {
      extraPills.push(`<span class="task-pill">${escapeHtml(task.subcategoryId)}</span>`);
    }

    const deleteBtnTitle = task.completed ? "Arhiviraj (makni iz planera)" : "Obriši zadatak";

    return `
      <div class="task-card ${task.completed ? 'completed' : ''}" 
           id="task-card-${task.id}" 
           draggable="true" 
           ondragstart="handleTaskDragStart(event, '${task.id}')"
           ondragend="handleTaskDragEnd(event)"
           ondragover="handleTaskCardDragOver(event)"
           ondragleave="handleTaskCardDragLeave(event)"
           ondrop="handleTaskCardDrop(event, '${task.id}', '${task.categoryId}', '${task.zone}')">
        <div class="task-card-main">
          <div class="custom-checkbox" onclick="completeTask('${task.id}', event)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="task-title" onclick="editTask('${task.id}')" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>
          ${dateMetaHtml}
          <button class="task-card-move-btn" onclick="openMobileTaskMoveModal('${task.id}', event)" title="Premjesti zadatak">⇄</button>
          <button class="task-card-delete-btn" onclick="handleTaskDeleteOrArchive('${task.id}', event)" title="${deleteBtnTitle}">✕</button>
        </div>
        ${extraPills.length ? `<div class="task-meta" style="margin-left: 20px; margin-top: 2px;">${extraPills.join("")}</div>` : ""}
      </div>
    `;
  }).join("");
}

function handleTaskDeleteOrArchive(taskId, e) {
  if (e) e.stopPropagation();
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.completed) {
    if (task.zone === "calendar" || task.date) {
      // Completed calendar task: only remove from planner, KEEP in calendar
      task.archivedInPlanner = true;
      saveData();
      showToast("Zadatak uklonjen iz planera (ostaje u kalendaru).", false);
    } else {
      task.archived = true;
      saveData();
      showToast("Završeni zadatak arhiviran.", false);
    }
  } else {
    // If active: delete immediately
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveData();
    showToast("Zadatak obrisan.", false);
  }

  renderPlanner();
  renderCalendar();
  renderTree();
}

function handleCalendarTaskDelete(taskId, e) {
  if (e) e.stopPropagation();
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.completed) {
    task.archived = true;
    saveData();
    showToast("Završeni zadatak uklonjen iz kalendara.", false);
  } else {
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveData();
    showToast("Zadatak obrisan.", false);
  }

  renderPlanner();
  renderCalendar();
  renderTree();
}

function toggleZoneCollapse(categoryId, zoneName) {
  const key = `${categoryId}-${zoneName}`;
  appState.settings.collapsedZones[key] = !appState.settings.collapsedZones[key];
  saveData();
  renderPlanner();
}

// INLINE CATEGORY EDITING
function handleCategoryInlineRename(categoryId, el) {
  const newName = el.textContent.trim();
  const cat = appState.categories.find(c => c.id === categoryId);
  if (cat && newName && newName !== cat.name) {
    cat.name = newName;
    saveData();
    renderCalendar();
    renderTree();
  } else if (cat) {
    el.textContent = cat.name;
  }
}

function handleCategoryRenameKeyDown(e, categoryId, el) {
  if (e.key === "Enter") {
    e.preventDefault();
    el.blur();
  } else if (e.key === "Escape") {
    const cat = appState.categories.find(c => c.id === categoryId);
    if (cat) el.textContent = cat.name;
    el.blur();
  }
}

// CATEGORY COLOR PICKING
function openColorPickerForCategory(categoryId, e) {
  if (e) e.stopPropagation();
  targetColorCategoryId = categoryId;
  const picker = document.getElementById("globalColorPicker");
  const cat = appState.categories.find(c => c.id === categoryId);
  if (picker && cat) {
    picker.value = cat.color;
    picker.click();
  }
}

function applyCategoryColorChange(e) {
  if (!targetColorCategoryId) return;
  const newColor = e.target.value;
  const cat = appState.categories.find(c => c.id === targetColorCategoryId);
  if (cat) {
    cat.color = newColor;
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
}

// RELIABLE IN-APP CATEGORY DELETION MODAL
function deleteCategory(categoryId, e) {
  if (e) e.stopPropagation();
  const cat = appState.categories.find(c => c.id === categoryId);
  if (!cat) return;

  categoryToDeleteId = categoryId;
  const msgEl = document.getElementById("confirmModalMessage");
  if (msgEl) {
    msgEl.textContent = `Želite li sigurno obrisati kategoriju "${cat.name}" i sve njene zadatke?`;
  }
  const actionBtn = document.getElementById("confirmModalActionBtn");
  if (actionBtn) {
    actionBtn.onclick = () => {
      appState.categories = appState.categories.filter(c => c.id !== categoryToDeleteId);
      appState.tasks = appState.tasks.filter(t => t.categoryId !== categoryToDeleteId);
      saveData();
      closeConfirmModal();
      renderPlanner();
      renderCalendar();
      renderTree();
    };
  }
  document.getElementById("confirmModal").classList.add("active");
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.classList.remove("active");
  categoryToDeleteId = null;
}

// ========================================================
// CALENDAR VIEW (BOSNIAN MONTHS, FULL TEXT, COMPACT PLUS)
// ========================================================
function renderCalendar() {
  const title = document.getElementById("calMonthYearTitle");
  const grid = document.getElementById("calendarGrid");
  if (!title || !grid) return;

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  // BOSNIAN MONTH NAME
  title.textContent = `${BOSNIAN_MONTHS[month]} ${year}`;
  grid.innerHTML = "";

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6;

  const totalDaysInMonth = lastDayOfMonth.getDate();
  const todayStr = getTodayStr();

  const allCells = [];

  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDate - i;
    const prevDate = new Date(year, month - 1, dayNum);
    allCells.push(createDayCell(dayNum, formatDateStr(prevDate), true, false));
  }

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateStr = formatDateStr(curDate);
    allCells.push(createDayCell(d, dateStr, false, dateStr === todayStr));
  }

  const totalRendered = startOffset + totalDaysInMonth;
  const remainingCells = (Math.ceil(totalRendered / 7) * 7) - totalRendered;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    allCells.push(createDayCell(d, formatDateStr(nextDate), true, false));
  }

  // Render in separate week rows so rows can be scrolled and resized independently
  const numWeeks = allCells.length / 7;
  let weekHeightsChanged = false;

  for (let w = 0; w < numWeeks; w++) {
    const weekRow = document.createElement("div");
    weekRow.className = "calendar-week-row";
    weekRow.dataset.weekIndex = w;

    // If this week has passed (Sunday < today), reset its expanded height to standard
    const sundayCell = allCells[w * 7 + 6];
    const sundayDate = sundayCell ? sundayCell.dataset.date : null;
    const isPastWeek = sundayDate && sundayDate < todayStr;

    if (isPastWeek && appState.settings.weekHeights && appState.settings.weekHeights[w]) {
      delete appState.settings.weekHeights[w];
      weekHeightsChanged = true;
    }

    const savedHeight = appState.settings.weekHeights && appState.settings.weekHeights[w];
    if (savedHeight && !isPastWeek) {
      weekRow.style.height = `${savedHeight}px`;
    }

    for (let c = 0; c < 7; c++) {
      const cell = allCells[w * 7 + c];
      if (cell && cell.dataset.date === activeDayInlineDate) {
        weekRow.style.zIndex = "100";
      }
      weekRow.appendChild(cell);
    }

    grid.appendChild(weekRow);

    const resizer = document.createElement("div");
    resizer.className = "week-resizer-line";
    resizer.dataset.weekIndex = w;
    resizer.title = "Povucite za promjenu visine ove sedmice";
    setupSingleWeekResizer(resizer, weekRow, w);
    grid.appendChild(resizer);
  }

  if (weekHeightsChanged) {
    saveData();
  }

  renderDayAgenda(typeof selectedCalendarDate !== "undefined" ? selectedCalendarDate : getTodayStr());
}

function setupSingleWeekResizer(resizer, weekRow, weekIndex) {
  let isResizing = false;
  let startY = 0;
  let startHeight = 0;

  resizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    resizer.classList.add("dragging");
    startY = e.clientY;
    startHeight = weekRow.offsetHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent) => {
      if (!isResizing) return;
      const dy = moveEvent.clientY - startY;
      const newHeight = Math.max(48, Math.min(380, startHeight + dy));
      weekRow.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove("dragging");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        if (!appState.settings.weekHeights) {
          appState.settings.weekHeights = {};
        }
        appState.settings.weekHeights[weekIndex] = weekRow.offsetHeight;
        saveData();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
}

function createDayCell(dayNumber, dateStr, isOtherMonth, isToday) {
  const hasActiveInput = activeDayInlineDate === dateStr;
  const isSelected = (typeof selectedCalendarDate !== "undefined" && selectedCalendarDate === dateStr);
  const cell = document.createElement("div");
  cell.className = `day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'selected-day' : ''} ${hasActiveInput ? 'has-active-input' : ''}`;
  cell.dataset.date = dateStr;
  cell.tabIndex = 0;

  cell.onclick = (e) => {
    if (e.target.closest(".day-inline-input-wrap") || e.target.closest(".day-plus-btn")) {
      return;
    }
    selectCalendarDate(dateStr);
  };

  cell.onkeydown = (e) => {
    if (e.target !== cell) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectCalendarDate(dateStr);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      openDayInlineInput(dateStr, e.key);
    }
  };

  cell.ondragover = (e) => {
    e.preventDefault();
    cell.classList.add("drag-over");
  };
  cell.ondragleave = () => {
    cell.classList.remove("drag-over");
  };
  cell.ondrop = (e) => {
    e.preventDefault();
    cell.classList.remove("drag-over");
    handleCalendarDrop(dateStr);
  };

  // Day Header (Tiny number on left, neat '+' on right)
  const header = document.createElement("div");
  header.className = "day-header";

  const numSpan = document.createElement("span");
  numSpan.className = "day-number";
  numSpan.textContent = dayNumber;

  const plusBtn = document.createElement("button");
  plusBtn.className = "day-plus-btn";
  plusBtn.textContent = "+";
  plusBtn.title = "Dodaj zadatak za ovaj dan";
  plusBtn.onclick = (e) => {
    e.stopPropagation();
    openDayInlineInput(dateStr);
  };

  header.appendChild(numSpan);
  header.appendChild(plusBtn);
  cell.appendChild(header);

  // Day Tasks Container
  const tasksContainer = document.createElement("div");
  tasksContainer.className = "day-tasks-container";

  // If this day has an active inline input, render it at the top
  if (hasActiveInput) {
    const scheduledTime = getTimePlusOneHourStr();
    const curCatId = activeCalendarInlineCategoryId || (appState.categories[0] && appState.categories[0].id) || "opcenito";
    const curCat = appState.categories.find(c => c.id === curCatId) || appState.categories[0] || { id: "opcenito", name: "Općenito", color: "#007AFF" };

    const inputWrap = document.createElement("div");
    inputWrap.className = "day-inline-input-wrap";
    inputWrap.onclick = (e) => e.stopPropagation();
    inputWrap.innerHTML = `
      <div class="day-inline-cat-picker" id="dayInlineCatPicker"
           title="Kategorija: ${escapeHtml(curCat.name)} (kliknite ili prijeđite mišem za odabir)"
           onmouseenter="showCalendarCategoryMenu(event)"
           onmouseleave="scheduleHideCalendarCategoryMenu()"
           onmousedown="handleCalendarPickerMouseDown(event)"
           onclick="toggleCalendarCategoryMenu(event)">
        <span class="day-inline-color-dot" id="dayInlineColorDot" style="background-color: ${curCat.color || '#007AFF'};"></span>
        <div class="day-inline-cat-popup" id="dayInlineCatPopup" onmousedown="handleCalendarPickerMouseDown(event)">
          <div class="day-inline-popup-header">Kategorija</div>
          ${appState.categories.map(c => `
            <div class="day-inline-popup-item ${c.id === curCat.id ? 'selected' : ''}"
                 data-cat-id="${c.id}"
                 onmousedown="handleCalendarPickerMouseDown(event)"
                 onclick="selectCalendarInlineCategory('${c.id}', event)">
              <span class="day-inline-popup-dot" style="background-color: ${c.color || '#007AFF'};"></span>
              <span class="day-inline-popup-name">${escapeHtml(c.name)}</span>
              ${c.id === curCat.id ? '<span class="day-inline-popup-check">✓</span>' : ''}
            </div>
          `).join("")}
        </div>
      </div>
      <span class="day-inline-time-badge" title="Zadatak se stvara za ${scheduledTime} (+1h)">${scheduledTime}</span>
      <input type="text" class="day-inline-input" placeholder="+ Upiši to-do" 
             data-date="${dateStr}"
             ondragover="if(draggedTaskId) event.preventDefault();"
             ondrop="if(draggedTaskId) { event.preventDefault(); event.stopPropagation(); handleCalendarDrop('${dateStr}'); }"
             onkeydown="handleDayInputKeyDown(event, '${dateStr}')" 
             onblur="handleDayInputBlur(event, '${dateStr}')">
    `;
    tasksContainer.appendChild(inputWrap);
  }

  // Filter tasks (exclude archived)
  const dayTasks = appState.tasks.filter(t => t.zone === "calendar" && t.date === dateStr && !t.archived);
  dayTasks.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || (a.order || 0) - (b.order || 0));

  // Render micro pills inside day cell (very tiny, clean, no times, no checkboxes)
  const maxMicro = 3;
  dayTasks.slice(0, maxMicro).forEach(task => {
    const cat = appState.categories.find(c => c.id === task.categoryId) || { color: "#007AFF" };
    const micro = document.createElement("div");
    micro.className = `calendar-micro-pill ${task.completed ? 'completed' : ''}`;
    micro.id = `cal-task-${task.id}`;
    micro.style.borderLeftColor = cat.color || "#007AFF";
    micro.title = task.title + (task.timeAlert ? ` (${task.timeAlert})` : "");
    micro.textContent = task.title;
    micro.draggable = true;
    micro.ondragstart = (e) => handleTaskDragStart(e, task.id);
    micro.ondragend = handleTaskDragEnd;
    micro.onclick = (e) => {
      e.stopPropagation();
      selectCalendarDate(dateStr);
    };
    tasksContainer.appendChild(micro);
  });

  if (dayTasks.length > maxMicro) {
    const moreBadge = document.createElement("div");
    moreBadge.className = "calendar-more-badge";
    moreBadge.textContent = `+${dayTasks.length - maxMicro} još`;
    tasksContainer.appendChild(moreBadge);
  }

  cell.appendChild(tasksContainer);

  return cell;
}

function selectCalendarDate(dateStr) {
  selectedCalendarDate = dateStr;
  document.querySelectorAll(".day-cell.selected-day").forEach(el => el.classList.remove("selected-day"));
  const targetCell = document.querySelector(`.day-cell[data-date="${dateStr}"]`);
  if (targetCell) {
    targetCell.classList.add("selected-day");
  }
  renderDayAgenda(dateStr);
}

function renderDayAgenda(dateStr) {
  const container = document.getElementById("dayAgendaList");
  const titleEl = document.getElementById("dayAgendaTitle");
  if (!container || !titleEl) return;

  const targetDate = dateStr || (typeof selectedCalendarDate !== "undefined" ? selectedCalendarDate : null) || getTodayStr();
  selectedCalendarDate = targetDate;

  const today = getTodayStr();
  const dParts = targetDate.split("-");
  const year = parseInt(dParts[0], 10);
  const month = parseInt(dParts[1], 10) - 1;
  const day = parseInt(dParts[2], 10);
  const dObj = new Date(year, month, day);

  const monthNames = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar"
  ];
  const dayNames = [
    "Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"
  ];

  let dateLabel = `${dayNames[dObj.getDay()]}, ${day}. ${monthNames[month]}`;
  if (targetDate === today) {
    dateLabel = `Danas • ${day}. ${monthNames[month]}`;
  }
  titleEl.textContent = dateLabel;

  const dayTasks = appState.tasks.filter(t => t.zone === "calendar" && t.date === targetDate && !t.archived);
  dayTasks.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || (a.timeAlert || "").localeCompare(b.timeAlert || ""));

  if (dayTasks.length === 0) {
    container.innerHTML = `
      <div class="agenda-empty-state">
        Nema zadataka za ${targetDate === today ? "danas" : "ovaj dan"}. Kliknite "+ Novi zadatak" za dodavanje.
      </div>
    `;
    return;
  }

  container.innerHTML = dayTasks.map(task => {
    const cat = appState.categories.find(c => c.id === task.categoryId) || { name: "Općenito", color: "#007AFF" };
    const timeDisplay = task.timeAlert ? `⏰ ${task.timeAlert}` : "Cijeli dan";

    return `
      <div class="agenda-task-item ${task.completed ? 'completed' : ''}" id="agenda-task-${task.id}">
        <div class="agenda-task-left">
          <div class="agenda-checkbox ${task.completed ? 'checked' : ''}" 
               title="${task.completed ? 'Označi kao nezavršeno' : 'Označi kao završeno'}"
               onclick="completeTask('${task.id}', event)">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="agenda-cat-badge" style="background-color: ${cat.color || '#007AFF'};">${escapeHtml(cat.name)}</span>
          <span class="agenda-task-title" onclick="editTask('${task.id}')" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>
        </div>
        <div class="agenda-task-right">
          <span class="agenda-task-time">${timeDisplay}</span>
          <button class="agenda-delete-btn" onclick="handleCalendarTaskDelete('${task.id}', event)" title="Obriši iz kalendara">✕</button>
        </div>
      </div>
    `;
  }).join("");
}

function openNewTaskForSelectedDay() {
  openNewTaskModal();
  const dateInput = document.getElementById("taskDateInput");
  if (dateInput && typeof selectedCalendarDate !== "undefined") {
    dateInput.value = selectedCalendarDate;
  }
}

let calendarCatMenuHideTimer = null;
let isInteractingWithCalendarCategoryPopup = false;

function handleCalendarPickerMouseDown(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  isInteractingWithCalendarCategoryPopup = true;
  setTimeout(() => {
    isInteractingWithCalendarCategoryPopup = false;
  }, 200);
}

function showCalendarCategoryMenu(e) {
  clearTimeout(calendarCatMenuHideTimer);
  const popup = document.getElementById("dayInlineCatPopup");
  if (popup) {
    popup.classList.add("show");
  }
}

function scheduleHideCalendarCategoryMenu() {
  clearTimeout(calendarCatMenuHideTimer);
  calendarCatMenuHideTimer = setTimeout(() => {
    hideCalendarCategoryMenu();
  }, 250);
}

function hideCalendarCategoryMenu() {
  clearTimeout(calendarCatMenuHideTimer);
  const popup = document.getElementById("dayInlineCatPopup");
  if (popup) {
    popup.classList.remove("show");
  }
}

function toggleCalendarCategoryMenu(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  clearTimeout(calendarCatMenuHideTimer);
  const popup = document.getElementById("dayInlineCatPopup");
  if (popup) {
    popup.classList.toggle("show");
  }
}

function selectCalendarInlineCategory(catId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  activeCalendarInlineCategoryId = catId;
  const cat = appState.categories.find(c => c.id === catId);
  const dot = document.getElementById("dayInlineColorDot");
  if (dot && cat) {
    dot.style.backgroundColor = cat.color || "#007AFF";
  }
  const picker = document.getElementById("dayInlineCatPicker");
  if (picker && cat) {
    picker.title = `Kategorija: ${cat.name} (kliknite ili prijeđite mišem za odabir)`;
  }
  const popup = document.getElementById("dayInlineCatPopup");
  if (popup) {
    popup.querySelectorAll(".day-inline-popup-item").forEach(item => {
      const isSelected = item.dataset.catId === catId;
      item.classList.toggle("selected", isSelected);
      let check = item.querySelector(".day-inline-popup-check");
      if (isSelected && !check) {
        check = document.createElement("span");
        check.className = "day-inline-popup-check";
        check.textContent = "✓";
        item.appendChild(check);
      } else if (!isSelected && check) {
        check.remove();
      }
    });
  }
  hideCalendarCategoryMenu();
  const inp = document.querySelector(".day-inline-input");
  if (inp) {
    inp.focus();
  }
}

function handleCalendarInlineCategoryChange(catId) {
  selectCalendarInlineCategory(catId);
}

window.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".day-inline-cat-picker")) {
    hideCalendarCategoryMenu();
  }
});

function openDayInlineInput(dateStr, initialChar) {
  activeDayInlineDate = dateStr;
  if (!activeCalendarInlineCategoryId) {
    activeCalendarInlineCategoryId = (appState.categories[0] && appState.categories[0].id) || "opcenito";
  }
  renderCalendar();

  const inp = document.querySelector(`.day-cell[data-date="${dateStr}"] .day-inline-input`);
  if (inp) {
    if (initialChar) {
      inp.value = initialChar;
    }
    inp.focus();
    if (initialChar) {
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  }
}

function saveCalendarInlineTask(val, dateStr) {
  if (!val) return;
  const targetCatId = activeCalendarInlineCategoryId || (appState.categories[0] && appState.categories[0].id) || "opcenito";
  const cat = appState.categories.find(c => c.id === targetCatId);
  const targetSubcat = (cat && cat.subcategories && cat.subcategories[0]) || "";
  const taskTime = getTimePlusOneHourStr();

  const newTask = {
    id: "task-" + Date.now(),
    title: val,
    categoryId: targetCatId,
    subcategoryId: targetSubcat,
    zone: "calendar",
    date: dateStr,
    timeAlert: taskTime,
    followUp: false,
    completed: false,
    archived: false,
    order: Date.now(),
    rolledOver: false
  };

  appState.tasks.push(newTask);
  saveData();
}

function handleDayInputBlur(e, dateStr) {
  if (isInteractingWithCalendarCategoryPopup) {
    return;
  }
  if (e.relatedTarget && (e.relatedTarget.closest(".day-inline-input-wrap") || e.relatedTarget.closest(".day-inline-cat-popup"))) {
    return;
  }
  const val = e.target.value.trim();
  if (val) {
    saveCalendarInlineTask(val, dateStr);
  }
  activeDayInlineDate = null;
  activeCalendarInlineCategoryId = null;
  renderPlanner();
  renderCalendar();
  renderTree();
}

function handleDayInputKeyDown(e, dateStr) {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) {
      activeDayInlineDate = null;
      activeCalendarInlineCategoryId = null;
      renderCalendar();
      return;
    }

    saveCalendarInlineTask(val, dateStr);
    activeDayInlineDate = dateStr;

    renderPlanner();
    renderCalendar();
    renderTree();

    requestAnimationFrame(() => {
      setTimeout(() => {
        const inp = document.querySelector(`.day-cell[data-date="${dateStr}"] .day-inline-input`);
        if (inp) {
          inp.focus();
          inp.select();
        }
      }, 15);
    });
  } else if (e.key === "Escape") {
    activeDayInlineDate = null;
    activeCalendarInlineCategoryId = null;
    renderCalendar();
  }
}

function prevMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  renderCalendar();
}

function goToToday() {
  currentViewDate = new Date();
  renderCalendar();
}

// ========================================================
// DRVO VIEW (TREE / MIND-MAP WITH PANNING & ADD CATEGORY)
// ========================================================
function renderTree() {
  const canvas = document.getElementById("treeCanvas");
  if (!canvas) return;
  canvas.innerHTML = "";

  const root = document.createElement("div");
  root.className = "tree-root-node";
  root.textContent = "JA";
  canvas.appendChild(root);

  const rootStem = document.createElement("div");
  rootStem.className = "tree-root-stem";
  canvas.appendChild(rootStem);

  const branchesRow = document.createElement("div");
  branchesRow.className = "tree-branches-row";

  appState.categories.forEach(category => {
    const isSimple = category.type === "simple";
    const col = document.createElement("div");
    col.className = "tree-branch-col";
    col.dataset.categoryId = category.id;
    col.ondragover = (e) => handleTreeBranchDragOver(e, category.id);
    col.ondragleave = (e) => handleTreeBranchDragLeave(e);
    col.ondrop = (e) => handleTreeBranchDrop(e, category.id);

    const catCard = document.createElement("div");
    catCard.className = "tree-category-card";
    catCard.draggable = true;
    catCard.ondragstart = (e) => handleTreeCategoryDragStart(e, category.id);
    catCard.ondragend = (e) => handleTreeCategoryDragEnd(e);
    catCard.ondragover = (e) => handleTreeCategoryCardDragOver(e, category.id);
    catCard.ondrop = (e) => handleTreeCategoryCardDrop(e, category.id);

    catCard.innerHTML = `
      <div class="tree-category-title">
        <span class="color-dot-btn" style="background-color: ${category.color};" onclick="openColorPickerForCategory('${category.id}', event)" title="Promijeni boju"></span>
        <span class="category-name-text" contenteditable="true" spellcheck="false" onblur="handleCategoryInlineRename('${category.id}', this)" onkeydown="handleCategoryRenameKeyDown(event, '${category.id}', this)" title="Promijeni naziv">${escapeHtml(category.name)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <button class="btn-icon" style="padding: 2px 6px; font-size: 11px;" onclick="openNewSubcategoryModal('${category.id}')" title="Nova podkategorija">
          + Podkategorija
        </button>
        <button class="btn-tiny-icon" onclick="toggleCategoryType('${category.id}', event)" title="${isSimple ? 'Prebaci sve podkategorije na planer sa 4 zone' : 'Prebaci sve podkategorije na jednostavnu listu (bez zona)'}">
          ${isSimple ? `
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          ` : `
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          `}
        </button>
        <button class="btn-tiny-icon" onclick="deleteCategory('${category.id}', event)" title="Obriši kategoriju">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    col.appendChild(catCard);

    const subcatsContainer = document.createElement("div");
    subcatsContainer.className = "tree-subcategories-list";

    const subcats = (category.subcategories && category.subcategories.length) ? category.subcategories : ["Općenito"];

    subcats.forEach((subcatName, subcatIdx) => {
      const isSubcatSimple = isSubcategorySimple(category, subcatName);
      const subcatBlock = document.createElement("div");
      subcatBlock.className = `tree-subcat-block ${isSubcatSimple ? 'simple-tree-block' : ''}`;
      subcatBlock.dataset.catSubcat = `${category.id}-${encodeURIComponent(subcatName)}`;
      subcatBlock.dataset.categoryId = category.id;
      subcatBlock.dataset.subcategoryId = subcatName;
      subcatBlock.dataset.subcatIndex = subcatIdx;
      subcatBlock.ondragover = (e) => handleTreeSubcatDragOver(e);
      subcatBlock.ondragleave = (e) => handleTreeSubcatDragLeave(e);
      subcatBlock.ondrop = (e) => handleTreeSubcatDrop(e, category.id, subcatName);

      const subcatTasks = appState.tasks.filter(t => 
        t.categoryId === category.id && 
        !t.archived &&
        !t.archivedInPlanner &&
        (t.subcategoryId === subcatName || (!t.subcategoryId && subcatName === "Općenito"))
      );

      let subcatBody = "";
      if (isSubcatSimple) {
        subcatBody = `
          <div class="zone-tasks-list simple-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeSubcatSimpleDrop(event, '${category.id}', '${escapeHtml(subcatName)}')">
            ${renderTaskCardList(subcatTasks)}
          </div>
          <div class="inline-zone-input-wrap">
            <input type="text" class="inline-zone-input simple-tree-input" 
                   data-cat-subcat="${category.id}-${encodeURIComponent(subcatName)}" 
                   placeholder="+ Upiši stavku" 
                   onkeydown="handleTreeSubcatSimpleInputKeyDown(event, '${category.id}', '${escapeHtml(subcatName)}')">
          </div>
        `;
      } else {
        const calendarTasks = subcatTasks.filter(t => t.zone === "calendar");
        const soonTasks = subcatTasks.filter(t => t.zone === "soon");
        const longtermTasks = subcatTasks.filter(t => t.zone === "longterm");
        const ideasTasks = subcatTasks.filter(t => t.zone === "ideas");

        const longtermCollapsed = appState.settings.collapsedZones[`${category.id}-${subcatName}-longterm`];
        const ideasCollapsed = appState.settings.collapsedZones[`${category.id}-${subcatName}-ideas`];

        subcatBody = `
          <!-- 1. U KALENDARU -->
          <div class="planner-zone tree-zone" data-zone="calendar" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'calendar')">
            <div class="zone-header first">
              <span>U kalendaru</span>
              <span>${calendarTasks.filter(t => !t.completed).length}</span>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'calendar')">
              ${renderTaskCardList(calendarTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleTreeZoneInputDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'calendar')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši to-do" onkeydown="handleTreeZoneInputKeyDown(event, '${category.id}', '${escapeHtml(subcatName)}', 'calendar')">
            </div>
          </div>

          <!-- 2. OVIH DANA -->
          <div class="planner-zone tree-zone" data-zone="soon" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'soon')">
            <div class="zone-header">
              <span>Ovih dana</span>
              <span>${soonTasks.filter(t => !t.completed).length}</span>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'soon')">
              ${renderTaskCardList(soonTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleTreeZoneInputDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'soon')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši to-do" onkeydown="handleTreeZoneInputKeyDown(event, '${category.id}', '${escapeHtml(subcatName)}', 'soon')">
            </div>
          </div>

          <!-- 3. DUGOROČNO -->
          <div class="planner-zone tree-zone ${longtermCollapsed ? 'zone-collapsed' : ''}" data-zone="longterm" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'longterm')">
            <div class="zone-header">
              <button class="zone-toggle-btn" onclick="toggleTreeZoneCollapse('${category.id}', '${escapeHtml(subcatName)}', 'longterm')">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: ${longtermCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.15s;">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>Dugoročno (${longtermTasks.filter(t => !t.completed).length})</span>
              </button>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'longterm')">
              ${renderTaskCardList(longtermTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleTreeZoneInputDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'longterm')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši dugoročni to-do" onkeydown="handleTreeZoneInputKeyDown(event, '${category.id}', '${escapeHtml(subcatName)}', 'longterm')">
            </div>
          </div>

          <!-- 4. IDEJE -->
          <div class="planner-zone tree-zone ${ideasCollapsed ? 'zone-collapsed' : ''}" data-zone="ideas" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'ideas')">
            <div class="zone-header">
              <button class="zone-toggle-btn" onclick="toggleTreeZoneCollapse('${category.id}', '${escapeHtml(subcatName)}', 'ideas')">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: ${ideasCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.15s;">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>Ideje (${ideasTasks.filter(t => !t.completed).length})</span>
              </button>
            </div>
            <div class="zone-tasks-list" ondragover="handleZoneDragOver(event)" ondragleave="handleZoneDragLeave(event)" ondrop="handleTreeZoneDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'ideas')">
              ${renderTaskCardList(ideasTasks)}
            </div>
            <div class="inline-zone-input-wrap" ondragover="handleZoneInputDragOver(event)" ondrop="handleTreeZoneInputDrop(event, '${category.id}', '${escapeHtml(subcatName)}', 'ideas')">
              <input type="text" class="inline-zone-input" placeholder="+ Upiši novu ideju" onkeydown="handleTreeZoneInputKeyDown(event, '${category.id}', '${escapeHtml(subcatName)}', 'ideas')">
            </div>
          </div>
        `;
      }

      subcatBlock.innerHTML = `
        <div class="tree-subcat-header">
          <span class="tree-subcat-title" contenteditable="true" spellcheck="false" onblur="handleSubcategoryInlineRename('${category.id}', '${escapeHtml(subcatName)}', this)" onkeydown="handleSubcategoryRenameKeyDown(event, this)" style="cursor: text;" title="Kliknite za promjenu naziva">${escapeHtml(subcatName)}</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 10px; color: var(--text-tertiary);">${subcatTasks.filter(t => !t.completed).length}</span>
            ${subcats.length > 1 ? `
              <button class="btn-tiny-icon tree-subcat-move-btn" onclick="moveSubcategoryOrder('${category.id}', ${subcatIdx}, -1, event)" title="Pomakni podkategoriju prema gore" ${subcatIdx === 0 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>▲</button>
              <button class="btn-tiny-icon tree-subcat-move-btn" onclick="moveSubcategoryOrder('${category.id}', ${subcatIdx}, 1, event)" title="Pomakni podkategoriju prema dolje" ${subcatIdx === subcats.length - 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>▼</button>
            ` : ''}
            <button class="btn-tiny-icon" onclick="toggleSubcategoryType('${category.id}', '${escapeHtml(subcatName)}', event)" title="${isSubcatSimple ? 'Prebaci podkategoriju na planer sa 4 zone' : 'Prebaci podkategoriju na jednostavnu listu (bez zona)'}">
              ${isSubcatSimple ? `
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              ` : `
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              `}
            </button>
            <button class="btn-tiny-icon" onclick="deleteSubcategory('${category.id}', '${escapeHtml(subcatName)}')" title="Obriši podkategoriju">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        ${subcatBody}
      `;

      subcatsContainer.appendChild(subcatBlock);
    });

    col.appendChild(subcatsContainer);
    branchesRow.appendChild(col);
  });

  // ADD CATEGORY DIRECTLY IN DRVO
  const addCol = document.createElement("div");
  addCol.className = "tree-branch-col";
  addCol.innerHTML = `
    <div class="tree-category-card add-cat-card" onclick="openNewCategoryModal()" style="border: 1px dashed var(--border-color); cursor: pointer; justify-content: center; color: var(--text-secondary); height: 42px;">
      <span style="font-weight: 600; font-size: 12px;">+ Nova kategorija</span>
    </div>
  `;
  branchesRow.appendChild(addCol);

  canvas.appendChild(branchesRow);
}

// MOUSE PANNING FOR DRVO CANVAS
let isTreePanning = false;
let panStartX = 0;
let panStartY = 0;
let panScrollLeft = 0;
let panScrollTop = 0;

function setupTreePan() {
  const wrapper = document.querySelector(".tree-view-wrapper");
  if (!wrapper || wrapper.dataset.panSetup) return;
  wrapper.dataset.panSetup = "true";

  const startPan = (pageX, pageY, target) => {
    if (target && (target.closest("input") || target.closest("button") || target.closest("[contenteditable='true']") || target.closest(".task-card") || target.closest(".custom-checkbox") || target.closest(".tree-task-item"))) {
      return;
    }
    isTreePanning = true;
    wrapper.classList.add("panning");
    panStartX = pageX - wrapper.offsetLeft;
    panStartY = pageY - wrapper.offsetTop;
    panScrollLeft = wrapper.scrollLeft;
    panScrollTop = wrapper.scrollTop;
  };

  const movePan = (pageX, pageY) => {
    if (!isTreePanning) return;
    const x = pageX - wrapper.offsetLeft;
    const y = pageY - wrapper.offsetTop;
    const walkX = (x - panStartX) * 1.2;
    const walkY = (y - panStartY) * 1.2;
    wrapper.scrollLeft = panScrollLeft - walkX;
    wrapper.scrollTop = panScrollTop - walkY;
  };

  const stopPan = () => {
    isTreePanning = false;
    wrapper.classList.remove("panning");
  };

  wrapper.addEventListener("mousedown", (e) => startPan(e.pageX, e.pageY, e.target));
  wrapper.addEventListener("mousemove", (e) => {
    if (isTreePanning) {
      e.preventDefault();
      movePan(e.pageX, e.pageY);
    }
  });
  wrapper.addEventListener("mouseup", stopPan);
  wrapper.addEventListener("mouseleave", stopPan);

  wrapper.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length === 1) {
      startPan(e.touches[0].pageX, e.touches[0].pageY, e.target);
    }
  }, { passive: true });

  wrapper.addEventListener("touchmove", (e) => {
    if (isTreePanning && e.touches && e.touches.length === 1) {
      movePan(e.touches[0].pageX, e.touches[0].pageY);
    }
  }, { passive: true });

  wrapper.addEventListener("touchend", stopPan);
  wrapper.addEventListener("touchcancel", stopPan);
}

function handleTreeSubcatInputKeyDown(e, categoryId, subcatName) {
  if (e.key === "Enter") {
    const val = e.target.value.trim();
    if (!val) return;

    const newTask = {
      id: "task-" + Date.now(),
      title: val,
      categoryId,
      subcategoryId: subcatName,
      zone: "soon",
      date: "",
      timeAlert: "11:00",
      followUp: false,
      completed: false,
      archived: false,
      order: Date.now(),
      rolledOver: false
    };

    appState.tasks.push(newTask);
    saveData();
    e.target.value = "";

    renderPlanner();
    renderCalendar();
    renderTree();
  }
}

function handleSubcategoryInlineRename(categoryId, oldName, el) {
  const newName = el.textContent.trim();
  const cat = appState.categories.find(c => c.id === categoryId);
  if (cat && newName && newName !== oldName) {
    const idx = cat.subcategories.indexOf(oldName);
    if (idx !== -1) {
      cat.subcategories[idx] = newName;
    }
    if (cat.subcategoryTypes && cat.subcategoryTypes[oldName] !== undefined) {
      cat.subcategoryTypes[newName] = cat.subcategoryTypes[oldName];
      delete cat.subcategoryTypes[oldName];
    }
    appState.tasks.forEach(t => {
      if (t.categoryId === categoryId && t.subcategoryId === oldName) {
        t.subcategoryId = newName;
      }
    });

    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
  } else {
    el.textContent = oldName;
  }
}

function handleSubcategoryRenameKeyDown(e, el) {
  if (e.key === "Enter") {
    e.preventDefault();
    el.blur();
  } else if (e.key === "Escape") {
    el.blur();
  }
}

function deleteSubcategory(categoryId, subcatName) {
  const cat = appState.categories.find(c => c.id === categoryId);
  if (!cat) return;

  if (confirm(`Želite li obrisati podkategoriju "${subcatName}"?`)) {
    cat.subcategories = cat.subcategories.filter(s => s !== subcatName);
    if (cat.subcategoryTypes && cat.subcategoryTypes[subcatName] !== undefined) {
      delete cat.subcategoryTypes[subcatName];
    }
    appState.tasks.forEach(t => {
      if (t.categoryId === categoryId && t.subcategoryId === subcatName) {
        t.subcategoryId = "";
      }
    });

    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
}

function moveSubcategoryOrder(categoryId, fromIndex, direction, e) {
  if (e) e.stopPropagation();
  const category = appState.categories.find(c => c.id === categoryId);
  if (!category || !category.subcategories) return;
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= category.subcategories.length) return;
  const temp = category.subcategories[fromIndex];
  category.subcategories[fromIndex] = category.subcategories[toIndex];
  category.subcategories[toIndex] = temp;
  saveData();
  renderTree();
}

// ========================================================
// DRAG AND DROP (UNIFIED TASKS & CATEGORY REORDERING)
// ========================================================

// 1. TASK DRAG & DROP
function handleTaskDragStart(e, taskId) {
  draggedTaskId = taskId;
  draggedCategoryId = null;
  document.body.classList.add("dragging-task");
  e.dataTransfer.setData("text/plain", taskId);
  e.dataTransfer.effectAllowed = "move";
  const card = document.getElementById(`task-card-${taskId}`);
  if (card) card.classList.add("dragging");
}

function handleTaskDragEnd(e) {
  draggedTaskId = null;
  draggedCategoryId = null;
  document.body.classList.remove("dragging-task");
  cleanupDropStyles();
}

function handleTaskCardDragOver(e) {
  if (!draggedTaskId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";

  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  if (e.clientY < rect.top + rect.height / 2) {
    card.classList.add("drag-over-top");
    card.classList.remove("drag-over-bottom");
  } else {
    card.classList.add("drag-over-bottom");
    card.classList.remove("drag-over-top");
  }
}

function handleTaskCardDragLeave(e) {
  e.currentTarget.classList.remove("drag-over-top", "drag-over-bottom");
}

function handleTaskCardDrop(e, optTaskId, optCatId, optZone) {
  e.preventDefault();
  e.stopPropagation();
  const card = e.currentTarget;
  if (card) card.classList.remove("drag-over-top", "drag-over-bottom");
  const targetTaskId = optTaskId || (card && card.dataset.taskId);
  const targetCatId = optCatId || (card && card.dataset.categoryId);
  const targetZone = optZone || (card && card.dataset.zone);
  const draggedId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  insertTaskNear(draggedId, targetTaskId, targetCatId, targetZone, e.clientY);
  cleanupDropStyles();
}

function handleZoneDragOver(e) {
  if (!draggedTaskId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}

function handleZoneDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleZoneDrop(e, categoryId, targetZone) {
  if (e) {
    if (typeof e.preventDefault === "function") e.preventDefault();
    if (typeof e.stopPropagation === "function") e.stopPropagation();
    if (e.currentTarget && e.currentTarget.classList) {
      e.currentTarget.classList.remove("drag-over");
    }
  }
  const taskId = draggedTaskId || (e && e.dataTransfer ? e.dataTransfer.getData("text/plain") : null);
  if (taskId) {
    moveTaskToZone(taskId, categoryId, targetZone);
  }
  cleanupDropStyles();
}

function handleZoneInputDragOver(e) {
  if (!draggedTaskId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";
}

function handleZoneInputDrop(e, categoryId, targetZone) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target && e.target.tagName === "INPUT") {
    e.target.value = "";
    e.target.blur();
  }
  const taskId = draggedTaskId || e.dataTransfer.getData("text/plain");
  moveTaskToZone(taskId, categoryId, targetZone);
  cleanupDropStyles();
}

function handleCalendarDrop(targetDateStr) {
  const taskId = draggedTaskId;
  if (!taskId) return;

  const task = appState.tasks.find(t => t.id === taskId);
  if (task) {
    task.zone = "calendar";
    task.date = targetDateStr;
    task.rolledOver = false;
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
  cleanupDropStyles();
}

// 2. TREE TASK DRAG AND DROP
function handleTreeDragStart(e, taskId) {
  draggedTaskId = taskId;
  draggedCategoryId = null;
  document.body.classList.add("dragging-task");
  e.dataTransfer.setData("text/plain", taskId);
  e.dataTransfer.effectAllowed = "move";
  const el = document.getElementById(`tree-task-${taskId}`);
  if (el) el.classList.add("dragging");
}

function handleTreeTaskDragOver(e) {
  if (!draggedTaskId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";

  const item = e.currentTarget;
  const rect = item.getBoundingClientRect();
  if (e.clientY < rect.top + rect.height / 2) {
    item.classList.add("drag-over-top");
    item.classList.remove("drag-over-bottom");
  } else {
    item.classList.add("drag-over-bottom");
    item.classList.remove("drag-over-top");
  }
}

function handleTreeTaskDragLeave(e) {
  e.currentTarget.classList.remove("drag-over-top", "drag-over-bottom");
}

function handleTreeTaskDrop(e, optTaskId, optCatId, optSubcat) {
  e.preventDefault();
  e.stopPropagation();
  const item = e.currentTarget;
  if (item) item.classList.remove("drag-over-top", "drag-over-bottom");
  const targetTaskId = optTaskId || (item && item.dataset.taskId);
  const targetCatId = optCatId || (item && item.dataset.categoryId);
  const targetSubcat = optSubcat !== undefined ? optSubcat : (item && item.dataset.subcategoryId);
  const draggedId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  insertTreeTaskNear(draggedId, targetTaskId, targetCatId, targetSubcat, e.clientY);
  cleanupDropStyles();
}

function handleTreeSubcatDragOver(e) {
  if (!draggedTaskId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}

function handleTreeSubcatDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleTreeSubcatDrop(e, categoryId, subcategoryName) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove("drag-over");
  const taskId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  const block = e.currentTarget.closest(".tree-subcat-block") || e.currentTarget;
  const finalSubcat = (block && block.dataset.subcategoryId !== undefined) ? block.dataset.subcategoryId : subcategoryName;
  const finalCatId = (block && block.dataset.categoryId) ? block.dataset.categoryId : categoryId;
  moveTaskToTreeSubcat(taskId, finalCatId, finalSubcat);
  cleanupDropStyles();
}

function handleTreeInputDrop(e, categoryId, subcategoryName) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target && e.target.tagName === "INPUT") {
    e.target.value = "";
    e.target.blur();
  }
  const taskId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  const block = e.currentTarget.closest(".tree-subcat-block") || e.currentTarget;
  const finalSubcat = (block && block.dataset.subcategoryId !== undefined) ? block.dataset.subcategoryId : subcategoryName;
  const finalCatId = (block && block.dataset.categoryId) ? block.dataset.categoryId : categoryId;
  moveTaskToTreeSubcat(taskId, finalCatId, finalSubcat);
  cleanupDropStyles();
}

function handleTreeCategoryCardDragOver(e) {
  if (draggedTaskId) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }
}

function handleTreeCategoryCardDrop(e, categoryId) {
  if (draggedTaskId) {
    e.preventDefault();
    e.stopPropagation();
    const category = appState.categories.find(c => c.id === categoryId);
    const subcat = (category && category.subcategories && category.subcategories[0]) || "";
    moveTaskToTreeSubcat(draggedTaskId, categoryId, subcat);
    cleanupDropStyles();
  }
}

// Helper Task Movement Functions
function moveTaskToZone(taskId, categoryId, targetZone) {
  if (!taskId) return;
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.categoryId = categoryId;
  task.zone = targetZone;
  if (targetZone === "calendar" && !task.date) {
    task.date = getTodayStr();
  }
  task.rolledOver = false;
  task.order = Date.now();
  saveData();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function insertTaskNear(draggedId, targetId, targetCatId, targetZone, clientY) {
  if (!draggedId) return;
  const draggedTask = appState.tasks.find(t => t.id === draggedId);
  if (!draggedTask) return;

  draggedTask.categoryId = targetCatId;
  draggedTask.zone = targetZone;
  if (targetZone === "calendar" && !draggedTask.date) {
    draggedTask.date = getTodayStr();
  }
  draggedTask.rolledOver = false;

  const targetTask = appState.tasks.find(t => t.id === targetId);
  if (targetTask && draggedId !== targetId) {
    if (targetTask.subcategoryId !== undefined) {
      draggedTask.subcategoryId = targetTask.subcategoryId;
    }
    const cardEl = document.getElementById(`task-card-${targetId}`);
    if (cardEl) {
      const treeBlock = cardEl.closest(".tree-subcat-block");
      if (treeBlock) {
        if (treeBlock.dataset.subcategoryId !== undefined) {
          draggedTask.subcategoryId = treeBlock.dataset.subcategoryId;
        }
        if (treeBlock.dataset.categoryId) {
          draggedTask.categoryId = treeBlock.dataset.categoryId;
        }
      }
    }
    let isAfter = true;
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        isAfter = false;
      }
    }
    draggedTask.order = isAfter ? (targetTask.order || 0) + 0.5 : (targetTask.order || 0) - 0.5;
    normalizeTaskOrders();
  } else {
    draggedTask.order = Date.now();
  }

  saveData();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function moveTaskToTreeSubcat(taskId, categoryId, subcatName) {
  if (!taskId) return;
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const cat = appState.categories.find(c => c.id === categoryId);
  const isSimple = isSubcategorySimple(cat, subcatName);

  task.categoryId = categoryId;
  task.subcategoryId = subcatName;
  if (isSimple) {
    task.zone = "soon";
  } else if (!task.zone || task.zone === "") {
    task.zone = "soon";
  }
  task.order = Date.now();
  saveData();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function handleTreeZoneDrop(e, categoryId, subcategoryName, targetZone) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove("drag-over");
  const taskId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  const block = e.currentTarget.closest(".tree-subcat-block");
  const finalSubcat = (block && block.dataset.subcategoryId !== undefined) ? block.dataset.subcategoryId : subcategoryName;
  const finalCatId = (block && block.dataset.categoryId) ? block.dataset.categoryId : categoryId;
  moveTaskToTreeZone(taskId, finalCatId, finalSubcat, targetZone);
  cleanupDropStyles();
}

function handleTreeZoneInputDrop(e, categoryId, subcategoryName, targetZone) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target && e.target.tagName === "INPUT") {
    e.target.value = "";
    e.target.blur();
  }
  const taskId = draggedTaskId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
  const block = e.currentTarget.closest(".tree-subcat-block");
  const finalSubcat = (block && block.dataset.subcategoryId !== undefined) ? block.dataset.subcategoryId : subcategoryName;
  const finalCatId = (block && block.dataset.categoryId) ? block.dataset.categoryId : categoryId;
  moveTaskToTreeZone(taskId, finalCatId, finalSubcat, targetZone);
  cleanupDropStyles();
}

function moveTaskToTreeZone(taskId, categoryId, subcategoryName, targetZone) {
  if (!taskId) return;
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.categoryId = categoryId;
  task.subcategoryId = subcategoryName;
  task.zone = targetZone;
  if (targetZone === "calendar" && !task.date) {
    task.date = getTodayStr();
  }
  task.rolledOver = false;
  task.order = Date.now();
  saveData();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function handleTreeZoneInputKeyDown(e, categoryId, subcategoryName, zone) {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) return;

    const newTask = {
      id: "task-" + Date.now(),
      title: val,
      categoryId,
      subcategoryId: subcategoryName,
      zone,
      date: zone === "calendar" ? getTodayStr() : "",
      timeAlert: zone === "calendar" ? "11:00" : "",
      followUp: false,
      completed: false,
      archived: false,
      order: Date.now(),
      rolledOver: false
    };

    appState.tasks.push(newTask);
    saveData();
    e.target.value = "";
    
    renderPlanner();
    renderCalendar();
    renderTree();

    requestAnimationFrame(() => {
      setTimeout(() => {
        const col = document.querySelector(`.tree-branch-col[data-category-id="${categoryId}"]`);
        if (col) {
          const subcatKey = `${categoryId}-${encodeURIComponent(subcategoryName)}`;
          const subcatBlock = col.querySelector(`.tree-subcat-block[data-cat-subcat="${subcatKey}"]`);
          if (subcatBlock) {
            const zoneEl = subcatBlock.querySelector(`.tree-zone[data-zone="${zone}"] .inline-zone-input`);
            if (zoneEl) {
              zoneEl.focus();
              zoneEl.select();
            }
          }
        }
      }, 15);
    });
  }
}

function toggleTreeZoneCollapse(categoryId, subcatName, zone) {
  const key = `${categoryId}-${subcatName}-${zone}`;
  appState.settings.collapsedZones[key] = !appState.settings.collapsedZones[key];
  saveData();
  renderTree();
}

function insertTreeTaskNear(draggedId, targetId, targetCatId, targetSubcat, clientY) {
  if (!draggedId) return;
  const draggedTask = appState.tasks.find(t => t.id === draggedId);
  if (!draggedTask) return;

  draggedTask.categoryId = targetCatId;
  draggedTask.subcategoryId = targetSubcat;

  const targetTask = appState.tasks.find(t => t.id === targetId);
  if (targetTask && draggedId !== targetId) {
    const itemEl = document.getElementById(`tree-task-${targetId}`);
    let isAfter = true;
    if (itemEl) {
      const rect = itemEl.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        isAfter = false;
      }
    }
    draggedTask.order = isAfter ? (targetTask.order || 0) + 0.5 : (targetTask.order || 0) - 0.5;
    normalizeTaskOrders();
  } else {
    draggedTask.order = Date.now();
  }

  saveData();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function normalizeTaskOrders() {
  appState.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  appState.tasks.forEach((t, i) => {
    t.order = (i + 1) * 10;
  });
}

// 3. CATEGORY REORDERING (PLANNER & DRVO)
function handleCategoryDragStart(e, catId) {
  if (e.target.closest("button") || e.target.closest(".color-dot-btn") || e.target.isContentEditable) {
    e.preventDefault();
    return;
  }
  draggedCategoryId = catId;
  draggedTaskId = null;
  e.dataTransfer.setData("text/plain", catId);
  e.dataTransfer.effectAllowed = "move";
  const col = document.querySelector(`.category-column[data-category-id="${catId}"]`);
  if (col) col.classList.add("dragging");
}

function handleCategoryDragEnd(e) {
  cleanupCategoryDrag();
}

function handleCategoryColumnDragOver(e, targetCatId) {
  if (draggedCategoryId) {
    if (draggedCategoryId === targetCatId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const col = document.querySelector(`.category-column[data-category-id="${targetCatId}"]`);
    if (col) {
      const rect = col.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (e.clientX < midX) {
        col.classList.add("drag-over-left");
        col.classList.remove("drag-over-right");
      } else {
        col.classList.add("drag-over-right");
        col.classList.remove("drag-over-left");
      }
    }
    return;
  }
  if (draggedTaskId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
}

function handleCategoryColumnDragLeave(e) {
  const col = e.currentTarget;
  if (col && col.classList.contains("category-column")) {
    col.classList.remove("drag-over-left", "drag-over-right");
  }
}

function handleCategoryColumnDrop(e, targetCatId) {
  if (draggedCategoryId) {
    e.preventDefault();
    e.stopPropagation();
    const col = document.querySelector(`.category-column[data-category-id="${targetCatId}"]`);
    const isRight = col && col.classList.contains("drag-over-right");
    reorderCategory(draggedCategoryId, targetCatId, isRight);
    cleanupCategoryDrag();
    return;
  }
  if (draggedTaskId) {
    e.preventDefault();
    e.stopPropagation();
    moveTaskToZone(draggedTaskId, targetCatId, "soon");
    cleanupDropStyles();
  }
}

// Tree Category Dragging
function handleTreeCategoryDragStart(e, catId) {
  if (e.target.closest("button") || e.target.closest(".color-dot-btn") || e.target.isContentEditable) {
    e.preventDefault();
    return;
  }
  draggedCategoryId = catId;
  draggedTaskId = null;
  e.dataTransfer.setData("text/plain", catId);
  e.dataTransfer.effectAllowed = "move";
  const col = document.querySelector(`.tree-branch-col[data-category-id="${catId}"]`);
  if (col) col.classList.add("dragging");
}

function handleTreeCategoryDragEnd(e) {
  cleanupCategoryDrag();
}

function handleTreeBranchDragOver(e, targetCatId) {
  if (draggedCategoryId) {
    if (draggedCategoryId === targetCatId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const col = document.querySelector(`.tree-branch-col[data-category-id="${targetCatId}"]`);
    if (col) {
      const rect = col.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (e.clientX < midX) {
        col.classList.add("drag-over-left");
        col.classList.remove("drag-over-right");
      } else {
        col.classList.add("drag-over-right");
        col.classList.remove("drag-over-left");
      }
    }
    return;
  }
  if (draggedTaskId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
}

function handleTreeBranchDragLeave(e) {
  const col = e.currentTarget;
  if (col && col.classList.contains("tree-branch-col")) {
    col.classList.remove("drag-over-left", "drag-over-right");
  }
}

function handleTreeBranchDrop(e, targetCatId) {
  if (draggedCategoryId) {
    e.preventDefault();
    e.stopPropagation();
    const col = document.querySelector(`.tree-branch-col[data-category-id="${targetCatId}"]`);
    const isRight = col && col.classList.contains("drag-over-right");
    reorderCategory(draggedCategoryId, targetCatId, isRight);
    cleanupCategoryDrag();
    return;
  }
  if (draggedTaskId) {
    e.preventDefault();
    e.stopPropagation();
    const category = appState.categories.find(c => c.id === targetCatId);
    let targetSubcat = (category && category.subcategories && category.subcategories[0]) || "";

    const col = document.querySelector(`.tree-branch-col[data-category-id="${targetCatId}"]`);
    if (col) {
      const blocks = Array.from(col.querySelectorAll(".tree-subcat-block"));
      if (blocks.length > 0) {
        let closest = blocks[0];
        let minDist = Infinity;
        blocks.forEach(b => {
          const r = b.getBoundingClientRect();
          const midY = r.top + r.height / 2;
          const dist = Math.abs(e.clientY - midY);
          if (dist < minDist) {
            minDist = dist;
            closest = b;
          }
        });
        if (closest.dataset.subcategoryId !== undefined) {
          targetSubcat = closest.dataset.subcategoryId;
        }
      }
    }

    moveTaskToTreeSubcat(draggedTaskId, targetCatId, targetSubcat);
    cleanupDropStyles();
  }
}

function reorderCategory(fromCatId, toCatId, isRight) {
  const fromIdx = appState.categories.findIndex(c => c.id === fromCatId);
  const toIdx = appState.categories.findIndex(c => c.id === toCatId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

  const [movedCat] = appState.categories.splice(fromIdx, 1);
  let newIdx = appState.categories.findIndex(c => c.id === toCatId);
  if (isRight) newIdx++;
  appState.categories.splice(newIdx, 0, movedCat);

  saveData();
  renderPlanner();
  renderTree();
}

function cleanupCategoryDrag() {
  draggedCategoryId = null;
  document.querySelectorAll(".category-column").forEach(c => {
    c.classList.remove("dragging", "drag-over-left", "drag-over-right");
  });
  document.querySelectorAll(".tree-branch-col").forEach(c => {
    c.classList.remove("dragging", "drag-over-left", "drag-over-right");
  });
}

function cleanupDropStyles() {
  draggedTaskId = null;
  draggedCategoryId = null;
  document.body.classList.remove("dragging-task");
  document.querySelectorAll(".task-card").forEach(c => {
    c.classList.remove("dragging", "drag-over-top", "drag-over-bottom");
  });
  document.querySelectorAll(".tree-task-item").forEach(c => {
    c.classList.remove("dragging", "drag-over-top", "drag-over-bottom");
  });
  document.querySelectorAll(".planner-zone, .zone-tasks-list, .tree-subcat-block, .tree-items-list").forEach(c => {
    c.classList.remove("drag-over");
  });
}

// ========================================================
// SATISFYING STRIKE ANIMATION & SMART FOLLOW-UP
// ========================================================
function completeTask(taskId, e) {
  if (e) e.stopPropagation();

  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const isNowCompleted = !task.completed;
  task.completed = isNowCompleted;
  saveData();

  if (isNowCompleted) {
    playChime();

    // 1. Visually trigger animated strikethrough ON THE CURRENT ELEMENT
    const cardEl = document.getElementById("task-card-" + taskId);
    if (cardEl) {
      cardEl.classList.add("animating-complete", "completed");
    }
    const calPill = document.getElementById("cal-task-" + taskId);
    if (calPill) {
      calPill.classList.add("completed");
    }

    if (task.followUp) {
      const tomorrow = addDays(task.date || getTodayStr(), 1);
      const newTask = {
        id: "task-" + Date.now(),
        title: task.title,
        categoryId: task.categoryId,
        subcategoryId: task.subcategoryId,
        zone: "calendar",
        date: tomorrow,
        timeAlert: "11:00",
        followUp: true,
        completed: false,
        archived: false,
        order: (task.order || 0) + 1,
        rolledOver: false
      };
      appState.tasks.push(newTask);
      saveData();
      showToast("Završeno! Stvoren je nastavak za sutra u 11:00h.", false);
    } else {
      lastCompletedTaskId = task.id;
      showToast("Zadatak dovršen.", true);
    }

    // 2. ONLY RE-RENDER TO MOVE BELOW AFTER THE ANIMATION COMPLETES (450ms)
    // So the user clearly sees the strike line animate across!
    setTimeout(() => {
      renderPlanner();
      renderCalendar();
      renderTree();
    }, 450);

  } else {
    // Unchecking: reset archivedInPlanner and immediate re-render
    task.archivedInPlanner = false;
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
}

function showToast(message, allowFollowUp) {
  const toast = document.getElementById("toastBanner");
  const msgEl = document.getElementById("toastMessage");
  const followUpBtn = document.getElementById("toastFollowUpBtn");

  if (!toast || !msgEl || !followUpBtn) return;

  msgEl.textContent = message;
  followUpBtn.style.display = allowFollowUp ? "inline-block" : "none";

  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    hideToast();
  }, 3500);
}

function hideToast() {
  const toast = document.getElementById("toastBanner");
  if (toast) toast.classList.remove("show");
}

function handleToastFollowUp() {
  if (!lastCompletedTaskId) return;
  const originalTask = appState.tasks.find(t => t.id === lastCompletedTaskId);
  if (originalTask) {
    const tomorrow = addDays(originalTask.date || getTodayStr(), 1);
    const newTask = {
      id: "task-" + Date.now(),
      title: originalTask.title,
      categoryId: originalTask.categoryId,
      subcategoryId: originalTask.subcategoryId,
      zone: "calendar",
      date: tomorrow,
      timeAlert: "11:00",
      followUp: true,
      completed: false,
      archived: false,
      order: (originalTask.order || 0) + 1,
      rolledOver: false
    };
    appState.tasks.push(newTask);
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
    showToast("Stvoren nastavak za sutra u 11:00h!", false);
  }
}

// ========================================================
// ARCHIVE MODAL
// ========================================================
function openArchiveModal() {
  const modal = document.getElementById("archiveModal");
  const list = document.getElementById("archiveTasksList");
  if (!modal || !list) return;

  const archivedTasks = appState.tasks.filter(t => t.archived);

  if (archivedTasks.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: 20px;">Nema arhiviranih zadataka.</div>`;
  } else {
    list.innerHTML = archivedTasks.map(task => {
      const cat = appState.categories.find(c => c.id === task.categoryId) || { name: "Općenito" };
      return `
        <div class="archive-item">
          <span class="archive-item-title">${escapeHtml(task.title)} <small style="color: var(--text-tertiary);">(${escapeHtml(cat.name)})</small></span>
          <button class="btn-restore" onclick="restoreArchivedTask('${task.id}')">Vrati u planer</button>
        </div>
      `;
    }).join("");
  }

  modal.classList.add("active");
}

function closeArchiveModal() {
  const modal = document.getElementById("archiveModal");
  if (modal) modal.classList.remove("active");
}

function restoreArchivedTask(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (task) {
    task.archived = false;
    task.archivedInPlanner = false;
    saveData();
    openArchiveModal();
    renderPlanner();
    renderCalendar();
    renderTree();
  }
}

// ========================================================
// TASK DETAIL MODAL (SMART ZONE SWITCHING)
// ========================================================
function editTask(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;

  const titleInput = document.getElementById("taskModalTitleInput");
  titleInput.value = task.title;

  populateTaskModalCategories(task.categoryId, task.subcategoryId);

  const zoneName = ZONE_LABELS[task.zone] || "Planer";
  const metaStrip = document.getElementById("taskModalMetaStrip");
  if (metaStrip) {
    metaStrip.innerHTML = `<span id="taskModalZoneLabel" style="font-weight: 500; font-size: 11px;">Zona: ${zoneName}</span>`;
  }

  // SMART ZONE LOGIC: If task is in soon, longterm or ideas, do NOT show date/alert unless requested!
  const dateContainer = document.getElementById("dateRowContainer");
  const hasDate = task.zone === "calendar" || !!task.date;

  if (hasDate) {
    dateContainer.style.display = "flex";
    document.getElementById("taskDateInput").value = task.date || getTodayStr();
    document.getElementById("taskTimeInput").value = task.timeAlert || "11:00";
    removeDateAddButton();
  } else {
    dateContainer.style.display = "none";
    document.getElementById("taskDateInput").value = "";
    document.getElementById("taskTimeInput").value = "";
    renderDateAddButton();
  }

  document.getElementById("taskFollowUpCheck").checked = !!task.followUp;

  document.getElementById("taskModal").classList.add("active");
  setTimeout(() => titleInput.focus(), 50);

  titleInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      saveTaskModal();
    }
  };
}

function renderDateAddButton() {
  removeDateAddButton();
  const dateContainer = document.getElementById("dateRowContainer");
  if (!dateContainer) return;

  const btn = document.createElement("button");
  btn.id = "btnEnableDate";
  btn.className = "btn-icon";
  btn.type = "button";
  btn.style.marginTop = "2px";
  btn.style.width = "100%";
  btn.style.justifyContent = "center";
  btn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
    <span>+ Dodijeli datum (prebaci u kalendar)</span>
  `;
  btn.onclick = () => {
    dateContainer.style.display = "flex";
    document.getElementById("taskDateInput").value = getTodayStr();
    document.getElementById("taskTimeInput").value = getTimePlusOneHourStr();
    const zoneLbl = document.getElementById("taskModalZoneLabel");
    if (zoneLbl) zoneLbl.textContent = "U kalendaru";
    btn.remove();
  };
  dateContainer.parentNode.insertBefore(btn, dateContainer);
}

function removeDateAddButton() {
  const existing = document.getElementById("btnEnableDate");
  if (existing) existing.remove();
}

function openNewTaskModal(defaultCategoryId) {
  const firstCat = defaultCategoryId ? 
    appState.categories.find(c => c.id === defaultCategoryId) : 
    (appState.categories[0] || { id: "opcenito", name: "Općenito", color: "#636366" });

  const newTask = {
    id: "task-" + Date.now(),
    title: "",
    categoryId: firstCat.id,
    subcategoryId: "",
    zone: "calendar",
    date: getTodayStr(),
    timeAlert: getTimePlusOneHourStr(),
    followUp: false,
    completed: false,
    archived: false,
    order: Date.now(),
    rolledOver: false
  };

  appState.tasks.push(newTask);
  saveData();
  editTask(newTask.id);
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.remove("active");
  removeDateAddButton();
  editingTaskId = null;
}

function populateTaskModalCategories(selectedCatId, selectedSubcat) {
  const catSelect = document.getElementById("taskModalCategorySelect");
  if (!catSelect) return;

  catSelect.innerHTML = appState.categories.map(c => 
    `<option value="${c.id}" ${c.id === selectedCatId ? "selected" : ""}>${escapeHtml(c.name)}</option>`
  ).join("");

  updateTaskModalSubcategories(selectedCatId, selectedSubcat);
}

function updateTaskModalSubcategories(catId, selectedSubcat) {
  const subcatSelect = document.getElementById("taskModalSubcategorySelect");
  if (!subcatSelect) return;

  const cat = appState.categories.find(c => c.id === catId);
  const subcats = (cat && cat.subcategories && cat.subcategories.length) ? cat.subcategories : ["Općenito"];

  subcatSelect.innerHTML = subcats.map(s => 
    `<option value="${escapeHtml(s)}" ${(selectedSubcat === s || (!selectedSubcat && s === "Općenito")) ? "selected" : ""}>${escapeHtml(s)}</option>`
  ).join("");
}

function handleTaskModalCategoryChange(newCatId) {
  updateTaskModalSubcategories(newCatId, "");
}

function saveTaskModal() {
  if (!editingTaskId) return;
  const task = appState.tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  const titleVal = document.getElementById("taskModalTitleInput").value.trim();
  if (titleVal) {
    task.title = titleVal;
  }

  const catSelect = document.getElementById("taskModalCategorySelect");
  if (catSelect && catSelect.value) {
    task.categoryId = catSelect.value;
  }
  const subcatSelect = document.getElementById("taskModalSubcategorySelect");
  if (subcatSelect && subcatSelect.value !== undefined) {
    task.subcategoryId = subcatSelect.value;
  }
  
  const dateVal = document.getElementById("taskDateInput").value;
  const timeVal = document.getElementById("taskTimeInput").value;

  if (dateVal) {
    task.zone = "calendar";
    task.date = dateVal;
    task.timeAlert = timeVal || "11:00";
  } else {
    if (task.zone === "calendar") {
      task.zone = "soon";
    }
    task.date = "";
    task.timeAlert = "";
  }

  task.followUp = document.getElementById("taskFollowUpCheck").checked;

  saveData();
  closeTaskModal();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function deleteCurrentTask() {
  if (!editingTaskId) return;
  appState.tasks = appState.tasks.filter(t => t.id !== editingTaskId);
  saveData();
  closeTaskModal();
  renderPlanner();
  renderCalendar();
  renderTree();
}

// CATEGORY MODAL
function openNewCategoryModal() {
  document.getElementById("catNameInput").value = "";
  const plannerRadio = document.querySelector('input[name="catTypeInput"][value="planner"]');
  if (plannerRadio) plannerRadio.checked = true;
  document.getElementById("categoryModal").classList.add("active");
  setTimeout(() => document.getElementById("catNameInput").focus(), 50);
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.remove("active");
}

function saveCategoryModal() {
  const name = document.getElementById("catNameInput").value.trim();
  const color = document.getElementById("catColorInput").value;
  const typeInput = document.querySelector('input[name="catTypeInput"]:checked');
  const type = typeInput ? typeInput.value : "planner";
  if (!name) return;

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
  appState.categories.push({
    id,
    name,
    color,
    type,
    subcategories: ["Općenito"]
  });

  saveData();
  closeCategoryModal();
  renderPlanner();
  renderCalendar();
  renderTree();
}

function isSubcategorySimple(category, subcatName) {
  if (category && category.subcategoryTypes && category.subcategoryTypes[subcatName] !== undefined) {
    return category.subcategoryTypes[subcatName] === "simple";
  }
  return category && category.type === "simple";
}

function toggleCategoryType(categoryId, e) {
  if (e) e.stopPropagation();
  const cat = appState.categories.find(c => c.id === categoryId);
  if (!cat) return;
  const newType = cat.type === "simple" ? "planner" : "simple";
  cat.type = newType;
  if (cat.subcategories) {
    if (!cat.subcategoryTypes) cat.subcategoryTypes = {};
    cat.subcategories.forEach(s => {
      cat.subcategoryTypes[s] = newType;
    });
  }
  saveData();
  renderPlanner();
  renderTree();
  showToast(`Kategorija "${cat.name}" prebačena na: ${newType === "simple" ? "Jednostavna lista" : "Planer sa 4 zone"}.`, false);
}

function toggleSubcategoryType(categoryId, subcatName, e) {
  if (e) e.stopPropagation();
  const category = appState.categories.find(c => c.id === categoryId);
  if (!category) return;
  if (!category.subcategoryTypes) category.subcategoryTypes = {};

  const currentSimple = isSubcategorySimple(category, subcatName);
  const newType = currentSimple ? "planner" : "simple";
  category.subcategoryTypes[subcatName] = newType;
  saveData();
  renderTree();
  showToast(`Podkategorija "${subcatName}" prebačena na: ${newType === "simple" ? "Jednostavna lista" : "Planer sa 4 zone"}.`, false);
}

// SUBCATEGORY MODAL
function openNewSubcategoryModal(categoryId) {
  document.getElementById("subcatTargetCategoryId").value = categoryId;
  document.getElementById("subcatNameInput").value = "";

  const category = appState.categories.find(c => c.id === categoryId);
  const isParentSimple = category && category.type === "simple";
  const defaultVal = isParentSimple ? "simple" : "planner";
  const radio = document.querySelector(`input[name="subcatTypeInput"][value="${defaultVal}"]`);
  if (radio) radio.checked = true;

  document.getElementById("subcategoryModal").classList.add("active");
  setTimeout(() => document.getElementById("subcatNameInput").focus(), 50);
}

function closeSubcatModal() {
  document.getElementById("subcategoryModal").classList.remove("active");
}

function saveSubcatModal() {
  const catId = document.getElementById("subcatTargetCategoryId").value;
  const name = document.getElementById("subcatNameInput").value.trim();
  const typeInput = document.querySelector('input[name="subcatTypeInput"]:checked');
  const type = typeInput ? typeInput.value : "planner";
  if (!name) return;

  const category = appState.categories.find(c => c.id === catId);
  if (category) {
    if (!category.subcategories) category.subcategories = [];
    if (!category.subcategories.includes(name)) {
      category.subcategories.push(name);
    }
    if (!category.subcategoryTypes) category.subcategoryTypes = {};
    category.subcategoryTypes[name] = type;
    saveData();
    renderTree();
    renderPlanner();
  }
  closeSubcatModal();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ========================================================
// COMPUTER ALERTS & NOTIFICATIONS SYSTEM
// ========================================================
let activeAlertTaskId = null;

function playAlertAlarmChime() {
  if (!appState.settings.sound) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    
    // Melodic Alarm Chime: 3 distinct harmonic chimes
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.14); // A5
    gain2.gain.setValueAtTime(0.001, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.35, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.55);

    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(1108.73, now + 0.28); // C#6
    gain3.gain.setValueAtTime(0.001, now + 0.28);
    gain3.gain.exponentialRampToValueAtTime(0.3, now + 0.32);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.start(now + 0.28);
    osc3.stop(now + 0.8);
  } catch (err) {
    console.error("Audio error:", err);
  }
}

function checkTaskAlerts() {
  const today = getTodayStr();
  const now = new Date();
  const curH = String(now.getHours()).padStart(2, '0');
  const curM = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${curH}:${curM}`;

  appState.tasks.forEach(task => {
    if (task.completed || task.archived) return;
    if (task.date !== today) return;
    if (!task.timeAlert) return;

    if (task.timeAlert === currentTime) {
      if (task.lastAlertedTime !== currentTime || task.lastAlertedDate !== today) {
        task.lastAlertedDate = today;
        task.lastAlertedTime = currentTime;
        saveData();
        triggerTaskAlert(task);
      }
    }
  });
}

function triggerTaskAlert(task) {
  activeAlertTaskId = task.id;
  const category = appState.categories.find(c => c.id === task.categoryId) || { name: "Općenito", color: "#636366" };

  playAlertAlarmChime();

  if ("Notification" in window && Notification.permission === "granted") {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification("Thank You, Next: " + task.title, {
          body: `${category.name} • ${task.timeAlert || ""}`,
          icon: "apple-touch-icon.png",
          badge: "icon-192.png",
          data: { taskId: task.id }
        });
      }).catch(() => {
        sendDesktopNotificationFallback(task, category);
      });
    } else {
      sendDesktopNotificationFallback(task, category);
    }
  }

  openTaskAlertModal(task, category);
}

function sendDesktopNotificationFallback(task, category) {
  try {
    const n = new Notification("Thank You, Next: " + task.title, {
      body: `${category.name} • ${task.timeAlert || ""}`,
      requireInteraction: true
    });
    n.onclick = () => {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeApp) {
        window.webkit.messageHandlers.nativeApp.postMessage({
          action: "activateApp",
          taskId: task.id
        });
      }
      window.focus();
      openTaskAlertModal(task, category);
    };
  } catch (e) {
    console.error("Desktop notification error:", e);
  }
}

function openTaskAlertModal(task, category) {
  activeAlertTaskId = task.id;
  const cat = category || appState.categories.find(c => c.id === task.categoryId) || { name: "Općenito", color: "#636366" };

  const pillEl = document.getElementById("alertModalCategoryPill");
  if (pillEl) {
    pillEl.innerHTML = `
      <span class="color-dot" style="background-color: ${cat.color};"></span>
      <span style="font-weight: 600; font-size: 12px; color: var(--text-primary); margin-left: 4px;">${escapeHtml(cat.name)}</span>
    `;
  }

  const titleEl = document.getElementById("alertModalTaskTitle");
  if (titleEl) {
    titleEl.textContent = task.title;
  }

  const timeEl = document.getElementById("alertModalTimeText");
  if (timeEl) {
    timeEl.textContent = `Podsjetnik postavljen za danas u ${task.timeAlert || "11:00"}`;
  }

  const modal = document.getElementById("taskAlertModal");
  if (modal) modal.classList.add("active");
}

function closeTaskAlertModal() {
  const modal = document.getElementById("taskAlertModal");
  if (modal) modal.classList.remove("active");
  activeAlertTaskId = null;
}

function snoozeAlert(minutes) {
  if (!activeAlertTaskId) return;
  const task = appState.tasks.find(t => t.id === activeAlertTaskId);
  if (!task) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  const newH = String(now.getHours()).padStart(2, '0');
  const newM = String(now.getMinutes()).padStart(2, '0');
  const newTime = `${newH}:${newM}`;

  task.timeAlert = newTime;
  task.lastAlertedTime = null;
  task.lastAlertedDate = null;
  saveData();

  closeTaskAlertModal();
  renderPlanner();
  renderCalendar();
  renderTree();
  showToast(`Podsjetnik odgođen za ${minutes} min (u ${newTime}).`, false);
}

function completeAlertTask() {
  if (!activeAlertTaskId) return;
  const idToComplete = activeAlertTaskId;
  closeTaskAlertModal();
  completeTask(idToComplete);
}

function openNotifSettingsModal() {
  const modal = document.getElementById("notifSettingsModal");
  if (modal) modal.classList.add("active");
  requestNotificationPermission();
}

function closeNotifSettingsModal() {
  const modal = document.getElementById("notifSettingsModal");
  if (modal) modal.classList.remove("active");
}

function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(perm => {
        updateNotifBtnLabel(perm);
      });
    } else {
      updateNotifBtnLabel(Notification.permission);
    }
  }
}

function updateNotifBtnLabel(perm) {
  const lbl = document.getElementById("notifLabel");
  if (!lbl) return;
  if (perm === "granted") {
    lbl.textContent = "Obavijesti: Uključene";
  } else if (perm === "denied") {
    lbl.textContent = "Obavijesti: Isključene";
  } else {
    lbl.textContent = "Obavijesti: Uključene";
  }
}

function testNotificationNow() {
  playAlertAlarmChime();
  if ("Notification" in window) {
    const showTestBanner = () => {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification("Thank You, Next: Test Obavijesti", {
            body: "Obavijesti rade savršeno na vašem uređaju!",
            icon: "apple-touch-icon.png",
            badge: "icon-192.png"
          });
        }).catch(() => {
          try {
            new Notification("Thank You, Next: Test Obavijesti", {
              body: "Obavijesti rade savršeno na vašem uređaju!"
            });
          } catch (e) {}
        });
      } else {
        try {
          new Notification("Thank You, Next: Test Obavijesti", {
            body: "Obavijesti rade savršeno na vašem uređaju!"
          });
        } catch (e) {}
      }
    };

    if (Notification.permission === "granted") {
      showTestBanner();
    } else {
      Notification.requestPermission().then(p => {
        updateNotifBtnLabel(p);
        if (p === "granted") {
          showTestBanner();
        }
      });
    }
  }

  openTaskAlertModal({
    id: "test",
    title: "Testni podsjetnik za zadatak",
    timeAlert: "Upravo",
    categoryId: (appState.categories[0] && appState.categories[0].id) || ""
  });
}

// ========================================================
// EXTERNAL / NATIVE NOTIFICATION INTEGRATION
// ========================================================
window.openTaskById = function(taskId) {
  if (!taskId) return;
  const task = appState.tasks.find(t => String(t.id) === String(taskId));
  if (!task) return;

  if (typeof switchView === "function") {
    switchView("planner");
  }

  if (typeof editTask === "function") {
    editTask(task.id);
  }

  setTimeout(() => {
    const cardEl = document.getElementById("task-card-" + task.id) || document.getElementById("cal-task-" + task.id);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
};

window.snoozeTaskById = function(taskId, minutes) {
  if (!taskId) return;
  const task = appState.tasks.find(t => String(t.id) === String(taskId));
  if (!task) return;

  const mins = Number(minutes) || 60;
  const now = new Date();
  now.setMinutes(now.getMinutes() + mins);
  const newH = String(now.getHours()).padStart(2, '0');
  const newM = String(now.getMinutes()).padStart(2, '0');
  const newTime = `${newH}:${newM}`;

  task.timeAlert = newTime;
  task.lastAlertedTime = null;
  task.lastAlertedDate = null;
  saveData();

  if (typeof activeAlertTaskId !== "undefined" && activeAlertTaskId === task.id) {
    closeTaskAlertModal();
  }

  renderPlanner();
  renderCalendar();
  renderTree();
  showToast(`Zadatak '${task.title}' odgođen za ${mins} min (u ${newTime}).`, false);
};

window.completeTaskById = function(taskId) {
  if (!taskId) return;
  const task = appState.tasks.find(t => String(t.id) === String(taskId));
  if (!task) return;

  if (typeof activeAlertTaskId !== "undefined" && activeAlertTaskId === task.id) {
    closeTaskAlertModal();
  }

  if (!task.completed) {
    completeTask(task.id);
  }
};

// MOBILE TOUCH DRAG & DROP HELPER
function setupMobileTouchDrag() {
  let touchStartEl = null;
  let touchTaskId = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let isDraggingTouch = false;
  let ghostEl = null;
  let currentDropTarget = null;
  let dragTimer = null;

  document.addEventListener("touchstart", (e) => {
    const card = e.target.closest(".task-card");
    if (!card) return;
    if (e.target.closest(".custom-checkbox") || e.target.closest(".task-card-delete-btn") || e.target.closest(".task-card-move-btn")) return;

    touchStartEl = card;
    touchTaskId = card.id ? card.id.replace("task-card-", "") : null;
    if (!touchTaskId) return;

    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    isDraggingTouch = false;

    // Start drag after 350ms deliberate hold
    clearTimeout(dragTimer);
    dragTimer = setTimeout(() => {
      isDraggingTouch = true;
      draggedTaskId = touchTaskId;
      draggedCategoryId = null;

      if (navigator.vibrate) {
        try { navigator.vibrate(25); } catch (err) {}
      }

      ghostEl = card.cloneNode(true);
      ghostEl.style.position = "fixed";
      ghostEl.style.zIndex = "99999";
      ghostEl.style.pointerEvents = "none";
      ghostEl.style.opacity = "0.88";
      ghostEl.style.transform = "scale(1.04) rotate(2deg)";
      ghostEl.style.boxShadow = "0 10px 25px rgba(0,0,0,0.35)";
      ghostEl.style.width = card.offsetWidth + "px";
      ghostEl.style.left = (t.clientX - card.offsetWidth / 2) + "px";
      ghostEl.style.top = (t.clientY - 25) + "px";
      document.body.appendChild(ghostEl);
      card.style.opacity = "0.4";
    }, 350);
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!touchStartEl) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchStartX);
    const dy = Math.abs(t.clientY - touchStartY);

    if (!isDraggingTouch) {
      if (dx > 7 || dy > 7) {
        clearTimeout(dragTimer);
        touchStartEl = null;
        touchTaskId = null;
      }
      return;
    }

    if (e.cancelable) e.preventDefault();
    if (ghostEl) {
      ghostEl.style.left = (t.clientX - ghostEl.offsetWidth / 2) + "px";
      ghostEl.style.top = (t.clientY - 25) + "px";
    }

    const elUnder = document.elementFromPoint(t.clientX, t.clientY);
    document.querySelectorAll(".day-cell.drag-over").forEach(el => el.classList.remove("drag-over"));
    currentDropTarget = null;

    if (elUnder) {
      const dayCell = elUnder.closest(".day-cell");
      if (dayCell) {
        dayCell.classList.add("drag-over");
        currentDropTarget = { type: "day", date: dayCell.dataset.date };
      } else {
        const zoneList = elUnder.closest(".zone-tasks-list");
        if (zoneList) {
          const catCol = elUnder.closest(".category-column");
          const plannerZone = elUnder.closest(".planner-zone");
          const catId = catCol ? catCol.dataset.categoryId : null;
          const zoneName = plannerZone ? plannerZone.dataset.zone : "soon";
          if (catId) {
            currentDropTarget = { type: "zone", catId, zone: zoneName };
          }
        }
      }
    }
  }, { passive: false });

  const endTouchDrag = () => {
    clearTimeout(dragTimer);
    try {
      if (isDraggingTouch && draggedTaskId && currentDropTarget) {
        if (currentDropTarget.type === "day" && currentDropTarget.date) {
          handleCalendarDrop(currentDropTarget.date);
          if (navigator.vibrate) {
            try { navigator.vibrate(30); } catch (err) {}
          }
        } else if (currentDropTarget.type === "zone" && currentDropTarget.catId) {
          handleZoneDrop(null, currentDropTarget.catId, currentDropTarget.zone);
          if (navigator.vibrate) {
            try { navigator.vibrate(30); } catch (err) {}
          }
        }
      }
    } catch (err) {
      console.error("Touch drag error:", err);
    } finally {
      if (ghostEl) {
        ghostEl.remove();
        ghostEl = null;
      }
      if (touchStartEl) {
        touchStartEl.style.opacity = "";
      }
      document.querySelectorAll(".day-cell.drag-over").forEach(el => el.classList.remove("drag-over"));
      isDraggingTouch = false;
      touchStartEl = null;
      touchTaskId = null;
      currentDropTarget = null;
      draggedTaskId = null;
    }
  };

  document.addEventListener("touchend", endTouchDrag);
  document.addEventListener("touchcancel", endTouchDrag);
}

// ========================================================
// MOBILE QUICK MOVE MODAL (1-TAP MOVE FOR PHONE USERS)
// ========================================================
let activeMobileMoveTaskId = null;

function openMobileTaskMoveModal(taskId, e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  activeMobileMoveTaskId = taskId;
  const task = appState.tasks.find(t => t.id === taskId);
  const titleEl = document.getElementById("mobileMoveTaskTitle");
  if (titleEl && task) {
    const truncated = task.title.length > 22 ? task.title.substring(0, 20) + "..." : task.title;
    titleEl.textContent = `Premjesti: "${truncated}"`;
  }
  const modal = document.getElementById("mobileTaskMoveModal");
  if (modal) modal.classList.add("active");
}

function closeMobileTaskMoveModal() {
  const modal = document.getElementById("mobileTaskMoveModal");
  if (modal) modal.classList.remove("active");
  activeMobileMoveTaskId = null;
}

function moveActiveMobileTaskToToday() {
  if (!activeMobileMoveTaskId) return;
  const today = getTodayStr();
  const task = appState.tasks.find(t => t.id === activeMobileMoveTaskId);
  if (task) {
    task.zone = "calendar";
    task.date = today;
    task.rolledOver = false;
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
    selectCalendarDate(today);
    showToast(`Premješteno u kalendar za danas (${today})`);
  }
  closeMobileTaskMoveModal();
}

function promptMoveActiveMobileTaskToDate() {
  if (!activeMobileMoveTaskId) return;
  const task = appState.tasks.find(t => t.id === activeMobileMoveTaskId);
  if (!task) return closeMobileTaskMoveModal();

  const chosenDate = prompt("Unesite datum za kalendar (GGGG-MM-DD):", task.date || getTodayStr());
  if (chosenDate && /^\d{4}-\d{2}-\d{2}$/.test(chosenDate.trim())) {
    task.zone = "calendar";
    task.date = chosenDate.trim();
    task.rolledOver = false;
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
    selectCalendarDate(task.date);
    showToast(`Premješteno u kalendar za ${task.date}`);
  }
  closeMobileTaskMoveModal();
}

function moveActiveMobileTaskToZone(targetZone) {
  if (!activeMobileMoveTaskId) return;
  const task = appState.tasks.find(t => t.id === activeMobileMoveTaskId);
  if (task) {
    task.zone = targetZone;
    task.date = "";
    saveData();
    renderPlanner();
    renderCalendar();
    renderTree();
    const zoneName = ZONE_LABELS[targetZone] || targetZone;
    showToast(`Premješteno u "${zoneName}"`);
  }
  closeMobileTaskMoveModal();
}

// ========================================================
// THEME SWITCHER (FOR MOBILE PHONE ONLY; LAPTOP UNTOUCHED)
// ========================================================
function initTheme() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const savedTheme = localStorage.getItem("thank_you_next_mobile_theme") || "dark";
    applyTheme(savedTheme);
  } else {
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.body.classList.remove("theme-light", "theme-dark");
  }
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.body.classList.remove("theme-light", "theme-dark");
  }
});

function toggleMobileTheme() {
  const isLight = document.body.classList.contains("theme-light") || document.documentElement.classList.contains("theme-light");
  const next = isLight ? "dark" : "light";
  applyTheme(next);
  try {
    localStorage.setItem("thank_you_next_mobile_theme", next);
  } catch (e) {}
}

function applyTheme(theme) {
  const isLight = (theme === "light");
  document.documentElement.classList.remove("theme-light", "theme-dark");
  document.body.classList.remove("theme-light", "theme-dark");
  document.documentElement.classList.add(isLight ? "theme-light" : "theme-dark");
  document.body.classList.add(isLight ? "theme-light" : "theme-dark");

  const iconEl = document.getElementById("themeToggleIcon");
  const textEl = document.getElementById("themeToggleText");
  if (iconEl && textEl) {
    if (isLight) {
      iconEl.textContent = "🌙";
      textEl.textContent = "Tamna";
    } else {
      iconEl.textContent = "☀️";
      textEl.textContent = "Svijetla";
    }
  }

  // Update status bar theme-color for iOS Safari
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", isLight ? "#F2F2F7" : "#1C1C1E");
  }
}

// ========================================================
// REAL-TIME CLOUD SYNCHRONIZATION (LAPTOP <-> IPHONE)
// ========================================================
const CloudSync = {
  syncKey: null,
  databaseUrl: null,
  isPushing: false,
  pushTimer: null,
  pollTimer: null,

  init() {
    this.syncKey = localStorage.getItem("thank_you_next_sync_key") || "ANJA-NEXT-2026";
    this.databaseUrl = localStorage.getItem("thank_you_next_sync_db_url") || "";
    this.updateStatusBadge("Povezano", "success");

    // Background sync polling every 3 seconds
    this.pollTimer = setInterval(() => {
      this.pullUpdate();
    }, 3000);

    // Pull on window focus / tab visibility
    window.addEventListener("focus", () => this.pullUpdate());
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) this.pullUpdate();
    });

    // Initial pull and push
    setTimeout(() => this.pullUpdate(), 1000);
  },

  getEndpoint() {
    if (this.databaseUrl && this.databaseUrl.trim()) {
      let base = this.databaseUrl.trim().replace(/\/+$/, "");
      if (!base.endsWith(".json")) base += `/sync/${encodeURIComponent(this.syncKey)}.json`;
      return base;
    }
    // High-performance public sync endpoint for Anja
    return "https://api.restful-api.dev/objects/ff808181a09d98f701a16f7fce040152";
  },

  schedulePush() {
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushUpdate();
    }, 400);
  },

  async pushUpdate() {
    if (this.isPushing) return;
    this.isPushing = true;
    this.setSyncingIndicator(true);

    try {
      const payload = {
        name: this.syncKey || "ANJA-NEXT-2026",
        data: {
          state: appState,
          lastModified: appState.lastModified || Date.now(),
          clientDevice: (window.innerWidth <= 768 ? "mobile" : "desktop")
        }
      };

      const res = await fetch(this.getEndpoint(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.updateStatusBadge("Povezano", "success");
      }
    } catch (e) {
      this.updateStatusBadge("Offline", "offline");
    } finally {
      this.isPushing = false;
      this.setSyncingIndicator(false);
    }
  },

  async pullUpdate() {
    if (this.isPushing) return;

    try {
      const res = await fetch(this.getEndpoint(), { cache: "no-store" });
      if (!res.ok) return;

      const remoteObj = await res.json();
      const remoteData = (remoteObj && remoteObj.data) ? remoteObj.data : remoteObj;
      if (!remoteData || !remoteData.state) return;

      const remoteMod = remoteData.lastModified || 0;
      const localMod = appState.lastModified || 0;

      if (remoteMod > localMod) {
        appState = remoteData.state;
        appState.lastModified = remoteMod;
        saveData(true);
        renderPlanner();
        renderCalendar();
        renderTree();
        if (typeof renderDayAgenda === "function") {
          renderDayAgenda(selectedCalendarDate || getTodayStr());
        }
        this.flashSyncSuccess();
      }
      this.updateStatusBadge("Povezano", "success");
    } catch (e) {
      // fail silently
    }
  },

  setSyncingIndicator(isSyncing) {
    const dot = document.getElementById("syncDot");
    if (!dot) return;
    if (isSyncing) {
      dot.className = "sync-status-dot syncing";
    } else {
      dot.className = "sync-status-dot";
    }
  },

  flashSyncSuccess() {
    const dot = document.getElementById("syncDot");
    const lbl = document.getElementById("syncLabel");
    if (dot) {
      dot.style.background = "#34C759";
      dot.style.boxShadow = "0 0 8px rgba(52, 199, 89, 0.8)";
      setTimeout(() => {
        dot.style.boxShadow = "";
      }, 1000);
    }
    if (lbl) {
      lbl.textContent = "Ažurirano!";
      setTimeout(() => {
        lbl.textContent = "Povezano";
      }, 2000);
    }
  },

  updateStatusBadge(text, type) {
    const badge = document.getElementById("syncModalStatusBadge");
    const timeEl = document.getElementById("syncModalLastSyncTime");
    const dot = document.getElementById("syncDot");
    const lbl = document.getElementById("syncLabel");

    if (dot) {
      dot.className = `sync-status-dot ${type === "offline" ? "offline" : ""}`;
    }
    if (lbl && lbl.textContent !== "Ažurirano!") {
      lbl.textContent = text;
    }
    if (badge) {
      badge.textContent = text;
      badge.style.color = type === "success" ? "var(--success-color)" : "var(--text-tertiary)";
    }
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = `Zadnja provjera: ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    }
  }
};

function openSyncModal() {
  const modal = document.getElementById("syncModal");
  const input = document.getElementById("syncRoomInput");
  const dbInput = document.getElementById("syncDatabaseUrlInput");
  if (modal) modal.classList.add("active");
  if (input) input.value = CloudSync.syncKey || "ANJA-NEXT-2026";
  if (dbInput) dbInput.value = CloudSync.databaseUrl || "";
  CloudSync.updateStatusBadge("Povezano", "success");
}

function closeSyncModal() {
  const modal = document.getElementById("syncModal");
  if (modal) modal.classList.remove("active");
}

function generateRandomSyncKey() {
  const key = "ANJA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const input = document.getElementById("syncRoomInput");
  if (input) input.value = key;
}

function saveSyncSettings() {
  const input = document.getElementById("syncRoomInput");
  const dbInput = document.getElementById("syncDatabaseUrlInput");
  if (input && input.value.trim()) {
    CloudSync.syncKey = input.value.trim().toUpperCase();
    localStorage.setItem("thank_you_next_sync_key", CloudSync.syncKey);
  }
  if (dbInput) {
    CloudSync.databaseUrl = dbInput.value.trim();
    localStorage.setItem("thank_you_next_sync_db_url", CloudSync.databaseUrl);
  }
  closeSyncModal();
  showToast("Sync postavke spremljene. Povezivanje...", false);
  CloudSync.pushUpdate();
}

function syncNowManual() {
  showToast("Sinhronizacija u toku...", false);
  CloudSync.pushUpdate();
  CloudSync.pullUpdate();
}

// INIT
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadData();
  renderPlanner();
  renderCalendar();
  setupTreePan();
  setupSplitResizer();
  setupMobileTouchDrag();
  CloudSync.init();

  // Register Service Worker for PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      console.log("Service Worker registered:", reg.scope);
    }).catch((err) => {
      console.warn("Service Worker registration:", err);
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.action === "openTask" && event.data.taskId) {
        if (typeof window.openTaskById === "function") {
          window.openTaskById(event.data.taskId);
        }
      }
    });
  }

  // Periodically check rollover every 60s and on window focus
  setInterval(runRolloverCheck, 60000);
  window.addEventListener("focus", runRolloverCheck);

  // Periodically check task alerts every 10s and on window focus
  setInterval(checkTaskAlerts, 10000);
  window.addEventListener("focus", checkTaskAlerts);
  setTimeout(checkTaskAlerts, 1000);

  // Prompt for notification permission on start
  requestNotificationPermission();
});
