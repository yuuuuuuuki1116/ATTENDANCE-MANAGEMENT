// Firebase SDK のインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCsFlLuPnVucgKB8lTODkuWjWv-HPkF8QQ",
  authDomain: "attendance-management-5b044.firebaseapp.com",
  projectId: "attendance-management-5b044",
  storageBucket: "attendance-management-5b044.firebasestorage.app",
  messagingSenderId: "727524236821",
  appId: "1:727524236821:web:1d0411101f18bda0cc781c",
  measurementId: "G-VB4C8Z2W1V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

// ==========================================
// 10分間無操作の自動ログアウト
// ==========================================
let idleTimeout = null;
const IDLE_TIME_LIMIT = 10 * 60 * 1000;

function resetIdleTimer() {
  if (auth.currentUser && !mainApp.classList.contains('hidden')) {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(async () => {
      try {
        await signOut(auth);
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await user.reload();
    if (user.emailVerified) {
      authContainer.classList.add('hidden');
      mainApp.classList.remove('hidden');
      showMainView('home');
      resetIdleTimer();
      renderHome();
    } else {
      await signOut(auth);
      mainApp.classList.add('hidden');
      authContainer.classList.remove('hidden');
      showCard(loginCard);
    }
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

const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("ログアウトエラー:", error);
  }
};
headerLogoutBtn.addEventListener('click', handleLogout);

// ==========================================
// 設定管理
// ==========================================
function getSettings() {
  const user = auth.currentUser;
  if (!user) return { maxPeriods: 6, showSat: false, showSun: false };
  const data = localStorage.getItem(`settings_${user.uid}`);
  return data ? JSON.parse(data) : { maxPeriods: 6, showSat: false, showSun: false };
}

function saveSettings(settings) {
  const user = auth.currentUser;
  if (!user) return;
  localStorage.setItem(`settings_${user.uid}`, JSON.stringify(settings));
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

// ==========================================
// 履修科目データ管理
// ==========================================
function getSavedCourseGroups() {
  const user = auth.currentUser;
  if (!user) return [];
  const data = localStorage.getItem(`course_groups_${user.uid}`);
  return data ? JSON.parse(data) : [];
}

function saveCourseGroups(groups) {
  const user = auth.currentUser;
  if (!user) return;
  localStorage.setItem(`course_groups_${user.uid}`, JSON.stringify(groups));
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

// ==========================================
// カレンダー機能・祝日判定・予定管理
// ==========================================
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

  if (fixedHolidays[dateStr]) return fixedHolidays[dateStr];

  if (month === 2 && day === 20) return "春分の日";
  if (month === 8 && day === 21) return "敬老の日";
  if (month === 8 && day === 22) return "国民の休日";
  if (month === 8 && day === 23) return "秋分の日";
  if (month === 4 && day === 6) return "振替休日";

  const d = new Date(year, month, day);
  const weekday = d.getDay();
  const weekNum = Math.ceil(day / 7);

  if (month === 0 && weekday === 1 && weekNum === 2) return "成人の日";
  if (month === 6 && weekday === 1 && weekNum === 3) return "海の日";
  if (month === 8 && weekday === 1 && weekNum === 3) return "敬老の日";
  if (month === 9 && weekday === 1 && weekNum === 2) return "スポーツの日";

  return null;
}

function getSavedEvents() {
  const user = auth.currentUser;
  if (!user) return [];
  const data = localStorage.getItem(`events_${user.uid}`);
  return data ? JSON.parse(data) : [];
}

function saveEvents(events) {
  const user = auth.currentUser;
  if (!user) return;
  localStorage.setItem(`events_${user.uid}`, JSON.stringify(events));
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
  if (titleElem) {
    titleElem.textContent = `${year}年 ${month + 1}月`;
  }

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
        rowHtml += '<td style="padding: 12px 4px; border: 1px solid #cce0f5; background: #fafafa; height: 80px; vertical-align: top; width: 14.28%;"></td>';
      } else if (dateCounter > lastDay) {
        rowHtml += '<td style="padding: 12px 4px; border: 1px solid #cce0f5; background: #fafafa; height: 80px; vertical-align: top; width: 14.28%;"></td>';
      } else {
        hasDaysInRow = true;
        const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCounter).padStart(2, '0')}`;
        const isToday = (currentStr === todayStr);
        const holidayName = getNationalHoliday(year, month, dateCounter);

        const dayEvents = events.filter(e => e.date === currentStr);
        const dayOverride = overrides[currentStr];
        let eventsHtml = '';

        if (holidayName) {
          eventsHtml += `<div style="background: #fee2e2; color: #991b1b; padding: 2px 4px; border-radius: 3px; font-size: 0.7rem; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${holidayName}">${holidayName}</div>`;
        }

        if (dayOverride) {
          eventsHtml += `<div style="background: #e2e8f0; color: #334155; padding: 2px 4px; border-radius: 3px; font-size: 0.7rem; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="時間割変更あり">【時間割変更】</div>`;
        }

        dayEvents.forEach(ev => {
          const colors = getEventColorStyles(ev.color || 'blue');
          eventsHtml += `<div style="background: ${colors.bg}; color: ${colors.color}; padding: 2px 4px; border-radius: 3px; font-size: 0.7rem; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ev.title}">${ev.title}</div>`;
        });

        const cellBg = isToday ? '#fff5f5' : '#fff';

        rowHtml += `
          <td style="padding: 6px 4px; border: 1px solid #cce0f5; height: 80px; vertical-align: top; text-align: left; background: ${cellBg}; cursor: pointer; width: 14.28%; overflow: hidden;" class="js-cal-cell" data-date="${currentStr}">
            <div style="font-weight: bold; font-size: 0.85rem; color: ${j === 0 || holidayName ? '#e53e3e' : (j === 6 ? '#0066cc' : '#333')};">${dateCounter}</div>
            <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px; overflow: hidden;">${eventsHtml}</div>
          </td>
        `;
        dateCounter++;
      }
    }
    rowHtml += '</tr>';
    if (hasDaysInRow) {
      gridBody.innerHTML += rowHtml;
    }
    if (dateCounter > lastDay) break;
  }

  if (selectedCalendarDateStr) {
    renderCalendarDayDetail(selectedCalendarDateStr);
  }
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
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #fee2e2; border: 1px solid #feb2b2; padding: 10px 14px; border-radius: 6px;">
        <span style="font-weight: bold; color: #991b1b; font-size: 0.9rem;">【祝日】 ${holidayName}</span>
      </div>
    `;
  }

  if (dayOverride) {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px;">
        <div>
          <span style="font-weight: bold; color: #334155; font-size: 0.85rem;">【時間割変更設定あり】</span>
        </div>
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
    let catLabel = 'テスト';
    if (ev.category === 'event') catLabel = '行事';
    else if (ev.category === 'holiday') catLabel = '休日';
    else if (ev.category === 'other') catLabel = 'その他';

    const globalIndex = events.findIndex(item => item === ev);
    const memoHtml = ev.memo ? `<div style="font-size: 0.8rem; color: #666; margin-top: 2px;">メモ: ${ev.memo}</div>` : '';

    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fbfe; border: 1px solid #e6f0fa; padding: 10px 14px; border-radius: 6px;">
        <div>
          <div>
            <span style="font-weight: bold; color: #004080; font-size: 0.85rem; margin-right: 8px;">[${catLabel}]</span>
            <span style="color: #333; font-size: 0.9rem; font-weight: 600;">${ev.title}</span>
          </div>
          ${memoHtml}
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
if (prevMonthBtn) {
  prevMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  });
}
if (nextMonthBtn) {
  nextMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  });
}

// ==========================================
// 予定追加・編集機能
// ==========================================
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
    document.getElementById('event-category').value = 'test';
    document.getElementById('event-color').value = 'blue';

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
    document.getElementById('event-category').value = 'test';
    document.getElementById('event-color').value = 'blue';

    eventErrorMsg.classList.add('hidden');
    eventModal.classList.remove('hidden');
  });
}

if (closeEventModalBtn) {
  closeEventModalBtn.addEventListener('click', () => {
    eventModal.classList.add('hidden');
  });
}

document.addEventListener('click', (e) => {
  const cell = e.target.closest('.js-cal-cell');
  if (cell) {
    const dateStr = cell.getAttribute('data-date');
    renderCalendarDayDetail(dateStr);
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('js-delete-event')) {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    let events = getSavedEvents();
    events.splice(index, 1);
    saveEvents(events);
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
  saveEventBtn.addEventListener('click', () => {
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
      eventErrorMsg.classList.add('hidden');

      const targetDate = events[editingEventIndex].date;
      events[editingEventIndex] = {
        date: targetDate,
        category,
        color,
        title,
        memo
      };
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
        let endDate = document.getElementById('event-end-date').value;
        if (!startDate) {
          eventErrorMsg.textContent = "開始日を入力してください。";
          eventErrorMsg.classList.remove('hidden');
          return;
        }
        if (!endDate) endDate = startDate;
        if (startDate > endDate) {
          eventErrorMsg.textContent = "終了日は開始日以降の日付を指定してください。";
          eventErrorMsg.classList.remove('hidden');
          return;
        }

        let curr = new Date(startDate);
        let last = new Date(endDate);
        while (curr <= last) {
          const y = curr.getFullYear();
          const m = String(curr.getMonth() + 1).padStart(2, '0');
          const d = String(curr.getDate()).padStart(2, '0');
          datesToRegister.push(`${y}-${m}-${d}`);
          curr.setDate(curr.getDate() + 1);
        }
      } else {
        if (!selectedCalendarDateStr) {
          eventErrorMsg.textContent = "対象日が選択されていません。";
          eventErrorMsg.classList.remove('hidden');
          return;
        }
        datesToRegister.push(selectedCalendarDateStr);
      }

      eventErrorMsg.classList.add('hidden');

      datesToRegister.forEach(dStr => {
        events.push({
          date: dStr,
          category,
          color,
          title,
          memo
        });
      });
    }

    saveEvents(events);
    eventModal.classList.add('hidden');
    renderCalendar();
    if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
    renderHome();
  });
}

// ==========================================
// 時間割変更機能（独立）
// ==========================================
function getSavedOverrides() {
  const user = auth.currentUser;
  if (!user) return {};
  const data = localStorage.getItem(`overrides_${user.uid}`);
  return data ? JSON.parse(data) : {};
}

function saveOverrides(overrides) {
  const user = auth.currentUser;
  if (!user) return;
  localStorage.setItem(`overrides_${user.uid}`, JSON.stringify(overrides));
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
      const sel = (sub === val) ? 'selected' : '';
      options += `<option value="${sub}" ${sel}>${sub}</option>`;
    });

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    row.innerHTML = `
      <span style="font-size: 0.8rem; font-weight: bold; color: #004080; min-width: 40px;">${p}限</span>
      <select data-period="${p}" class="override-period-select" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 6px; font-size: 0.85rem; background: #fff;">
        ${options}
      </select>
    `;
    container.appendChild(row);
  }
}

if (overrideMaxPeriodSelect) {
  overrideMaxPeriodSelect.addEventListener('change', () => {
    const maxP = parseInt(overrideMaxPeriodSelect.value, 10) || 6;
    renderOverridePeriodsList(maxP, window.currentOverridePeriods || {});
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
if (calDetailAddOverrideBtn) {
  calDetailAddOverrideBtn.addEventListener('click', () => {
    if (!selectedCalendarDateStr) return;
    openOverrideModalForDate(selectedCalendarDateStr);
  });
}

const openHomeTimetableOverrideBtn = document.getElementById('open-home-timetable-override-btn');
if (openHomeTimetableOverrideBtn) {
  openHomeTimetableOverrideBtn.addEventListener('click', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    openOverrideModalForDate(todayStr);
  });
}

if (closeOverrideModalBtn) {
  closeOverrideModalBtn.addEventListener('click', () => {
    overrideModal.classList.add('hidden');
  });
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'edit-override-btn') {
    const dateStr = e.target.getAttribute('data-date');
    openOverrideModalForDate(dateStr);
  } else if (e.target.id === 'delete-override-btn') {
    const dateStr = e.target.getAttribute('data-date');
    if (confirm(`${dateStr} の時間割変更設定を削除しますか？`)) {
      let overrides = getSavedOverrides();
      delete overrides[dateStr];
      saveOverrides(overrides);
      renderCalendar();
      if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
      renderHome();
    }
  }
});

if (saveOverrideBtn) {
  saveOverrideBtn.addEventListener('click', () => {
    const dateStr = selectedCalendarDateStr;
    if (!dateStr) {
      overrideErrorMsg.textContent = "対象日が選択されていません。";
      overrideErrorMsg.classList.remove('hidden');
      return;
    }
    overrideErrorMsg.classList.add('hidden');

    const weekday = document.getElementById('override-weekday').value;
    const maxPeriod = document.getElementById('override-max-period').value;
    const periods = {};
    document.querySelectorAll('.override-period-select').forEach(sel => {
      const p = sel.getAttribute('data-period');
      if (sel.value) {
        periods[`p_${p}`] = sel.value;
      }
    });

    let overrides = getSavedOverrides();
    overrides[dateStr] = { weekday, maxPeriod, periods };
    saveOverrides(overrides);

    overrideModal.classList.add('hidden');
    renderCalendar();
    if (selectedCalendarDateStr) renderCalendarDayDetail(selectedCalendarDateStr);
    renderHome();
  });
}

// ==========================================
// 時間割グループデータ管理
// ==========================================
function getSavedTimetableGroups() {
  const user = auth.currentUser;
  if (!user) return [];
  const data = localStorage.getItem(`timetable_groups_${user.uid}`);
  return data ? JSON.parse(data) : [];
}

function saveTimetableGroups(groups) {
  const user = auth.currentUser;
  if (!user) return;
  localStorage.setItem(`timetable_groups_${user.uid}`, JSON.stringify(groups));
}

// ==========================================
// ホーム画面描画
// ==========================================
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
  const monthStr = String(month + 1).padStart(2, '0');
  const dayStr = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${monthStr}-${dayStr}`;

  const dayIndex = now.getDay();
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let todayKey = dayKeys[dayIndex];

  const settings = getSettings();
  let maxP = settings.maxPeriods || 6;

  const renderUnregisteredMessage = (text) => {
    container.innerHTML = `
      <div style="background-color: #fff5f5; color: #e53e3e; border: 1px solid #feb2b2; padding: 16px; border-radius: 8px; text-align: center; font-size: 0.9rem; font-weight: bold;">
        ${text}
      </div>
    `;
  };

  const events = getSavedEvents();
  const todayEvents = events.filter(e => e.date === todayStr);

  const holidayName = getNationalHoliday(year, month, now.getDate());
  const otherEvents = todayEvents.filter(e => e.category === 'other');
  const specialEvents = todayEvents.filter(e => ['test', 'event', 'holiday'].includes(e.category));

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

  specialEvents.forEach(se => {
    let badgeBg = '#e6f0fa';
    let badgeColor = '#004080';
    let categoryName = '予定';
    if (se.category === 'test') { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; categoryName = 'テスト'; }
    else if (se.category === 'event') { badgeBg = '#fef3c7'; badgeColor = '#92400e'; categoryName = '行事'; }
    else if (se.category === 'holiday') { badgeBg = '#d1fae5'; badgeColor = '#065f46'; categoryName = '休日'; }

    const memoSub = se.memo ? `<div style="font-size: 0.78rem; font-weight: normal; margin-top: 2px; opacity: 0.9;">メモ: ${se.memo}</div>` : '';
    listHtml += `
      <div style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}33; padding: 12px 16px; border-radius: 8px; font-weight: bold; font-size: 0.95rem; margin-bottom: 4px;">
        <div>【${categoryName}】 ${se.title}</div>
        ${memoSub}
      </div>
    `;
    hasContent = true;
  });

  otherEvents.forEach(otherEvent => {
    const memoSub = otherEvent.memo ? `<div style="font-size: 0.78rem; font-weight: normal; margin-top: 2px; opacity: 0.9;">メモ: ${otherEvent.memo}</div>` : '';
    listHtml += `
      <div style="background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; border-radius: 8px; padding: 12px 16px; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: bold; font-size: 0.85rem;">本日の予定</span>
          <span style="font-size: 0.95rem; font-weight: 600;">${otherEvent.title}</span>
        </div>
        ${memoSub}
      </div>
    `;
    hasContent = true;
  });

  if (holidayName && specialEvents.length === 0 && otherEvents.length === 0 && !dayOverride) {
    renderUnregisteredMessage("本日は登録されていません。");
    return;
  }

  const ttGroups = getSavedTimetableGroups();
  const activeTtGroup = ttGroups.find(g => g.startDate && g.endDate && g.startDate <= todayStr && g.endDate >= todayStr);

  let hasClasses = false;
  if (activeTtGroup && activeTtGroup.grid) {
    for (let p = 1; p <= maxP; p++) {
      let subject = overrideMap[`p_${p}`] !== undefined ? overrideMap[`p_${p}`] : (activeTtGroup.grid[`${todayKey}_${p}`] || '');

      if (subject) {
        hasClasses = true;
        listHtml += `
          <div style="display: flex; align-items: center; background: #f8fbfe; border: 1px solid #e6f0fa; border-radius: 6px; padding: 10px 14px; margin-bottom: 4px;">
            <span style="font-weight: bold; color: #004080; min-width: 48px; font-size: 0.9rem;">${p}限</span>
            <span style="color: #333333; font-size: 0.95rem; font-weight: 500;">${subject}</span>
          </div>
        `;
      }
    }
  }

  if (!hasClasses && !hasContent) {
    renderUnregisteredMessage("本日は登録されていません。");
  } else {
    container.innerHTML = listHtml;
  }
}

