// Supabase 接続情報
const SUPABASE_URL = 'https://cxthvtyjjvfumxcsennj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5vXRFIK-M_Q_vahDjLFFwg_k5hnrJNx';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM要素の取得
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');

const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const verifyCard = document.getElementById('verify-card');
const notReadyCard = document.getElementById('not-ready-card');

const homeView = document.getElementById('home-view');
const absenceView = document.getElementById('absence-view');
const statusView = document.getElementById('status-view');
const calendarView = document.getElementById('calendar-view');
const timetableView = document.getElementById('timetable-view');
const noticesView = document.getElementById('notices-view');
const noticeDetailViewVer112 = document.getElementById('notice-detail-view-ver112');
const noticeDetailViewVer111 = document.getElementById('notice-detail-view-ver111');
const helpView = document.getElementById('help-view');
const settingsView = document.getElementById('settings-view');

const loginErrorMsg = document.getElementById('login-error-msg');
const registerErrorMsg = document.getElementById('register-error-msg');

const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const headerLogoutBtn = document.getElementById('header-logout-btn');

const appTitleBtn = document.getElementById('app-title-btn');
const helpBtn = document.getElementById('help-btn');
const settingsBtn = document.getElementById('settings-btn');
const noticesBtn = document.getElementById('notices-btn');

const tabHome = document.getElementById('tab-home');
const tabAbsence = document.getElementById('tab-absence');
const tabStatus = document.getElementById('tab-status');
const tabCalendar = document.getElementById('tab-calendar');
const tabTimetable = document.getElementById('tab-timetable');

// 10分間無操作の自動ログアウト
let idleTimeout = null;
const IDLE_TIME_LIMIT = 10 * 60 * 1000;

function resetIdleTimer() {
  const { data } = supabase.auth.getSession();
  if (data && data.session && !mainApp.classList.contains('hidden')) {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(async () => {
      try {
        await supabase.auth.signOut();
        alert("10分間操作がなかったため、自動的にログアウトしました。");
      } catch (error) {
        console.error("自動ログアウトエラー:", error);
      }
    }, IDLE_TIME_LIMIT);
  }
}

['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
  window.addEventListener(event, resetIdleTimer, true);
});

function showCard(cardToShow) {
  loginCard.classList.add('hidden');
  registerCard.classList.add('hidden');
  verifyCard.classList.add('hidden');
  notReadyCard.classList.add('hidden');
  if (loginErrorMsg) loginErrorMsg.classList.add('hidden');
  if (registerErrorMsg) registerErrorMsg.classList.add('hidden');
  cardToShow.classList.remove('hidden');
}

// 認証状態の監視
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session && session.user) {
    authContainer.classList.add('hidden');
    mainApp.classList.remove('hidden');
    await loadUserDataFromCloud();
    showMainView('home');
    resetIdleTimer();
    renderHome();
  } else {
    mainApp.classList.add('hidden');
    authContainer.classList.remove('hidden');
    showCard(loginCard);
    if (idleTimeout) clearTimeout(idleTimeout);
  }
});

function showMainView(viewName) {
  homeView.classList.add('hidden');
  absenceView.classList.add('hidden');
  statusView.classList.add('hidden');
  calendarView.classList.add('hidden');
  timetableView.classList.add('hidden');
  noticesView.classList.add('hidden');
  noticeDetailViewVer112.classList.add('hidden');
  noticeDetailViewVer111.classList.add('hidden');
  helpView.classList.add('hidden');
  settingsView.classList.add('hidden');

  settingsBtn.classList.remove('active');
  noticesBtn.classList.remove('active');
  helpBtn.classList.remove('active');

  tabHome.classList.remove('active');
  tabAbsence.classList.remove('active');
  tabStatus.classList.remove('active');
  tabCalendar.classList.remove('active');
  tabTimetable.classList.remove('active');

  if (viewName === 'home') {
    homeView.classList.remove('hidden');
    tabHome.classList.add('active');
    renderHome();
  } else if (viewName === 'absence') {
    absenceView.classList.remove('hidden');
    tabAbsence.classList.add('active');
  } else if (viewName === 'status') {
    statusView.classList.remove('hidden');
    tabStatus.classList.add('active');
  } else if (viewName === 'calendar') {
    calendarView.classList.remove('hidden');
    tabCalendar.classList.add('active');
    renderCalendar();
  } else if (viewName === 'timetable') {
    timetableView.classList.remove('hidden');
    tabTimetable.classList.add('active');
    renderTimetableList();
  } else if (viewName === 'notices') {
    noticesView.classList.remove('hidden');
    noticesBtn.classList.add('active');
  } else if (viewName === 'noticeDetail112') {
    noticeDetailViewVer112.classList.remove('hidden');
    noticesBtn.classList.add('active');
  } else if (viewName === 'noticeDetail111') {
    noticeDetailViewVer111.classList.remove('hidden');
    noticesBtn.classList.add('active');
  } else if (viewName === 'help') {
    helpView.classList.remove('hidden');
    helpBtn.classList.add('active');
  } else if (viewName === 'settings') {
    settingsView.classList.remove('hidden');
    settingsBtn.classList.add('active');
    const activeMenu = document.querySelector('.settings-menu-item.active') || document.querySelector('.settings-menu-item');
    if (activeMenu) {
      loadSettingsPanel(activeMenu.getAttribute('data-title'));
    }
  }
  resetIdleTimer();
}

tabHome.addEventListener('click', () => showMainView('home'));
tabAbsence.addEventListener('click', () => showMainView('absence'));
tabStatus.addEventListener('click', () => showMainView('status'));
tabCalendar.addEventListener('click', () => showMainView('calendar'));
tabTimetable.addEventListener('click', () => showMainView('timetable'));

