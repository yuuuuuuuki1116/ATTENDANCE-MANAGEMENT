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

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM要素の取得
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');

const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const verifyCard = document.getElementById('verify-card');
const notReadyCard = document.getElementById('not-ready-card');

// メインビュー
const homeView = document.getElementById('home-view');
const absenceView = document.getElementById('absence-view');
const statusView = document.getElementById('status-view');
const calendarView = document.getElementById('calendar-view');
const timetableView = document.getElementById('timetable-view');
const noticesView = document.getElementById('notices-view');
const settingsView = document.getElementById('settings-view');

const loginErrorMsg = document.getElementById('login-error-msg');
const registerErrorMsg = document.getElementById('register-error-msg');

const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const headerLogoutBtn = document.getElementById('header-logout-btn');

// ヘッダー・タスクバーのボタン
const settingsBtn = document.getElementById('settings-btn');
const noticesBtn = document.getElementById('notices-btn');

const tabHome = document.getElementById('tab-home');
const tabAbsence = document.getElementById('tab-absence');
const tabStatus = document.getElementById('tab-status');
const tabCalendar = document.getElementById('tab-calendar');
const tabTimetable = document.getElementById('tab-timetable');

// 画面切り替え関数（認証前）
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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await user.reload();
    if (user.emailVerified) {
      authContainer.classList.add('hidden');
      mainApp.classList.remove('hidden');
      showMainView('home');
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
  }
});

// メインアプリ内のビュー切り替え
function showMainView(viewName) {
  homeView.classList.add('hidden');
  absenceView.classList.add('hidden');
  statusView.classList.add('hidden');
  calendarView.classList.add('hidden');
  timetableView.classList.add('hidden');
  noticesView.classList.add('hidden');
  settingsView.classList.add('hidden');

  settingsBtn.classList.remove('active');
  noticesBtn.classList.remove('active');

  tabHome.classList.remove('active');
  tabAbsence.classList.remove('active');
  tabStatus.classList.remove('active');
  tabCalendar.classList.remove('active');
  tabTimetable.classList.remove('active');

  if (viewName === 'home') {
    homeView.classList.remove('hidden');
    tabHome.classList.add('active');
  } else if (viewName === 'absence') {
    absenceView.classList.remove('hidden');
    tabAbsence.classList.add('active');
  } else if (viewName === 'status') {
    statusView.classList.remove('hidden');
    tabStatus.classList.add('active');
  } else if (viewName === 'calendar') {
    calendarView.classList.remove('hidden');
    tabCalendar.classList.add('active');
  } else if (viewName === 'timetable') {
    timetableView.classList.remove('hidden');
    tabTimetable.classList.add('active');
  } else if (viewName === 'notices') {
    noticesView.classList.remove('hidden');
    noticesBtn.classList.add('active');
  } else if (viewName === 'settings') {
    settingsView.classList.remove('hidden');
    settingsBtn.classList.add('active');
  }
}

// イベントリスナー設定
tabHome.addEventListener('click', () => showMainView('home'));
tabAbsence.addEventListener('click', () => showMainView('absence'));
tabStatus.addEventListener('click', () => showMainView('status'));
tabCalendar.addEventListener('click', () => showMainView('calendar'));
tabTimetable.addEventListener('click', () => showMainView('timetable'));

noticesBtn.addEventListener('click', () => showMainView('notices'));
settingsBtn.addEventListener('click', () => showMainView('settings'));

const handleLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("ログアウトエラー:", error);
  }
};

logoutBtn.addEventListener('click', handleLogout);
headerLogoutBtn.addEventListener('click', handleLogout);

// 設定インデックス（左側メニュー）の各項目切り替え処理
document.querySelectorAll('.js-settings-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.js-settings-item').forEach(el => el.classList.remove('active'));
    e.target.classList.add('active');
    
    const titleText = e.target.getAttribute('data-title');
    const titleElem = document.getElementById('settings-content-title');
    const descElem = document.getElementById('settings-content-desc');

    if (titleElem && descElem) {
      titleElem.textContent = titleText;
      descElem.textContent = `${titleText}は現在準備中です。`;
    }
  });
});

// 認証前リンク
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  showCard(registerCard);
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  showCard(loginCard);
});

document.querySelectorAll('.js-back-to-login').forEach(button => {
  button.addEventListener('click', () => {
    showCard(loginCard);
  });
});

document.querySelectorAll('.js-not-ready').forEach(element => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    showCard(notReadyCard);
  });
});

// パスワード表示／非表示切り替え
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

// ログイン処理
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

// アカウント作成処理
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