// ==========================================
// 履修科目登録機能
// ==========================================
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
    modalErrorMsg.textContent = '';
    subjectInputsContainer.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <input type="text" class="subject-input" placeholder="科目名を入力 (例: 線形代数I)" style="flex: 1;">
        <button type="button" class="btn btn-outline js-remove-subject" style="width: auto; padding: 6px 10px; color: #e53e3e; border-color: #f8b4b4;">削除</button>
      </div>
    `;
    courseModal.classList.remove('hidden');
  });
}

if (closeCourseModalBtn) {
  closeCourseModalBtn.addEventListener('click', () => courseModal.classList.add('hidden'));
}

if (addSubjectInputBtn) {
  addSubjectInputBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.innerHTML = `
      <input type="text" class="subject-input" placeholder="科目名を入力" style="flex: 1;">
      <button type="button" class="btn btn-outline js-remove-subject" style="width: auto; padding: 6px 10px; color: #e53e3e; border-color: #f8b4b4;">削除</button>
    `;
    subjectInputsContainer.appendChild(div);
  });
}

if (subjectInputsContainer) {
  subjectInputsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-remove-subject')) {
      const row = e.target.closest('div');
      if (subjectInputsContainer.children.length > 1) {
        row.remove();
      } else {
        row.querySelector('.subject-input').value = '';
      }
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
    
    const subjectsHtml = group.subjects.map(sub => `<span style="background: #ffffff; border: 1px solid #cce0f5; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; color: #004080;">${sub}</span>`).join('');

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h4 style="font-size: 1rem; color: #004080; font-weight: bold; margin-bottom: 2px;">${group.title}</h4>
          <p style="font-size: 0.78rem; color: #6688aa;">期間: ${group.startDate} ～ ${group.endDate}</p>
        </div>
        <button type="button" class="btn btn-outline js-delete-group" data-index="${index}" style="width: auto; padding: 4px 8px; font-size: 0.75rem; color: #e53e3e; border-color: #f8b4b4;">削除</button>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
        ${subjectsHtml}
      </div>
    `;
    courseGroupsList.appendChild(card);
  });
}

