// Default Timetable Initializer (1~7 Periods x Mon~Fri)
const DEFAULT_TIMETABLE = {
    mon: [
        { subject: '微分積分学', limit: 4 },
        { subject: 'プログラミング基礎', limit: 4 },
        { subject: '英語コミュニケーション', limit: 3 },
        { subject: '物理学実験', limit: 3 },
        { subject: '線形代数学', limit: 4 },
        { subject: '', limit: 4 },
        { subject: '', limit: 4 }
    ],
    tue: [
        { subject: 'データ構造とアルゴリズム', limit: 4 },
        { subject: '統計学入門', limit: 4 },
        { subject: 'ドイツ語初級', limit: 3 },
        { subject: '情報ネットワーク', limit: 4 },
        { subject: '体育実技', limit: 3 },
        { subject: '', limit: 4 },
        { subject: '', limit: 4 }
    ],
    wed: [
        { subject: '有機化学', limit: 4 },
        { subject: '英語コミュニケーション', limit: 3 },
        { subject: 'Webデザイン演習', limit: 4 },
        { subject: '離散数学', limit: 4 },
        { subject: 'キャリアデザイン', limit: 3 },
        { subject: '', limit: 4 },
        { subject: '', limit: 4 }
    ],
    thu: [
        { subject: 'データベース論', limit: 4 },
        { subject: '微分積分学', limit: 4 },
        { subject: 'オペレーティングシステム', limit: 4 },
        { subject: '認知心理学入門', limit: 4 },
        { subject: '情報倫理学', limit: 3 },
        { subject: '', limit: 4 },
        { subject: '', limit: 4 }
    ],
    fri: [
        { subject: '線形代数学', limit: 4 },
        { subject: 'ソフトウェア工学', limit: 4 },
        { subject: 'ドイツ語初級', limit: 3 },
        { subject: '人工知能概論', limit: 4 },
        { subject: 'ゼミナール', limit: 2 },
        { subject: '', limit: 4 },
        { subject: '', limit: 4 }
    ]
};

// App Global State
let timetable = JSON.parse(localStorage.getItem('att_timetable')) || DEFAULT_TIMETABLE;
let records = JSON.parse(localStorage.getItem('att_records')) || {};

let currentTargetDate = new Date().toISOString().split('T')[0];
let currentCalendarDate = new Date();
let selectedCalendarDate = currentTargetDate;

const DAYS_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
const DAYS_MAP = { mon: '月曜日', tue: '火曜日', wed: '水曜日', thu: '木曜日', fri: '金曜日', sat: '土曜日', sun: '日曜日' };

// DOM Loaded Init
document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initTabs();
    initDateSelector();
    
    renderTodayTab();
    renderCalendarTab();
    renderStatsTab();
    renderTimetableGrid();

    setupEventListeners();
});

// Clock Update
function initLiveClock() {
    const clockEl = document.getElementById('liveClock');
    function update() {
        const now = new Date();
        clockEl.textContent = now.toTimeString().split(' ')[0];
    }
    update();
    setInterval(update, 1000);
}

// Tab Navigation
function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.dataset.tab;

            navBtns.forEach(b => {
                b.classList.remove('text-white', 'font-bold');
                b.classList.add('text-slate-500');
            });
            btn.classList.remove('text-slate-500');
            btn.classList.add('text-white', 'font-bold');

            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });

            // Refresh Views
            if (targetTabId === 'tab-today') renderTodayTab();
            if (targetTabId === 'tab-calendar') renderCalendarTab();
            if (targetTabId === 'tab-stats') renderStatsTab();
            if (targetTabId === 'tab-timetable') renderTimetableGrid();
        });
    });
}

// Date Picker Init
function initDateSelector() {
    const dateInput = document.getElementById('selectTargetDate');
    dateInput.value = currentTargetDate;
    dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
            currentTargetDate = e.target.value;
            selectedCalendarDate = currentTargetDate;
            renderTodayTab();
        }
    });
}