appTitleBtn.addEventListener('click', () => showMainView('home'));
helpBtn.addEventListener('click', () => showMainView('help'));
noticesBtn.addEventListener('click', () => showMainView('notices'));
settingsBtn.addEventListener('click', () => showMainView('settings'));

const noticeItemVer112 = document.getElementById('notice-item-ver112');
if (noticeItemVer112) {
  noticeItemVer112.addEventListener('click', () => showMainView('noticeDetail112'));
}
const noticeItemVer111 = document.getElementById('notice-item-ver111');
if (noticeItemVer111) {
  noticeItemVer111.addEventListener('click', () => showMainView('noticeDetail111'));
}

document.querySelectorAll('.back-to-notices-btn').forEach(btn => {
  btn.addEventListener('click', () => showMainView('notices'));
});

headerLogoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
});

// ==========================================
// Supabase クラウドデータ同期管理
// ==========================================
let cloudDataCache = {
  settings: { maxPeriods: 6, showSat: false, showSun: false },
  courseGroups: [],
  events: [],
  overrides: {},
  timetableGroups: []
};

async function loadUserDataFromCloud() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data_json')
      .eq('user_id', user.id)
      .single();

    if (data && data.data_json) {
      cloudDataCache = data.data_json;
    } else {
      await saveUserDataToCloud();
    }
  } catch (error) {
    console.error("クラウドデータ読み込みエラー:", error);
  }
}

async function saveUserDataToCloud() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        user_id: user.id, 
        data_json: cloudDataCache,
        updated_at: new Date()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("クラウドデータ保存エラー:", error.message);
    }
  } catch (error) {
    console.error("クラウドデータ保存例外:", error);
  }
}

// ==========================================
// 各種機能（設定・科目・カレンダー・時間割など）
// ==========================================
function getSettings() {
  return cloudDataCache.settings;
}

async function saveSettings(settings) {
  cloudDataCache.settings = settings;
  await saveUserDataToCloud();
}

function setActiveDays(settings) {
  let days = [
    { key: 'mon', label: '月' },
    { key: 'tue', label: '火' },
    { key: 'wed', label: '水' },
    { key: 'thu', label: '木' },
    { key: 'fri', label: '金' }
  ];
  if (settings.showSat) days.push({ key: 'sat', label: '土' });
  if (settings.showSun) days.push({ key: 'sun', label: '日' });
  return days;
}

function getSavedCourseGroups() {
  return cloudDataCache.courseGroups;
}

async function saveCourseGroups(groups) {
  cloudDataCache.courseGroups = groups;
  await saveUserDataToCloud();
}

function getAllSubjects() {
  const groups = getSavedCourseGroups();
  let subs = [];
  groups.forEach(g => {
    if (g.subjects && Array.isArray(g.subjects)) {
      subs = subs.concat(g.subjects);
    }
  });
  return [...new Set(subs)];
}

let currentCalendarDate = new Date();
let selectedCalendarDateStr = null;

function getNationalHoliday(year, month, day) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const fixedHolidays = {
    [`${year}-01-01`]: "元日",
    [`${year}-02-11`]: "建国記念の日",
    [`${year}-02-23`]: "天皇誕生日",
    [`${year}-04-29`]: "昭和の日",
    [`${year}-05-03`]: "憲法記念日",
    [`${year}-05-04`]: "みどりの日",
    [`${year}-05-05`]: "こどもの日",
    [`${year}-07-20`]: "海の日",
    [`${year}-08-11`]: "山の日",
    [`${year}-09-23`]: "秋分の日",
    [`${year}-10-12`]: "スポーツの日",
    [`${year}-11-03`]: "文化の日",
    [`${year}-11-23`]: "勤労感謝の日"
  };
  return fixedHolidays[dateStr] || null;
}

function getSavedEvents() {
  return cloudDataCache.events;
}

async function saveEvents(events) {
  cloudDataCache.events = events;
  await saveUserDataToCloud();
}

