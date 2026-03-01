const validUsername = "admin";
const validPassword = "1745#";
const validClientUsername = "imam";
const validClientPassword = "imam007#";

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    if (usernameInput === validUsername && passwordInput === validPassword) {
      sessionStorage.setItem("userRole", "admin");
      window.location.href = "./app/index.html";
    } else if (
      usernameInput === validClientUsername &&
      passwordInput === validClientPassword
    ) {
      sessionStorage.setItem("userRole", "imam");
      window.location.href = "./app/client.html";
    } else {
      alert("Incorrect username or password!");
      window.location.reload();
    }
  });