if (courseGroupsList) {
  courseGroupsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-delete-group')) {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      let groups = getSavedCourseGroups();
      groups.splice(index, 1);
      saveCourseGroups(groups);
      renderCourseGroups();
    }
  });
}

if (saveCourseGroupBtn) {
  saveCourseGroupBtn.addEventListener('click', () => {
    const title = document.getElementById('group-title').value.trim();
    const startDate = document.getElementById('group-start').value;
    const endDate = document.getElementById('group-end').value;
    
    const subjectInputs = document.querySelectorAll('.subject-input');
    const subjects = [];
    subjectInputs.forEach(input => {
      const val = input.value.trim();
      if (val) subjects.push(val);
    });

    if (!title || !startDate || !endDate || subjects.length === 0) {
      modalErrorMsg.textContent = "まとめのタイトル、開始日、終了日、および少なくとも1つの科目名をすべて入力してください。";
      modalErrorMsg.classList.remove('hidden');
      return;
    }

    modalErrorMsg.classList.add('hidden');

    const newGroup = { title, startDate, endDate, subjects };
    const groups = getSavedCourseGroups();
    groups.push(newGroup);
    saveCourseGroups(groups);

    courseModal.classList.add('hidden');
    renderCourseGroups();
  });
}

// ==========================================
// 時間割機能
// ==========================================
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

