// Import service yang dibutuhkan
import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Fungsi khusus untuk handle registrasi
function handleRegister() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageEl = document.getElementById("message");

  // Validasi sederhana
  if (password.length < 6) {
    messageEl.innerText = "Password minimal harus 6 karakter.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      messageEl.style.color = 'green';
      messageEl.innerText = "Akun berhasil dibuat! Silakan pindah ke halaman login.";
    })
    .catch(err => {
      messageEl.style.color = 'red';
      messageEl.innerText = err.message;
    });
}

// Pasang fungsi ke window agar bisa dipanggil dari HTML onclick
window.handleRegister = handleRegister;