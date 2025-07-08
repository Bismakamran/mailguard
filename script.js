// ---------- INDEX PAGE ----------
const scanBtn = document.getElementById("start-scan-btn");
if (scanBtn) {
  scanBtn.addEventListener("click", () => {
    const user = localStorage.getItem("user");
    const pass = localStorage.getItem("pass");
    const loggedIn = localStorage.getItem("loggedIn");

    if (!user || !pass) {
      alert("❗ No account found. Please sign up first.");
      window.location.href = "signup.html";
    } else if (loggedIn === "true") {
      window.location.href = "detector.html";
    } else {
      alert("🔒 Please login first to start scanning.");
      window.location.href = "login.html";
    }
  });
}

// ---------- SIGNUP PAGE ----------

const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const message = document.getElementById("signupMessage");

    if (username.length < 4) {
      message.innerText = "❌ Username must be at least 4 characters.";
      message.style.color = "red";
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      message.innerText = data.message;
      message.style.color = res.ok ? "green" : "red";

      if (res.ok) setTimeout(() => window.location.href = "login.html", 1500);
    } catch {
      message.innerText = "❗ Network error.";
      message.style.color = "red";
    }
  });
}

// ---------- LOGIN ----------
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("loginError");

    try {
      const res = await fetch('/api/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      error.innerText = data.message;
      error.style.color = res.ok ? "green" : "red";

      if (res.ok) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "detector.html";
      }
    } catch {
      error.innerText = "❗ Network error.";
      error.style.color = "red";
    }
  });
}

// ---------- DETECTOR ----------
if (window.location.pathname.includes("detector.html")) {
  window.addEventListener("DOMContentLoaded", () => {
    const checkBtn = document.getElementById("checkBtn");
    const emailInput = document.getElementById("emailInput");
    const urlInput = document.getElementById("urlInput");
    const fileElem = document.getElementById("fileElem");
    const result = document.getElementById("result");

    checkBtn.addEventListener("click", async () => {
      result.innerText = "";

      const url = urlInput.value.trim();
      const emailText = emailInput.value.trim();

      try {
        const res = await fetch('/api/detect', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailText, url })
        });
        const data = await res.json();
        result.innerText = data.result;
        result.style.color = data.result.includes("✅") ? "green" :
                             data.result.includes("⚠️") ? "orange" : "red";
      } catch {
        result.innerText = "❗ Detection failed.";
        result.style.color = "red";
      }
    });

    fileElem.addEventListener("change", () => {
      if (fileElem.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
          emailInput.value = e.target.result;
        };
        reader.readAsText(fileElem.files[0]);
      }
    });
  });
}
// Signup form submission handler
document.addEventListener('DOMContentLoaded', () => {
  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
      const username = document.getElementById('newUsername').value;
      const password = document.getElementById('newPassword').value;

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      document.getElementById('signupMessage').textContent = data.message;
    });
  }
});