function getEventColorStyles(colorKey) {
  switch (colorKey) {
    case 'red': return { bg: '#fee2e2', color: '#991b1b' };
    case 'green': return { bg: '#d1fae5', color: '#065f46' };
    case 'orange': return { bg: '#fef3c7', color: '#92400e' };
    case 'purple': return { bg: '#f3e8ff', color: '#6b21a8' };
    case 'gray': return { bg: '#f3f4f6', color: '#374151' };
    case 'blue':
    default: return { bg: '#e0f2fe', color: '#0369a1' };
  }
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const titleElem = document.getElementById('cal-month-title');
  if (titleElem) titleElem.textContent = `${year}年 ${month + 1}月`;

  const gridBody = document.getElementById('calendar-grid-body');
  if (!gridBody) return;
  gridBody.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const events = getSavedEvents();
  const overrides = getSavedOverrides();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let dateCounter = 1;
  for (let i = 0; i < 6; i++) {
    let rowHtml = '<tr>';
    let hasDaysInRow = false;

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayIndex) {
        rowHtml += '<td style="padding: 12px 4px; border: 1px solid #cce0f5; background: #fafafa; height: 80px;"></td>';
      } else if (dateCounter > lastDay) {
        rowHtml += '<td style="padding: 12px 4px; border: 1px solid #cce0f5; background: #fafafa; height: 80px;"></td>';
      } else {
        hasDaysInRow = true;
        const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCounter).padStart(2, '0')}`;
        const isToday = (currentStr === todayStr);
        const holidayName = getNationalHoliday(year, month, dateCounter);
        const dayEvents = events.filter(e => e.date === currentStr);
        const dayOverride = overrides[currentStr];
        let eventsHtml = '';

        if (holidayName) {
          eventsHtml += `<div style="background: #fee2e2; color: #991b1b; padding: 2px 4px; border-radius: 3px; font-size: 0.7rem;">${holidayName}</div>`;
        }
        if (dayOverride) {
          eventsHtml += `<div style="background: #e2e8f0; color: #334155; padding: 2px 4px; border-radius: 3px; font-size: 0.7rem;">【時間割変更】</div>`;
        }
        dayEvents.forEach(ev => {
          const colors = getEventColorStyles(ev.color || 'blue');
          eventsHtml += `<div style="background: ${colors.bg}; color: ${colors.color}; padding: 2px 4px; border-radius: 3px; font-size: 0.7rem;">${ev.title}</div>`;
        });

        rowHtml += `
          <td style="padding: 6px 4px; border: 1px solid #cce0f5; height: 80px; vertical-align: top; text-align: left; background: ${isToday ? '#fff5f5' : '#fff'}; cursor: pointer;" class="js-cal-cell" data-date="${currentStr}">
            <div style="font-weight: bold; font-size: 0.85rem; color: ${j === 0 || holidayName ? '#e53e3e' : (j === 6 ? '#0066cc' : '#333')};">${dateCounter}</div>
            <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">${eventsHtml}</div>
          </td>
        `;
        dateCounter++;
      }
    }
    rowHtml += '</tr>';
    if (hasDaysInRow) gridBody.innerHTML += rowHtml;
    if (dateCounter > lastDay) break;
  }

  if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
}

function renderCalendarDayDetail(dateStr) {
  selectedCalendarDateStr = dateStr;
  const detailCard = document.getElementById('calendar-day-detail-card');
  const titleElem = document.getElementById('cal-detail-date-title');
  const listElem = document.getElementById('cal-detail-events-list');
  if (!detailCard || !titleElem || !listElem) return;

  detailCard.classList.remove('hidden');
  titleElem.textContent = `${dateStr} の詳細`;

  const events = getSavedEvents();
  const dayEvents = events.filter(e => e.date === dateStr);
  const holidayName = getNationalHoliday(...dateStr.split('-').map((v, i) => i === 1 ? parseInt(v, 10) - 1 : parseInt(v, 10)));
  const overrides = getSavedOverrides();
  const dayOverride = overrides[dateStr];

  let html = '';
  if (holidayName) {
    html += `<div style="background: #fee2e2; border: 1px solid #feb2b2; padding: 10px 14px; border-radius: 6px; font-weight: bold; color: #991b1b; font-size: 0.9rem;">【祝日】 ${holidayName}</div>`;
  }
  if (dayOverride) {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px;">
        <span style="font-weight: bold; color: #334155; font-size: 0.85rem;">【時間割変更設定あり】</span>
        <div style="display: flex; gap: 6px;">
          <button type="button" id="edit-override-btn" data-date="${dateStr}" class="btn btn-outline" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">編集</button>
          <button type="button" id="delete-override-btn" data-date="${dateStr}" class="btn btn-outline" style="width: auto; padding: 4px 8px; font-size: 0.75rem; color: #e53e3e; border-color: #f8b4b4;">削除</button>
        </div>
      </div>
    `;
  }

  if (dayEvents.length === 0 && !holidayName && !dayOverride) {
    listElem.innerHTML = `<p style="font-size: 0.85rem; color: #888;">この日の予定・変更は登録されていません。</p>`;
    return;
  }

  dayEvents.forEach((ev) => {
    let catLabel = ev.category === 'event' ? '行事' : (ev.category === 'holiday' ? '休日' : (ev.category === 'other' ? 'その他' : 'テスト'));
    const globalIndex = events.findIndex(item => item === ev);
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fbfe; border: 1px solid #e6f0fa; padding: 10px 14px; border-radius: 6px;">
        <div>
          <span style="font-weight: bold; color: #004080; font-size: 0.85rem; margin-right: 8px;">[${catLabel}]</span>
          <span style="color: #333; font-size: 0.9rem; font-weight: 600;">${ev.title}</span>
          ${ev.memo ? `<div style="font-size: 0.8rem; color: #666; margin-top: 2px;">メモ: ${ev.memo}</div>` : ''}
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn btn-outline js-edit-event" data-index="${globalIndex}" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">編集</button>
          <button type="button" class="btn btn-outline js-delete-event" data-index="${globalIndex}" style="width: auto; padding: 4px 8px; font-size: 0.75rem; color: #e53e3e; border-color: #f8b4b4;">削除</button>
        </div>
      </div>
    `;
  });
  listElem.innerHTML = html;
}

const prevMonthBtn = document.getElementById('cal-prev-month');
const nextMonthBtn = document.getElementById('cal-next-month');
if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(); });
if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(); });

const eventModal = document.getElementById('event-modal');
const closeEventModalBtn = document.getElementById('close-event-modal');
const saveEventBtn = document.getElementById('save-event-btn');
const eventErrorMsg = document.getElementById('event-error-msg');
const eventModalHeading = document.getElementById('event-modal-heading');
const eventDateGroupContainer = document.getElementById('event-date-group-container');

let editingEventIndex = null;
let isRangeMode = false;

const openAddEventModalBtn = document.getElementById('open-add-event-modal');
if (openAddEventModalBtn) {
  openAddEventModalBtn.addEventListener('click', () => {
    editingEventIndex = null;
    isRangeMode = true;
    if (eventModalHeading) eventModalHeading.textContent = "予定の追加（複数日選択）";
    if (eventDateGroupContainer) eventDateGroupContainer.classList.remove('hidden');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('event-start-date').value = todayStr;
    document.getElementById('event-end-date').value = todayStr;
    document.getElementById('event-title').value = '';
    document.getElementById('event-memo').value = '';
    eventErrorMsg.classList.add('hidden');
    eventModal.classList.remove('hidden');
  });
}

const calDetailAddEventBtn = document.getElementById('cal-detail-add-event-btn');
if (calDetailAddEventBtn) {
  calDetailAddEventBtn.addEventListener('click', () => {
    if (!selectedCalendarDateStr) return;
    editingEventIndex = null;
    isRangeMode = false;
    if (eventModalHeading) eventModalHeading.textContent = `予定の追加 (${selectedCalendarDateStr})`;
    if (eventDateGroupContainer) eventDateGroupContainer.classList.add('hidden');
    document.getElementById('event-title').value = '';
    document.getElementById('event-memo').value = '';
    eventErrorMsg.classList.add('hidden');
    eventModal.classList.remove('hidden');
  });
}

if (closeEventModalBtn) closeEventModalBtn.addEventListener('click', () => eventModal.classList.add('hidden'));

document.addEventListener('click', (e) => {
  const cell = e.target.closest('.js-cal-cell');
  if (cell) renderCalendarDayDetail(cell.getAttribute('data-date'));
});

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('js-delete-event')) {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    let events = getSavedEvents();
    events.splice(index, 1);
    await saveEvents(events);
    renderCalendar();
    if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
    renderHome();
  } else if (e.target.classList.contains('js-edit-event')) {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    let events = getSavedEvents();
    const ev = events[index];
    if (ev) {
      editingEventIndex = index;
      isRangeMode = false;
      if (eventModalHeading) eventModalHeading.textContent = "予定の編集";
      if (eventDateGroupContainer) eventDateGroupContainer.classList.add('hidden');
      document.getElementById('event-title').value = ev.title;
      document.getElementById('event-memo').value = ev.memo || '';
      document.getElementById('event-category').value = ev.category;
      document.getElementById('event-color').value = ev.color || 'blue';
      eventErrorMsg.classList.add('hidden');
      eventModal.classList.remove('hidden');
    }
  }
});

if (saveEventBtn) {
  saveEventBtn.addEventListener('click', async () => {
    const category = document.getElementById('event-category').value;
    const color = document.getElementById('event-color').value;
    const title = document.getElementById('event-title').value.trim();
    const memo = document.getElementById('event-memo').value.trim();
    let events = getSavedEvents();

    if (editingEventIndex !== null) {
      if (!title) {
        eventErrorMsg.textContent = "詳細（タイトル）を入力してください。";
        eventErrorMsg.classList.remove('hidden');
        return;
      }
      events[editingEventIndex] = { date: events[editingEventIndex].date, category, color, title, memo };
      editingEventIndex = null;
    } else {
      if (!title) {
        eventErrorMsg.textContent = "詳細（タイトル）を入力してください。";
        eventErrorMsg.classList.remove('hidden');
        return;
      }
      let datesToRegister = [];
      if (isRangeMode) {
        const startDate = document.getElementById('event-start-date').value;
        let endDate = document.getElementById('event-end-date').value || startDate;
        if (!startDate) {
          eventErrorMsg.textContent = "開始日を入力してください。";
          eventErrorMsg.classList.remove('hidden');
          return;
        }
        let curr = new Date(startDate);
        let last = new Date(endDate);
        while (curr <= last) {
          datesToRegister.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`);
          curr.setDate(curr.getDate() + 1);
        }
      } else {
        datesToRegister.push(selectedCalendarDateStr);
      }
      datesToRegister.forEach(dStr => events.push({ date: dStr, category, color, title, memo }));
    }

    await saveEvents(events);
    eventModal.classList.add('hidden');
    renderCalendar();
    if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
    renderHome();
  });
}