// Get Active Day Key for a Given Date
function getActiveDayKey(dateStr) {
    const rec = records[dateStr];
    if (rec && rec.overrideDay && rec.overrideDay !== 'auto') {
        return rec.overrideDay;
    }
    const d = new Date(dateStr);
    const dayNum = d.getDay();
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return map[dayNum];
}

// Render Today Tab
function renderTodayTab() {
    const dObj = new Date(currentTargetDate);
    const dateStrFormatted = `${dObj.getFullYear()}.${String(dObj.getMonth() + 1).padStart(2, '0')}.${String(dObj.getDate()).padStart(2, '0')} ${['SUN','MON','TUE','WED','THU','FRI','SAT'][dObj.getDay()]}`;
    document.getElementById('currentDateStr').textContent = dateStrFormatted;

    const activeDayKey = getActiveDayKey(currentTargetDate);
    document.getElementById('todayDayBadge').textContent = DAYS_MAP[activeDayKey] || '休日';

    const daySelect = document.getElementById('selectTodayScheduleDay');
    daySelect.value = (records[currentTargetDate] && records[currentTargetDate].overrideDay) ? records[currentTargetDate].overrideDay : 'auto';

    const container = document.getElementById('todayClassesContainer');
    container.innerHTML = '';

    const daySubjects = timetable[activeDayKey] || [];
    if (activeDayKey === 'sat' || activeDayKey === 'sun' || daySubjects.length === 0) {
        container.innerHTML = `
            <div class="glass-panel rounded-xl p-8 text-center text-slate-500 text-xs">
                <i class="fa-solid fa-mug-hot text-2xl mb-2 text-slate-600 block"></i>
                本日は授業が登録されていないか休日です。
            </div>
        `;
        return;
    }

    const currentAbsences = (records[currentTargetDate] && records[currentTargetDate].absences) ? records[currentTargetDate].absences : [];

    daySubjects.forEach((subjObj, idx) => {
        const period = idx + 1;
        const subjectName = subjObj.subject || '（未登録）';
        const isAbsent = currentAbsences.some(a => a.period === period);
        const absRecord = currentAbsences.find(a => a.period === period);

        const card = document.createElement('div');
        card.className = `glass-panel-interactive rounded-xl p-3.5 flex items-center justify-between gap-3 border ${isAbsent ? 'border-rose-500/40 bg-rose-950/20' : 'border-white/5'}`;

        card.innerHTML = `
            <div class="flex items-center space-x-3.5 min-w-0">
                <div class="w-9 h-9 rounded-lg ${isAbsent ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-400 border border-white/5'} flex items-center justify-center font-bold text-xs shrink-0">
                    ${period}限
                </div>
                <div class="min-w-0">
                    <h4 class="font-bold text-xs ${isAbsent ? 'text-rose-200' : 'text-slate-200'} truncate">${subjectName}</h4>
                    <p class="text-[10px] text-slate-500 mt-0.5">
                        ${isAbsent ? `<span class="text-rose-400 font-semibold"><i class="fa-solid fa-circle-xmark"></i> 欠席記録あり ${absRecord && absRecord.note ? `(${absRecord.note})` : ''}</span>` : '<span class="text-emerald-400/80"><i class="fa-solid fa-circle-check"></i> 出席</span>'}
                    </p>
                </div>
            </div>
            <button class="toggle-absent-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition border shrink-0 ${isAbsent ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400/50' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'}" data-period="${period}" data-subject="${subjectName}">
                ${isAbsent ? '欠席解除' : '欠席にする'}
            </button>
        `;

        container.appendChild(card);
    });

    container.querySelectorAll('.toggle-absent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = parseInt(btn.dataset.period);
            const subj = btn.dataset.subject;
            toggleSingleAbsence(currentTargetDate, p, subj);
        });
    });
}

function toggleSingleAbsence(dateStr, period, subjectName, note = '') {
    if (!records[dateStr]) {
        records[dateStr] = { overrideDay: 'auto', absences: [] };
    }
    let list = records[dateStr].absences || [];
    const exists = list.some(a => a.period === period);

    if (exists) {
        list = list.filter(a => a.period !== period);
        showToast('欠席を解除しました', 'emerald');
    } else {
        list.push({ period, subject: subjectName, note: note });
        showToast('欠席を記録しました', 'rose');
    }

    records[dateStr].absences = list;
    saveRecords();
    renderTodayTab();
    renderCalendarTab();
    renderStatsTab();
}

