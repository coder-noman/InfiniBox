// Simple authentication for TV compatibility
document.getElementById("login-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Check credentials
  if (username === "admin" && password === "1745#") {
    // Store authentication data
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", "admin-hams");
    localStorage.setItem("username", username);

    // Redirect to admin page
    window.location.href = "./hams/app/index.html";
  }
  else if (username === "rakesh" && password === "rakesh007#") {
    // Store authentication data
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", "client-hams");
    localStorage.setItem("username", username);

    // Redirect to client page
    window.location.href = "./hams/app/client.html";
  }
  else if (username === "admin" && password === "1745") {
    // Store authentication data
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", "admin-epic");
    localStorage.setItem("username", username);

    // Redirect to admin page
    window.location.href = "./epic/app/index.html";
  }
  else if (username === "imam" && password === "imam007#") {
    // Store authentication data
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", "client-epic");
    localStorage.setItem("username", username);

    // Redirect to client page
    window.location.href = "./epic/app/client.html";
  }
  else {
    alert("Incorrect username or password!");
    // Clear password field (TV friendly)
    document.getElementById("password").value = "";
    document.getElementById("password").focus();
  }
});

// TV Remote Navigation Support
document.addEventListener('DOMContentLoaded', function () {
  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');
  const loginButton = document.querySelector('input[type="submit"]');

  // Auto-focus username field for TV
  setTimeout(() => usernameField.focus(), 100);

  // Handle Enter key navigation for TV remote
  usernameField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordField.focus();
    }
  });

  passwordField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      loginButton.focus();
      setTimeout(() => {
        document.getElementById("login-form").dispatchEvent(new Event('submit'));
      }, 100);
    }
  });

  // Make login button TV-friendly
  loginButton.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById("login-form").dispatchEvent(new Event('submit'));
    }
  });
});