function getSavedOverrides() {
  return cloudDataCache.overrides;
}

async function saveOverrides(overrides) {
  cloudDataCache.overrides = overrides;
  await saveUserDataToCloud();
}

const overrideModal = document.getElementById('override-modal');
const closeOverrideModalBtn = document.getElementById('close-override-modal');
const saveOverrideBtn = document.getElementById('save-override-btn');
const overrideErrorMsg = document.getElementById('override-error-msg');
const overrideModalHeading = document.getElementById('override-modal-heading');
const overrideDateGroupContainer = document.getElementById('override-date-group-container');
const overrideMaxPeriodSelect = document.getElementById('override-max-period');

function renderOverridePeriodsList(maxP = 6, currentOverridePeriods = {}) {
  const container = document.getElementById('override-periods-list');
  if (!container) return;
  container.innerHTML = '';
  const subjects = getAllSubjects();

  for (let p = 1; p <= maxP; p++) {
    const val = currentOverridePeriods[`p_${p}`] || '';
    let options = `<option value="">(-- 通常通り --)</option>`;
    subjects.forEach(sub => {
      options += `<option value="${sub}" ${sub === val ? 'selected' : ''}>${sub}</option>`;
    });
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    row.innerHTML = `
      <span style="font-size: 0.8rem; font-weight: bold; color: #004080; min-width: 40px;">${p}限</span>
      <select data-period="${p}" class="override-period-select" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">${options}</select>
    `;
    container.appendChild(row);
  }
}

if (overrideMaxPeriodSelect) {
  overrideMaxPeriodSelect.addEventListener('change', () => {
    renderOverridePeriodsList(parseInt(overrideMaxPeriodSelect.value, 10) || 6, window.currentOverridePeriods || {});
  });
}

function openOverrideModalForDate(dateStr) {
  if (overrideModalHeading) overrideModalHeading.textContent = `時間割変更 (${dateStr})`;
  if (overrideDateGroupContainer) overrideDateGroupContainer.classList.add('hidden');
  const overrides = getSavedOverrides();
  const ov = overrides[dateStr] || { weekday: '', maxPeriod: '', periods: {} };
  document.getElementById('override-weekday').value = ov.weekday || '';
  document.getElementById('override-max-period').value = ov.maxPeriod || '';
  window.currentOverridePeriods = ov.periods || {};
  renderOverridePeriodsList(parseInt(ov.maxPeriod, 10) || 6, ov.periods || {});
  overrideErrorMsg.classList.add('hidden');
  overrideModal.classList.remove('hidden');
}