function getSubjectsForDateRange(ttStart, ttEnd) {
  const groups = getSavedCourseGroups();
  let availableSubjects = [];
  
  groups.forEach(g => {
    if (!(g.endDate < ttStart || g.startDate > ttEnd)) {
      if (g.subjects && Array.isArray(g.subjects)) {
        availableSubjects = availableSubjects.concat(g.subjects);
      }
    }
  });
  return [...new Set(availableSubjects)];
}

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
      <div>
        <h4 style="font-size: 1rem; color: #004080; font-weight: bold; margin-bottom: 2px;">${group.title}</h4>
        <p style="font-size: 0.78rem; color: #6688aa;">適用期間: ${group.startDate || '未設定'} ～ ${group.endDate || '未設定'}</p>
      </div>
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
  timetableGroupsContainer.addEventListener('click', (e) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    if (isNaN(index)) return;

    if (e.target.classList.contains('js-view-tt')) {
      activeDisplayIndex = index;
      renderTimetableDisplay(index);
    } else if (e.target.classList.contains('js-edit-tt')) {
      editingTimetableIndex = index;
      openTimetableModal(index);
    } else if (e.target.classList.contains('js-delete-tt')) {
      if (confirm("この時間割グループを削除してもよろしいですか？")) {
        let groups = getSavedTimetableGroups();
        groups.splice(index, 1);
        saveTimetableGroups(groups);
        renderTimetableList();
      }
    }
  });
}

