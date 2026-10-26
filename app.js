// Firebase SDK のインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
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
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const verifyCard = document.getElementById('verify-card');
const notReadyCard = document.getElementById('not-ready-card');

const loginErrorMsg = document.getElementById('login-error-msg');
const registerErrorMsg = document.getElementById('register-error-msg');

const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// 画面切り替え関数
function showCard(cardToShow) {
  loginCard.classList.add('hidden');
  registerCard.classList.add('hidden');
  verifyCard.classList.add('hidden');
  notReadyCard.classList.add('hidden');
  
  if (loginErrorMsg) loginErrorMsg.classList.add('hidden');
  if (registerErrorMsg) registerErrorMsg.classList.add('hidden');
  
  cardToShow.classList.remove('hidden');
}

// 画面遷移イベント
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

    alert(`ログインに成功しました！ ようこそ ${user.email} さん`);

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
    // 1. Firebase Authにユーザー作成
    console.log("ユーザー作成中...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. 認証メールの送信
    console.log("認証メールを送信中...");
    await sendEmailVerification(user);

    // 3. サインアウトして確認画面へ切り替え
    console.log("サインアウトして確認画面に切り替えます");
    await signOut(auth);
    showCard(verifyCard);

  } catch (error) {
    console.error("アカウント作成エラー詳細:", error);
    
    let errorMessage = "アカウント作成に失敗しました: " + error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "このメールアドレスは既に登録されています。";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "パスワードは6文字以上で指定してください。";
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = "Firebase Consoleでメール/パスワード認証が有効になっていません。";
    }
    
    registerErrorMsg.textContent = errorMessage;
    registerErrorMsg.classList.remove('hidden');
  }
});