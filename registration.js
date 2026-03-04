import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVTHWPjNPIQmSuuYDMn2ubE01xN79f7Ig",
  authDomain: "infini-box.firebaseapp.com",
  projectId: "infini-box",
  storageBucket: "infini-box.firebasestorage.app",
  messagingSenderId: "868144770126",
  appId: "1:868144770126:web:30ddd62044764de242271f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  try {
    await signInWithEmailAndPassword(auth, email, password);

    if (email === "admin@hams.com") {
      sessionStorage.setItem("userType", "admin-hams");
      window.location.href = "/hams/app/index.html";
    }
    else if (email === "rakesh@hams.com") {
      sessionStorage.setItem("userType", "client-hams");
      window.location.href = "/hams/app/client.html";
    }
    else if (email === "admin@epic.com") {
      sessionStorage.setItem("userType", "admin-epic");
      window.location.href = "/epic/app/index.html";
    }
    else if (email === "imam@epic.com") {
      sessionStorage.setItem("userType", "client-epic");
      window.location.href = "/epic/app/client.html";
    }
    else {
      errorBox.innerText = "No role assigned to this user";
    }

  } catch (err) {
    errorBox.innerText = "Invalid email or password";
    document.getElementById("password").value = "";
  }
});