if (openAddTimetableModalBtn) {
  openAddTimetableModalBtn.addEventListener('click', () => {
    editingTimetableIndex = null;
    openTimetableModal(null);
  });
}

function openTimetableModal(index) {
  if (timetableEditError) timetableEditError.classList.add('hidden');
  const groups = getSavedTimetableGroups();
  
  let titleVal = '';
  let startVal = '';
  let endVal = '';
  let currentGrid = {};

  if (index !== null && groups[index]) {
    if (ttModalHeading) ttModalHeading.textContent = "時間割の編集";
    titleVal = groups[index].title;
    startVal = groups[index].startDate;
    endVal = groups[index].endDate;
    currentGrid = groups[index].grid || {};
  } else {
    if (ttModalHeading) ttModalHeading.textContent = "時間割の作成";
  }

  const titleInput = document.getElementById('tt-modal-title');
  const startInput = document.getElementById('tt-start-date');
  const endInput = document.getElementById('tt-end-date');

  if (titleInput) titleInput.value = titleVal;
  if (startInput) startInput.value = startVal;
  if (endInput) endInput.value = endVal;

  renderTimetableModalGrid(startVal, endVal, currentGrid);
  if (timetableModal) timetableModal.classList.remove('hidden');
}

const ttStartDateElem = document.getElementById('tt-start-date');
const ttEndDateElem = document.getElementById('tt-end-date');
if (ttStartDateElem) ttStartDateElem.addEventListener('change', updateModalSelectors);
if (ttEndDateElem) ttEndDateElem.addEventListener('change', updateModalSelectors);