const calDetailAddOverrideBtn = document.getElementById('cal-detail-add-override-btn');
if (calDetailAddOverrideBtn) calDetailAddOverrideBtn.addEventListener('click', () => openOverrideModalForDate(selectedCalendarDateStr));

const openHomeTimetableOverrideBtn = document.getElementById('open-home-timetable-override-btn');
if (openHomeTimetableOverrideBtn) {
  openHomeTimetableOverrideBtn.addEventListener('click', () => {
    const now = new Date();
    openOverrideModalForDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  });
}

if (closeOverrideModalBtn) closeOverrideModalBtn.addEventListener('click', () => overrideModal.classList.add('hidden'));

document.addEventListener('click', async (e) => {
  if (e.target.id === 'edit-override-btn') {
    openOverrideModalForDate(e.target.getAttribute('data-date'));
  } else if (e.target.id === 'delete-override-btn') {
    const dateStr = e.target.getAttribute('data-date');
    if (confirm(`${dateStr} の時間割変更設定を削除しますか？`)) {
      let overrides = getSavedOverrides();
      delete overrides[dateStr];
      await saveOverrides(overrides);
      renderCalendar();
      if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
      renderHome();
    }
  }
});

if (saveOverrideBtn) {
  saveOverrideBtn.addEventListener('click', async () => {
    if (!selectedCalendarDateStr) return;
    const weekday = document.getElementById('override-weekday').value;
    const maxPeriod = document.getElementById('override-max-period').value;
    const periods = {};
    document.querySelectorAll('.override-period-select').forEach(sel => {
      if (sel.value) periods[`p_${sel.getAttribute('data-period')}`] = sel.value;
    });
    let overrides = getSavedOverrides();
    overrides[selectedCalendarDateStr] = { weekday, maxPeriod, periods };
    await saveOverrides(overrides);
    overrideModal.classList.add('hidden');
    renderCalendar();
    if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
    renderHome();
  });
}

function getSavedTimetableGroups() {
  return cloudDataCache.timetableGroups;
}

async function saveTimetableGroups(groups) {
  cloudDataCache.timetableGroups = groups;
  await saveUserDataToCloud();
}

function renderHome() {
  renderCourseGroups();
  renderTodayTimetable();
}

function renderTodayTimetable() {
  const container = document.getElementById('home-today-timetable-container');
  if (!container) return;
  container.innerHTML = '';

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let todayKey = dayKeys[now.getDay()];

  const settings = getSettings();
  let maxP = settings.maxPeriods || 6;
  const events = getSavedEvents();
  const todayEvents = events.filter(e => e.date === todayStr);
  const holidayName = getNationalHoliday(year, month, now.getDate());
  const overrides = getSavedOverrides();
  const dayOverride = overrides[todayStr];
  let overrideMap = {};

  if (dayOverride) {
    if (dayOverride.weekday) todayKey = dayOverride.weekday;
    if (dayOverride.maxPeriod) maxP = parseInt(dayOverride.maxPeriod, 10);
    if (dayOverride.periods) overrideMap = dayOverride.periods;
  }

  let listHtml = '';
  let hasContent = false;

  todayEvents.forEach(se => {
    let badgeBg = se.category === 'test' ? '#fee2e2' : (se.category === 'event' ? '#fef3c7' : '#d1fae5');
    let badgeColor = se.category === 'test' ? '#991b1b' : (se.category === 'event' ? '#92400e' : '#065f46');
    listHtml += `<div style="background: ${badgeBg}; color: ${badgeColor}; padding: 12px 16px; border-radius: 8px; font-weight: bold; margin-bottom: 4px;">【${se.category}】 ${se.title}</div>`;
    hasContent = true;
  });

  const ttGroups = getSavedTimetableGroups();
  const activeTtGroup = ttGroups.find(g => g.startDate && g.endDate && g.startDate <= todayStr && g.endDate >= todayStr);

  let hasClasses = false;
  if (activeTtGroup && activeTtGroup.grid) {
    for (let p = 1; p <= maxP; p++) {
      let subject = overrideMap[`p_${p}`] !== undefined ? overrideMap[`p_${p}`] : (activeTtGroup.grid[`${todayKey}_${p}`] || '');
      if (subject) {
        hasClasses = true;
        listHtml += `<div style="display: flex; align-items: center; background: #f8fbfe; border: 1px solid #e6f0fa; border-radius: 6px; padding: 10px 14px; margin-bottom: 4px;"><span style="font-weight: bold; color: #004080; min-width: 48px;">${p}限</span><span>${subject}</span></div>`;
      }
    }
  }

  if (!hasClasses && !hasContent && !holidayName) {
    container.innerHTML = `<div style="background-color: #fff5f5; color: #e53e3e; border: 1px solid #feb2b2; padding: 16px; border-radius: 8px; text-align: center; font-weight: bold;">本日は登録されていません。</div>`;
  } else {
    if (holidayName) listHtml = `<div style="background: #fee2e2; color: #991b1b; padding: 12px 16px; border-radius: 8px; font-weight: bold; margin-bottom: 4px;">【祝日】 ${holidayName}</div>` + listHtml;
    container.innerHTML = listHtml;
  }
}

const courseModal = document.getElementById('course-modal');
const openAddCourseModalBtn = document.getElementById('open-add-course-modal');
const closeCourseModalBtn = document.getElementById('close-course-modal');
const saveCourseGroupBtn = document.getElementById('save-course-group-btn');
const addSubjectInputBtn = document.getElementById('add-subject-input-btn');
const subjectInputsContainer = document.getElementById('subject-inputs-container');
const courseGroupsList = document.getElementById('course-groups-list');
const noCoursesMsg = document.getElementById('no-courses-msg');
const modalErrorMsg = document.getElementById('modal-error-msg');

