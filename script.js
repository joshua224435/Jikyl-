// ===== FIREBASE INIT =====
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== DOM ELEMENTS =====
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');
const telegramConnect = document.getElementById('telegram-connect');
const userAvatar = document.getElementById('user-avatar');
const usernameEl = document.getElementById('username');
const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');

// ===== THEME TOGGLE =====
let isDarkMode = localStorage.getItem('theme') === 'dark';

function setTheme() {
  document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  setTheme();
});

// ===== AUTH FUNCTIONS =====
// Switch between login/signup
switchToSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'flex';
});

switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.style.display = 'none';
  loginForm.style.display = 'flex';
});

// Signup
signupBtn.addEventListener('click', async () => {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const username = document.getElementById('signup-username').value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: username });
    usernameEl.textContent = username;
    authModal.style.display = 'none';
  } catch (error) {
    alert(error.message);
  }
});

// Login
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    usernameEl.textContent = userCredential.user.displayName || "User";
    authModal.style.display = 'none';
  } catch (error) {
    alert(error.message);
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    usernameEl.textContent = user.displayName || "User";
    authModal.style.display = 'none';
  } else {
    authModal.style.display = 'flex';
  }
});

// ===== TELEGRAM INTEGRATION =====
telegramConnect.addEventListener('click', () => {
  window.Telegram.Login.auth({ bot_id: 'YOUR_BOT_ID' }, (user) => {
    if (user) {
      usernameEl.textContent = user.first_name;
      userAvatar.src = user.photo_url || 'assets/user.png';
    }
  });
});

// ===== CHAT FUNCTIONS =====
function sendMessage() {
  const message = messageInput.value.trim();
  if (message === '') return;

  db.collection('messages').add({
    text: message,
    sender: usernameEl.textContent,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Real-time messages
db.collection('messages')
  .orderBy('timestamp')
  .onSnapshot((snapshot) => {
    chatArea.innerHTML = '';
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const messageElement = document.createElement('div');
      messageElement.className = 'message-card';
      messageElement.innerHTML = `
        <div class="message-header">
          <span class="sender">${msg.sender}</span>
          <span class="time">${msg.timestamp?.toDate().toLocaleTimeString() || 'Now'}</span>
        </div>
        <div class="message-content">${msg.text}</div>
      `;
      chatArea.appendChild(messageElement);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
  });

// ===== EMOJI PICKER =====
emojiBtn.addEventListener('click', () => {
  // Implement with https://emoji-picker-react.vercel.app/
  alert('Emoji picker would open here!');
});

// ===== INIT =====
setTheme();