function updateModalSelectors() {
  const startVal = document.getElementById('tt-start-date').value;
  const endVal = document.getElementById('tt-end-date').value;
  const groups = getSavedTimetableGroups();
  let currentGrid = {};
  if (editingTimetableIndex !== null && groups[editingTimetableIndex]) {
    currentGrid = groups[editingTimetableIndex].grid || {};
  }
  renderTimetableModalGrid(startVal, endVal, currentGrid);
}

function renderTimetableModalGrid(startDate, endDate, currentGrid) {
  if (!timetableModalHeaderRow || !timetableEditGridBody) return;
  const settings = getSettings();
  const days = setActiveDays(settings);
  const maxP = settings.maxPeriods || 6;
  let periods = [];
  for(let i=1; i<=maxP; i++) periods.push(i);

  let headerHtml = `<th style="padding: 10px; border: 1px solid #cce0f5; width: 40px;">時限</th>`;
  days.forEach(d => {
    headerHtml += `<th style="padding: 10px; border: 1px solid #cce0f5;">${d.label}</th>`;
  });
  timetableModalHeaderRow.innerHTML = headerHtml;

  const availableSubjects = (startDate && endDate) ? getSubjectsForDateRange(startDate, endDate) : [];

  timetableEditGridBody.innerHTML = '';
  periods.forEach(period => {
    const tr = document.createElement('tr');
    let html = `<td style="padding: 10px; border: 1px solid #cce0f5; background: #f8fbfe; font-weight: bold; color: #004080;">${period}</td>`;
    
    days.forEach(d => {
      const key = `${d.key}_${period}`;
      const currentVal = currentGrid[key] ? currentGrid[key] : '';
      
      let options = `<option value="">(-- 選択 --)</option>`;
      availableSubjects.forEach(sub => {
        const selected = (sub === currentVal) ? 'selected' : '';
        options += `<option value="${sub}" ${selected}>${sub}</option>`;
      });
      if (currentVal && !availableSubjects.includes(currentVal)) {
        options += `<option value="${currentVal}" selected>${currentVal} (期間外)</option>`;
      }

      html += `<td style="padding: 6px; border: 1px solid #cce0f5;">
        <select data-key="${key}" class="tt-subject-select" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.8rem; background: #fff;">
          ${options}
        </select>
      </td>`;
    });
    tr.innerHTML = html;
    timetableEditGridBody.appendChild(tr);
  });
}