if (openAddCourseModalBtn) {
  openAddCourseModalBtn.addEventListener('click', () => {
    document.getElementById('group-title').value = '';
    document.getElementById('group-start').value = '';
    document.getElementById('group-end').value = '';
    modalErrorMsg.classList.add('hidden');
    subjectInputsContainer.innerHTML = `<div style="display: flex; gap: 8px;"><input type="text" class="subject-input" placeholder="科目名を入力" style="flex: 1;"><button type="button" class="btn btn-outline js-remove-subject" style="width: auto; padding: 6px 10px; color: #e53e3e; border-color: #f8b4b4;">削除</button></div>`;
    courseModal.classList.remove('hidden');
  });
}
if (closeCourseModalBtn) closeCourseModalBtn.addEventListener('click', () => courseModal.classList.add('hidden'));

if (addSubjectInputBtn) {
  addSubjectInputBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 8px;';
    div.innerHTML = `<input type="text" class="subject-input" placeholder="科目名を入力" style="flex: 1;"><button type="button" class="btn btn-outline js-remove-subject" style="width: auto; padding: 6px 10px; color: #e53e3e; border-color: #f8b4b4;">削除</button>`;
    subjectInputsContainer.appendChild(div);
  });
}

if (subjectInputsContainer) {
  subjectInputsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-remove-subject')) {
      const row = e.target.closest('div');
      if (subjectInputsContainer.children.length > 1) row.remove();
      else row.querySelector('.subject-input').value = '';
    }
  });
}