function saveRecords() {
    localStorage.setItem('att_records', JSON.stringify(records));
}

function renderCalendarTab() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    document.getElementById('calendarMonthTitle').textContent = `${year}年${month + 1}月`;

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
        const empty = document.createElement('div');
        empty.className = 'h-11 rounded-lg bg-white/[0.01] border border-transparent';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement('div');
        
        const rec = records[dateKey];
        const absenceCount = (rec && rec.absences) ? rec.absences.length : 0;
        const isSelected = selectedCalendarDate === dateKey;
        const isToday = new Date().toISOString().split('T')[0] === dateKey;

        cell.className = `h-11 rounded-xl p-1 font-mono text-xs flex flex-col justify-between items-center cursor-pointer transition relative border ${
            isSelected ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/5 bg-noir-950/40 hover:bg-white/5'
        }`;

        cell.innerHTML = `
            <span class="${isToday ? 'font-bold text-indigo-400 underline decoration-2' : 'text-slate-300'} text-[11px]">${d}</span>
            ${absenceCount > 0 ? `
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ${absenceCount}欠
                </span>
            ` : '<span class="h-1"></span>'}
        `;

        cell.addEventListener('click', () => {
            selectedCalendarDate = dateKey;
            renderCalendarTab();
        });

        grid.appendChild(cell);
    }

    renderCalendarSelectedDateDetail();
}

function renderCalendarSelectedDateDetail() {
    const titleEl = document.getElementById('selectedDateTitle');
    const listEl = document.getElementById('selectedDateAbsenceList');

    if (!selectedCalendarDate) {
        titleEl.textContent = '日付を選択してください';
        listEl.innerHTML = '';
        return;
    }

    const dObj = new Date(selectedCalendarDate);
    const dateStrFormatted = `${dObj.getFullYear()}.${String(dObj.getMonth() + 1).padStart(2, '0')}.${String(dObj.getDate()).padStart(2, '0')} (${['日','月','火','水','木','金','土'][dObj.getDay()]})`;
    titleEl.textContent = `${dateStrFormatted} の記録`;

    const rec = records[selectedCalendarDate];
    const absences = (rec && rec.absences) ? rec.absences : [];

    listEl.innerHTML = '';

    if (absences.length === 0) {
        listEl.innerHTML = '<div class="text-slate-500 p-3 text-center bg-white/[0.02] rounded-xl">欠席記録はありません (全出席)</div>';
        return;
    }

    absences.forEach(abs => {
        const item = document.createElement('div');
        item.className = 'glass-panel-interactive p-3 rounded-xl flex items-center justify-between border border-white/5';
        item.innerHTML = `
            <div>
                <span class="font-bold text-rose-300 mr-2">[${abs.period}限]</span>
                <span class="font-medium text-slate-200">${abs.subject}</span>
                ${abs.note ? `<span class="text-[10px] text-slate-400 ml-2">(${abs.note})</span>` : ''}
            </div>
            <button class="text-slate-500 hover:text-rose-400 transition p-1" onclick="deleteCalendarAbsence('${selectedCalendarDate}', ${abs.period})">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        `;
        listEl.appendChild(item);
    });
}

window.deleteCalendarAbsence = function(dateStr, period) {
    if (records[dateStr] && records[dateStr].absences) {
        records[dateStr].absences = records[dateStr].absences.filter(a => a.period !== period);
        saveRecords();
        renderCalendarTab();
        renderTodayTab();
        renderStatsTab();
        showToast('欠席記録を削除しました', 'emerald');
    }
};

