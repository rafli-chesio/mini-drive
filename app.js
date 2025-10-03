import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Fungsi login dengan sintaks v9
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "drive.html";
    })
    .catch(err => {
      document.getElementById("message").innerText = err.message;
    });
}

// Fungsi register dengan sintaks v9
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      document.getElementById("message").innerText = "Akun berhasil dibuat! Silakan login.";
    })
    .catch(err => {
      document.getElementById("message").innerText = err.message;
    });
}

// Pasang fungsi ke window agar bisa dipanggil dari HTML onclick
window.login = login;
window.register = register;