function renderCourseGroups() {
  if (!courseGroupsList) return;
  const groups = getSavedCourseGroups();
  courseGroupsList.innerHTML = '';
  if (groups.length === 0) {
    courseGroupsList.appendChild(noCoursesMsg);
    noCoursesMsg.style.display = 'block';
    return;
  }
  noCoursesMsg.style.display = 'none';
  groups.forEach((group, index) => {
    const card = document.createElement('div');
    card.style.cssText = 'background: #f8fbfe; border: 1px solid #e6f0fa; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px;';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div><h4 style="font-size: 1rem; color: #004080; font-weight: bold;">${group.title}</h4><p style="font-size: 0.78rem; color: #6688aa;">期間: ${group.startDate} ～ ${group.endDate}</p></div>
        <button type="button" class="btn btn-outline js-delete-group" data-index="${index}" style="width: auto; padding: 4px 8px; font-size: 0.75rem; color: #e53e3e; border-color: #f8b4b4;">削除</button>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">${group.subjects.map(sub => `<span style="background: #ffffff; border: 1px solid #cce0f5; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: #004080;">${sub}</span>`).join('')}</div>
    `;
    courseGroupsList.appendChild(card);
  });
}

if (courseGroupsList) {
  courseGroupsList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('js-delete-group')) {
      let groups = getSavedCourseGroups();
      groups.splice(parseInt(e.target.getAttribute('data-index'), 10), 1);
      await saveCourseGroups(groups);
      renderCourseGroups();
    }
  });
}

if (saveCourseGroupBtn) {
  saveCourseGroupBtn.addEventListener('click', async () => {
    const title = document.getElementById('group-title').value.trim();
    const startDate = document.getElementById('group-start').value;
    const endDate = document.getElementById('group-end').value;
    const subjects = Array.from(document.querySelectorAll('.subject-input')).map(i => i.value.trim()).filter(Boolean);

    if (!title || !startDate || !endDate || subjects.length === 0) {
      modalErrorMsg.textContent = "すべての項目を入力してください。";
      modalErrorMsg.classList.remove('hidden');
      return;
    }
    modalErrorMsg.classList.add('hidden');
    let groups = getSavedCourseGroups();
    groups.push({ title, startDate, endDate, subjects });
    await saveCourseGroups(groups);
    courseModal.classList.add('hidden');
    renderCourseGroups();
  });
}

const timetableListCard = document.getElementById('timetable-list-card');
const timetableDisplayCard = document.getElementById('timetable-display-card');
const timetableGroupsContainer = document.getElementById('timetable-groups-container');
const noTimetableMsg = document.getElementById('no-timetable-msg');
const openAddTimetableModalBtn = document.getElementById('open-add-timetable-modal');
const timetableModal = document.getElementById('timetable-modal');
const cancelTimetableBtn = document.getElementById('cancel-timetable-btn');
const saveTimetableBtn = document.getElementById('save-timetable-btn');
const startEditTimetableBtn = document.getElementById('start-edit-timetable-btn');
const backToTtListBtn = document.getElementById('back-to-tt-list-btn');
const timetableHeaderRow = document.getElementById('timetable-header-row');
const timetableGridBody = document.getElementById('timetable-grid-body');
const timetableModalHeaderRow = document.getElementById('timetable-modal-header-row');
const timetableEditGridBody = document.getElementById('timetable-edit-grid-body');
const timetableEditError = document.getElementById('timetable-edit-error');
const ttModalHeading = document.getElementById('tt-modal-heading');
const ttActiveTitle = document.getElementById('tt-active-title');
const timetablePeriodLabel = document.getElementById('timetable-period-label');

let editingTimetableIndex = null;
let activeDisplayIndex = null;

function renderTimetableList() {
  if (!timetableGroupsContainer) return;
  const groups = getSavedTimetableGroups();
  timetableGroupsContainer.innerHTML = '';
  if (groups.length === 0) {
    timetableGroupsContainer.appendChild(noTimetableMsg);
    noTimetableMsg.style.display = 'block';
    return;
  }
  noTimetableMsg.style.display = 'none';
  groups.forEach((group, index) => {
    const card = document.createElement('div');
    card.style.cssText = 'background: #f8fbfe; border: 1px solid #e6f0fa; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center;';
    card.innerHTML = `
      <div><h4 style="font-size: 1rem; color: #004080; font-weight: bold;">${group.title}</h4><p style="font-size: 0.78rem; color: #6688aa;">適用期間: ${group.startDate} ～ ${group.endDate}</p></div>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn btn-primary js-view-tt" data-index="${index}" style="width: auto; padding: 6px 12px; font-size: 0.8rem;">表示</button>
        <button type="button" class="btn btn-outline js-edit-tt" data-index="${index}" style="width: auto; padding: 6px 12px; font-size: 0.8rem;">編集</button>
        <button type="button" class="btn btn-outline js-delete-tt" data-index="${index}" style="width: auto; padding: 6px 12px; font-size: 0.8rem; color: #e53e3e; border-color: #f8b4b4;">削除</button>
      </div>
    `;
    timetableGroupsContainer.appendChild(card);
  });
  if (timetableListCard) timetableListCard.classList.remove('hidden');
  if (timetableDisplayCard) timetableDisplayCard.classList.add('hidden');
}

if (timetableGroupsContainer) {
  timetableGroupsContainer.addEventListener('click', async (e) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    if (isNaN(index)) return;
    if (e.target.classList.contains('js-view-tt')) {
      activeDisplayIndex = index;
      renderTimetableDisplay(index);
    } else if (e.target.classList.contains('js-edit-tt')) {
      editingTimetableIndex = index;
      openTimetableModal(index);
    } else if (e.target.classList.contains('js-delete-tt')) {
      if (confirm("この時間割グループを削除しますか？")) {
        let groups = getSavedTimetableGroups();
        groups.splice(index, 1);
        await saveTimetableGroups(groups);
        renderTimetableList();
      }
    }
  });
}

if (openAddTimetableModalBtn) openAddTimetableModalBtn.addEventListener('click', () => { editingTimetableIndex = null; openTimetableModal(null); });

function openTimetableModal(index) {
  if (timetableEditError) timetableEditError.classList.add('hidden');
  const groups = getSavedTimetableGroups();
  let titleVal = '', startVal = '', endVal = '', currentGrid = {};
  if (index !== null && groups[index]) {
    if (ttModalHeading) ttModalHeading.textContent = "時間割の編集";
    titleVal = groups[index].title;
    startVal = groups[index].startDate;
    endVal = groups[index].endDate;
    currentGrid = groups[index].grid || {};
  } else {
    if (ttModalHeading) ttModalHeading.textContent = "時間割の作成";
  }
  document.getElementById('tt-modal-title').value = titleVal;
  document.getElementById('tt-start-date').value = startVal;
  document.getElementById('tt-end-date').value = endVal;
  renderTimetableModalGrid(startVal, endVal, currentGrid);
  if (timetableModal) timetableModal.classList.remove('hidden');
}

const ttStartDateElem = document.getElementById('tt-start-date');
const ttEndDateElem = document.getElementById('tt-end-date');
if (ttStartDateElem) ttStartDateElem.addEventListener('change', () => renderTimetableModalGrid(ttStartDateElem.value, ttEndDateElem.value, {}));
if (ttEndDateElem) ttEndDateElem.addEventListener('change', () => renderTimetableModalGrid(ttStartDateElem.value, ttEndDateElem.value, {}));

function renderTimetableModalGrid(startDate, endDate, currentGrid) {
  if (!timetableModalHeaderRow || !timetableEditGridBody) return;
  const settings = getSettings();
  const days = setActiveDays(settings);
  const maxP = settings.maxPeriods || 6;
  
  let headerHtml = `<th style="padding: 10px; border: 1px solid #cce0f5; width: 40px;">時限</th>`;
  days.forEach(d => { headerHtml += `<th style="padding: 10px; border: 1px solid #cce0f5;">${d.label}</th>`; });
  timetableModalHeaderRow.innerHTML = headerHtml;

  const groups = getSavedCourseGroups();
  let availableSubjects = [];
  groups.forEach(g => {
    if (!(g.endDate < startDate || g.startDate > endDate)) {
      if (g.subjects) availableSubjects = availableSubjects.concat(g.subjects);
    }
  });

  timetableEditGridBody.innerHTML = '';
  for (let p = 1; p <= maxP; p++) {
    const tr = document.createElement('tr');
    let html = `<td style="padding: 10px; border: 1px solid #cce0f5; background: #f8fbfe; font-weight: bold; color: #004080;">${p}</td>`;
    days.forEach(d => {
      const key = `${d.key}_${p}`;
      const currentVal = currentGrid[key] || '';
      let options = `<option value="">(-- 選択 --)</option>`;
      availableSubjects.forEach(sub => { options += `<option value="${sub}" ${sub === currentVal ? 'selected' : ''}>${sub}</option>`; });
      html += `<td style="padding: 6px; border: 1px solid #cce0f5;"><select data-key="${key}" class="tt-subject-select" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.8rem; background: #fff;">${options}</select></td>`;
    });
    tr.innerHTML = html;
    timetableEditGridBody.appendChild(tr);
  }
}

if (cancelTimetableBtn) cancelTimetableBtn.addEventListener('click', () => timetableModal.classList.add('hidden'));

if (saveTimetableBtn) {
  saveTimetableBtn.addEventListener('click', async () => {
    const title = document.getElementById('tt-modal-title').value.trim();
    const startDate = document.getElementById('tt-start-date').value;
    const endDate = document.getElementById('tt-end-date').value;
    if (!title || !startDate || !endDate) {
      timetableEditError.textContent = "タイトルと期間を入力してください。";
      timetableEditError.classList.remove('hidden');
      return;
    }
    const grid = {};
    document.querySelectorAll('.tt-subject-select').forEach(sel => { if (sel.value) grid[sel.getAttribute('data-key')] = sel.value; });
    let groups = getSavedTimetableGroups();
    const newGroup = { title, startDate, endDate, grid };
    if (editingTimetableIndex !== null) groups[editingTimetableIndex] = newGroup;
    else groups.push(newGroup);
    await saveTimetableGroups(groups);
    timetableModal.classList.add('hidden');
    renderTimetableList();
  });
}