function renderStatsTab() {
    const subjectCounts = {};

    Object.values(timetable).forEach(dayList => {
        dayList.forEach(item => {
            if (item.subject) {
                if (!subjectCounts[item.subject]) {
                    subjectCounts[item.subject] = { count: 0, limit: item.limit || 4 };
                }
            }
        });
    });

    Object.values(records).forEach(rec => {
        if (rec.absences) {
            rec.absences.forEach(abs => {
                if (abs.subject) {
                    if (!subjectCounts[abs.subject]) {
                        subjectCounts[abs.subject] = { count: 0, limit: 4 };
                    }
                    subjectCounts[abs.subject].count++;
                }
            });
        }
    });

    const subjects = Object.keys(subjectCounts);
    document.getElementById('statTotalSubjects').textContent = subjects.length;

    let warningNum = 0;
    let dangerNum = 0;

    const container = document.getElementById('subjectStatsContainer');
    container.innerHTML = '';

    if (subjects.length === 0) {
        container.innerHTML = '<div class="glass-panel p-6 text-center text-slate-500 text-xs rounded-xl">時間割が登録されていません</div>';
        return;
    }

    subjects.forEach(subjectName => {
        const data = subjectCounts[subjectName];
        const count = data.count;
        const limit = data.limit;
        const remaining = limit - count;

        let statusBadge = '';
        if (remaining <= 0) {
            dangerNum++;
            statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">⚠️ 単位危険</span>';
        } else if (remaining === 1) {
            warningNum++;
            statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">⚡ 注意 (あと1回)</span>';
        } else {
            statusBadge = '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">安全</span>';
        }

        const card = document.createElement('div');
        card.className = 'glass-panel p-4 rounded-xl space-y-2 border border-white/5';
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <h4 class="font-bold text-sm text-slate-100">${subjectName}</h4>
                    ${statusBadge}
                </div>
                <div class="text-xs font-mono text-slate-400">
                    欠席: <span class="text-white font-bold text-sm">${count}</span> / ${limit} 回
                </div>
            </div>
            <div class="w-full h-2 bg-noir-950 rounded-full overflow-hidden border border-white/5">
                <div class="h-full ${count >= limit ? 'bg-rose-500' : count === limit - 1 ? 'bg-amber-400' : 'bg-indigo-500'} transition-all duration-300" style="width: ${Math.min(100, (count / limit) * 100)}%"></div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('statWarningSubjects').textContent = warningNum;
    document.getElementById('statDangerSubjects').textContent = dangerNum;
}

function renderTimetableGrid() {
    const tbody = document.getElementById('timetableGrid');
    tbody.innerHTML = '';

    for (let p = 1; p <= 7; p++) {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-white/5 hover:bg-white/[0.01] transition';

        let rowHtml = `<td class="p-2.5 font-mono text-slate-500 bg-white/[0.01] font-bold">${p}</td>`;

        DAYS_KEYS.forEach(dayKey => {
            const cellData = timetable[dayKey][p - 1] || { subject: '', limit: 4 };
            const name = cellData.subject;
            const limit = cellData.limit || 4;

            rowHtml += `
                <td class="p-1.5 cursor-pointer hover:bg-white/5 transition" onclick="openEditModal('${dayKey}', ${p - 1}, '${name}', ${limit})">
                    <div class="p-2 rounded-lg ${name ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200' : 'bg-noir-950/40 border border-white/5 text-slate-600'} min-h-[44px] flex flex-col justify-center items-center">
                        <span class="font-bold text-xs truncate max-w-[80px]">${name || '+ 登録'}</span>
                        ${name ? `<span class="text-[9px] opacity-60 mt-0.5">上限${limit}回</span>` : ''}
                    </div>
                </td>
            `;
        });

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    }
}

window.openEditModal = function(dayKey, periodIndex, currentName, currentLimit) {
    document.getElementById('editDay').value = dayKey;
    document.getElementById('editPeriod').value = periodIndex;
    document.getElementById('editSubjectName').value = currentName;
    document.getElementById('editLimit').value = currentLimit;

    document.getElementById('modalPeriodBadge').textContent = `${DAYS_MAP[dayKey]} ${periodIndex + 1}限`;
    document.getElementById('editModal').classList.remove('hidden');
};

function setupEventListeners() {
    document.getElementById('btnCancelEdit').addEventListener('click', () => {
        document.getElementById('editModal').classList.add('hidden');
    });
    document.getElementById('btnSaveEdit').addEventListener('click', () => {
        const dayKey = document.getElementById('editDay').value;
        const periodIndex = parseInt(document.getElementById('editPeriod').value);
        const name = document.getElementById('editSubjectName').value.trim();
        const limit = parseInt(document.getElementById('editLimit').value) || 4;

        timetable[dayKey][periodIndex] = { subject: name, limit: limit };
        localStorage.setItem('att_timetable', JSON.stringify(timetable));

        document.getElementById('editModal').classList.add('hidden');
        renderTimetableGrid();
        renderTodayTab();
        renderStatsTab();
        showToast('時間割を保存しました', 'emerald');
    });

    document.getElementById('btnQuickAbsentAll').addEventListener('click', () => {
        const activeDayKey = getActiveDayKey(currentTargetDate);
        const daySubjects = timetable[activeDayKey] || [];

        if (!records[currentTargetDate]) {
            records[currentTargetDate] = { overrideDay: 'auto', absences: [] };
        }

        const newAbsences = [];
        daySubjects.forEach((subjObj, idx) => {
            if (subjObj.subject) {
                newAbsences.push({ period: idx + 1, subject: subjObj.subject, note: '全休' });
            }
        });

        records[currentTargetDate].absences = newAbsences;
        saveRecords();
        renderTodayTab();
        renderCalendarTab();
        renderStatsTab();
        showToast('本日を全休として一括記録しました', 'rose');
    });

    document.getElementById('btnQuickReset').addEventListener('click', () => {
        if (records[currentTargetDate]) {
            records[currentTargetDate].absences = [];
            saveRecords();
            renderTodayTab();
            renderCalendarTab();
            renderStatsTab();
            showToast('本日の記録をクリアしました', 'emerald');
        }
    });

    document.getElementById('selectTodayScheduleDay').addEventListener('change', (e) => {
        if (!records[currentTargetDate]) {
            records[currentTargetDate] = { overrideDay: 'auto', absences: [] };
        }
        records[currentTargetDate].overrideDay = e.target.value;
        saveRecords();
        renderTodayTab();
        showToast('曜日振替を反映しました', 'emerald');
    });

    document.getElementById('selectLateStartPeriod').addEventListener('change', (e) => {
        const startP = parseInt(e.target.value);
        if (startP <= 0) return;

        const activeDayKey = getActiveDayKey(currentTargetDate);
        const daySubjects = timetable[activeDayKey] || [];

        if (!records[currentTargetDate]) {
            records[currentTargetDate] = { overrideDay: 'auto', absences: [] };
        }

        let currentAbs = records[currentTargetDate].absences || [];
        currentAbs = currentAbs.filter(a => a.note !== '遅刻');

        for (let p = 1; p < startP; p++) {
            const subj = daySubjects[p - 1] ? daySubjects[p - 1].subject : '';
            if (subj && !currentAbs.some(a => a.period === p)) {
                currentAbs.push({ period: p, subject: subj, note: '遅刻' });
            }
        }

        records[currentTargetDate].absences = currentAbs;
        saveRecords();
        renderTodayTab();
        renderCalendarTab();
        renderStatsTab();
        showToast(`${startP}限からの遅刻を反映しました`, 'amber');
    });

    document.getElementById('selectEarlyStartPeriod').addEventListener('change', (e) => {
        const earlyP = parseInt(e.target.value);
        if (earlyP <= 0) return;

        const activeDayKey = getActiveDayKey(currentTargetDate);
        const daySubjects = timetable[activeDayKey] || [];

        if (!records[currentTargetDate]) {
            records[currentTargetDate] = { overrideDay: 'auto', absences: [] };
        }

        let currentAbs = records[currentTargetDate].absences || [];
        currentAbs = currentAbs.filter(a => a.note !== '早退');

        for (let p = earlyP; p <= 7; p++) {
            const subj = daySubjects[p - 1] ? daySubjects[p - 1].subject : '';
            if (subj && !currentAbs.some(a => a.period === p)) {
                currentAbs.push({ period: p, subject: subj, note: '早退' });
            }
        }

        records[currentTargetDate].absences = currentAbs;
        saveRecords();
        renderTodayTab();
        renderCalendar})}