if (cancelTimetableBtn) {
  cancelTimetableBtn.addEventListener('click', () => {
    if (timetableModal) timetableModal.classList.add('hidden');
  });
}

if (saveTimetableBtn) {
  saveTimetableBtn.addEventListener('click', () => {
    const title = document.getElementById('tt-modal-title').value.trim();
    const startDate = document.getElementById('tt-start-date').value;
    const endDate = document.getElementById('tt-end-date').value;

    if (!title || !startDate || !endDate) {
      timetableEditError.textContent = "タイトル、適用開始日、および終了日をすべて入力してください。";
      timetableEditError.classList.remove('hidden');
      return;
    }

    const grid = {};
    document.querySelectorAll('.tt-subject-select').forEach(select => {
      const key = select.getAttribute('data-key');
      const val = select.value;
      if (val) {
        grid[key] = val;
      }
    });

    let groups = getSavedTimetableGroups();
    const newGroup = { title, startDate, endDate, grid };

    if (editingTimetableIndex !== null) {
      groups[editingTimetableIndex] = newGroup;
    } else {
      groups.push(newGroup);
    }

    saveTimetableGroups(groups);
    if (timetableModal) timetableModal.classList.add('hidden');
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
  let periods = [];
  for(let i=1; i<=maxP; i++) periods.push(i);

  let headerHtml = `<th style="padding: 10px; border: 1px solid #cce0f5; width: 40px;">時限</th>`;
  days.forEach(d => {
    headerHtml += `<th style="padding: 10px; border: 1px solid #cce0f5;">${d.label}</th>`;
  });
  if (timetableHeaderRow) timetableHeaderRow.innerHTML = headerHtml;

  if (timetableGridBody) {
    timetableGridBody.innerHTML = '';
    periods.forEach(period => {
      const tr = document.createElement('tr');
      let html = `<td style="padding: 10px; border: 1px solid #cce0f5; background: #f8fbfe; font-weight: bold; color: #004080;">${period}</td>`;
      
      days.forEach(d => {
        const subject = group.grid && group.grid[`${d.key}_${period}`] ? group.grid[`${d.key}_${period}`] : '';
        html += `<td style="padding: 10px; border: 1px solid #cce0f5; height: 40px; color: ${subject ? '#333' : '#aaa'};">${subject || '-'}</td>`;
      });
      tr.innerHTML = html;
      timetableGridBody.appendChild(tr);
    });
  }

  if (timetableListCard) timetableListCard.classList.add('hidden');
  if (timetableDisplayCard) timetableDisplayCard.classList.remove('hidden');
}

if (startEditTimetableBtn) {
  startEditTimetableBtn.addEventListener('click', () => {
    if (activeDisplayIndex !== null) {
      editingTimetableIndex = activeDisplayIndex;
      openTimetableModal(activeDisplayIndex);
    }
  });
}

if (backToTtListBtn) {
  backToTtListBtn.addEventListener('click', () => {
    renderTimetableList();
  });
}

// ==========================================
// 設定画面
// ==========================================
function loadSettingsPanel(titleText) {
  const panel = document.getElementById('settings-dynamic-panel');
  if (!panel) return;

  if (titleText === '時間割設定') {
    const settings = getSettings();
    
    let periodOptions = '';
    for(let i=1; i<=10; i++) {
      const selected = (settings.maxPeriods == i) ? 'selected' : '';
      periodOptions += `<option value="${i}" ${selected}>${i}時限</option>`;
    }

    panel.innerHTML = `
      <h3 class="title-blue" style="font-size: 1.4rem; margin-bottom: 8px;">時間割設定</h3>
      <p class="sub-text" style="margin-bottom: 20px;">1日の最大時限数（1〜10限）や土曜日・日曜日の表示切り替えを行います。</p>
      
      <div id="settings-success-msg" class="hidden" style="background-color: #e6f0fa; color: #0066cc; border: 1px solid #cce0f5; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: bold; margin-bottom: 16px; transition: opacity 0.3s ease;">
        設定しました
      </div>

      <div class="form-group" style="margin-bottom: 16px;">
        <label for="set-max-periods">最大時限数</label>
        <select id="set-max-periods" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff;">
          ${periodOptions}
        </select>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="set-show-sat" ${settings.showSat ? 'checked' : ''} style="width: 16px; height: 16px;"> 土曜日を表示する
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
          <input type="checkbox" id="set-show-sun" ${settings.showSun ? 'checked' : ''} style="width: 16px; height: 16px;"> 日曜日を表示する
        </label>
      </div>

      <button type="button" id="save-settings-btn" class="btn btn-primary" style="max-width: 200px;">設定を保存</button>
    `;

    document.getElementById('save-settings-btn').addEventListener('click', () => {
      const maxPeriods = parseInt(document.getElementById('set-max-periods').value, 10);
      const showSat = document.getElementById('set-show-sat').checked;
      const showSun = document.getElementById('set-show-sun').checked;

      saveSettings({ maxPeriods, showSat, showSun });

      const successMsg = document.getElementById('settings-success-msg');
      if (successMsg) {
        successMsg.classList.remove('hidden');
        successMsg.style.opacity = '1';
        setTimeout(() => {
          successMsg.style.opacity = '0';
          setTimeout(() => {
            successMsg.classList.add('hidden');
            successMsg.style.opacity = '1';
          }, 300);
        }, 2000);
      }
    });

  } else {
    panel.innerHTML = `
      <h3 id="settings-content-title" class="title-blue" style="font-size: 1.4rem; margin-bottom: 8px;">${titleText}</h3>
      <p id="settings-content-desc" class="sub-text">${titleText}は現在準備中です。</p>
    `;
  }
}

document.querySelectorAll('.js-settings-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.js-settings-item').forEach(el => el.classList.remove('active'));
    e.target.classList.add('active');
    loadSettingsPanel(e.target.getAttribute('data-title'));
  });
});