function renderTimetableDisplay(index) {
  const groups = getSavedTimetableGroups();
  const group = groups[index];
  if (!group) return;
  if (ttActiveTitle) ttActiveTitle.textContent = group.title;
  if (timetablePeriodLabel) timetablePeriodLabel.textContent = `適用期間: ${group.startDate} ～ ${group.endDate}`;

  const settings = getSettings();
  const days = setActiveDays(settings);
  const maxP = settings.maxPeriods || 6;

  let headerHtml = `<th style="padding: 10px; border: 1px solid #cce0f5; width: 40px;">時限</th>`;
  days.forEach(d => { headerHtml += `<th style="padding: 10px; border: 1px solid #cce0f5;">${d.label}</th>`; });
  if (timetableHeaderRow) timetableHeaderRow.innerHTML = headerHtml;

  if (timetableGridBody) {
    timetableGridBody.innerHTML = '';
    for (let p = 1; p <= maxP; p++) {
      const tr = document.createElement('tr');
      let html = `<td style="padding: 10px; border: 1px solid #cce0f5; background: #f8fbfe; font-weight: bold; color: #004080;">${p}</td>`;
      days.forEach(d => {
        const sub = group.grid && group.grid[`${d.key}_${p}`] ? group.grid[`${d.key}_${p}`] : '';
        html += `<td style="padding: 10px; border: 1px solid #cce0f5; color: ${sub ? '#333' : '#aaa'};">${sub || '-'}</td>`;
      });
      tr.innerHTML = html;
      timetableGridBody.appendChild(tr);
    }
  }
  if (timetableListCard) timetableListCard.classList.add('hidden');
  if (timetableDisplayCard) timetableDisplayCard.classList.remove('hidden');
}

if (startEditTimetableBtn) startEditTimetableBtn.addEventListener('click', () => { if (activeDisplayIndex !== null) openTimetableModal(activeDisplayIndex); });
if (backToTtListBtn) backToTtListBtn.addEventListener('click', renderTimetableList);

function loadSettingsPanel(titleText) {
  const panel = document.getElementById('settings-dynamic-panel');
  if (!panel) return;
  if (titleText === '時間割設定') {
    const settings = getSettings();
    panel.innerHTML = `
      <h3 class="title-blue" style="font-size: 1.4rem; margin-bottom: 8px;">時間割設定</h3>
      <p class="sub-text" style="margin-bottom: 20px;">最大時限数や土日表示を設定します。</p>
      <div id="settings-success-msg" class="hidden" style="background-color: #e6f0fa; color: #0066cc; padding: 10px; border-radius: 6px; font-weight: bold; margin-bottom: 16px;">設定しました</div>
      <div class="form-group" style="margin-bottom: 16px;">
        <label>最大時限数</label>
        <select id="set-max-periods" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">
          ${Array.from({length: 10}, (_, i) => `<option value="${i+1}" ${settings.maxPeriods == (i+1) ? 'selected' : ''}>${i+1}時限</option>`).join('')}
        </select>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
        <label><input type="checkbox" id="set-show-sat" ${settings.showSat ? 'checked' : ''}> 土曜日を表示する</label>
        <label><input type="checkbox" id="set-show-sun" ${settings.showSun ? 'checked' : ''}> 日曜日を表示する</label>
      </div>
      <button type="button" id="save-settings-btn" class="btn btn-primary" style="max-width: 200px;">設定を保存</button>
    `;
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
      await saveSettings({
        maxPeriods: parseInt(document.getElementById('set-max-periods').value, 10),
        showSat: document.getElementById('set-show-sat').checked,
        showSun: document.getElementById('set-show-sun').checked
      });
      const msg = document.getElementById('settings-success-msg');
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 2000);
    });
  } else {
    panel.innerHTML = `<h3 class="title-blue" style="font-size: 1.4rem; margin-bottom: 8px;">${titleText}</h3><p class="sub-text">${titleText}は現在準備中です。</p>`;
  }
}

document.querySelectorAll('.js-settings-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.js-settings-item').forEach(el => el.classList.remove('active'));
    e.target.classList.add('active');
    loadSettingsPanel(e.target.getAttribute('data-title'));
  });
});

if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showCard(registerCard); });
if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });
document.querySelectorAll('.js-back-to-login').forEach(btn => btn.addEventListener('click', () => showCard(loginCard)));
document.querySelectorAll('.js-not-ready').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); showCard(notReadyCard); }));

document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.getAttribute('data-target'));
    if (input.type === 'password') { input.type = 'text'; button.textContent = '非表示'; }
    else { input.type = 'password'; button.textContent = '表示'; }
  });
});

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add('hidden');
    const { error } = await supabase.auth.signInWithPassword({
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    });
    if (error) {
      loginErrorMsg.textContent = "メールアドレスかパスワードが正しくありません。";
      loginErrorMsg.classList.remove('hidden');
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerErrorMsg.classList.add('hidden');
    const pwd = document.getElementById('register-password').value;
    const pwdConf = document.getElementById('register-password-confirm').value;
    if (pwd !== pwdConf) {
      registerErrorMsg.textContent = "パスワードが一致しません。";
      registerErrorMsg.classList.remove('hidden');
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: document.getElementById('register-email').value,
      password: pwd,
    });
    if (error) {
      registerErrorMsg.textContent = "アカウント作成に失敗しました: " + error.message;
      registerErrorMsg.classList.remove('hidden');
    } else {
      showCard(verifyCard);
    }
  });
}