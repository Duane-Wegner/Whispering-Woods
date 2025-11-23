/**
 * Admin login/setup page wiring
 * Handles first-time password setup and subsequent sign-in using local hash.
 */
import { hasPassword, setPassword, login } from './auth.js';

const form = document.getElementById('login-form');
const msg = document.getElementById('msg');
const setupBtn = document.getElementById('setup');
const pwdInput = document.getElementById('password');

// First-time setup / password creation: stores a local hash in localStorage.
// Reminder: this is convenience-only. Use a server-backed auth for real apps.
setupBtn?.addEventListener('click', async (e) => {
  e.preventDefault();
  const pwd = prompt('Create admin password (min 4 chars):');
  if (!pwd || pwd.length < 4) return;
  await setPassword(pwd);
  msg.textContent = 'Password set. You can now log in.';
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ok = await login(pwdInput.value);
  if (ok) {
    location.href = './admin.html';
  } else {
    msg.textContent = 'Invalid password.';
  }
});