// 認証・リンク管理
if (showRegisterLink) {
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showCard(registerCard);
  });
}
if (showLoginLink) {
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showCard(loginCard);
  });
}
document.querySelectorAll('.js-back-to-login').forEach(button => {
  button.addEventListener('click', () => showCard(loginCard));
});
document.querySelectorAll('.js-not-ready').forEach(element => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    showCard(notReadyCard);
  });
});

document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '非表示';
    } else {
      input.type = 'password';
      button.textContent = '表示';
    }
  });
});

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add('hidden');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        loginErrorMsg.textContent = "メール認証が完了していません。受信メールのURLを開いて認証を完了させてください。";
        loginErrorMsg.classList.remove('hidden');
        return;
      }
    } catch (error) {
      console.error("ログインエラー:", error);
      loginErrorMsg.textContent = "メールアドレスかパスワードが正しくないか、アカウントが無効になっています。";
      loginErrorMsg.classList.remove('hidden');
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerErrorMsg.classList.add('hidden');
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    if (password !== passwordConfirm) {
      registerForm.querySelector('input[id="register-password-confirm"]').focus();
      registerErrorMsg.textContent = "パスワードと確認用パスワードが一致しません。";
      registerErrorMsg.classList.remove('hidden');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await signOut(auth);
      showCard(verifyCard);
    } catch (error) {
      console.error("アカウント作成エラー詳細:", error);
      let errorMessage = "アカウント作成に失敗しました: " + error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "このメールアドレスは既に登録されています。";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "パスワードは6文字以上で指定してください。";
      }
      registerErrorMsg.textContent = errorMessage;
      registerErrorMsg.classList.remove('hidden');
    }
  });
}