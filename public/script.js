const backendURL = window.location.origin;
const socket = io(backendURL);

const SHARED_PASSWORD = "secret123"; // Replace with your password

document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const chatContainer = document.getElementById("chat-container");
  const loginForm = document.getElementById("login-form");
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginError = document.getElementById("login-error");

  const form = document.getElementById("anon-form");
  const messageInput = document.getElementById("message");
  const messagesList = document.getElementById("messages");
  const logoutBtn = document.getElementById("logout-btn");

  let username = localStorage.getItem("anonUsername");

  // Format date as DD/MM/YYYY HH:MM
function formatDateTime(dateString) {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // convert hour '0' to '12'

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}
  if (username) {
    loginContainer.style.display = "none";
    chatContainer.style.display = "block";
    socket.emit("user-login", username);
    loadMessages();
  } else {
    loginContainer.style.display = "block";
    chatContainer.style.display = "none";
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const enteredUsername = loginUsernameInput.value.trim();
    const enteredPassword = loginPasswordInput.value;

    if (enteredPassword !== SHARED_PASSWORD) {
      loginError.textContent = "Incorrect password.";
      return;
    }
    if (!enteredUsername) {
      loginError.textContent = "Please enter a username.";
      return;
    }

    username = enteredUsername;
    localStorage.setItem("anonUsername", username);

    loginError.textContent = "";
    loginContainer.style.display = "none";
    chatContainer.style.display = "block";

    socket.emit("user-login", username);
    loadMessages();
  });

  logoutBtn.addEventListener("click", () => {
    socket.emit("user-logout", username);
    localStorage.removeItem("anonUsername");
    username = null;
    loginContainer.style.display = "block";
    chatContainer.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    try {
      const response = await fetch(`${backendURL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to post message.");
        return;
      }

      messageInput.value = "";
    } catch (error) {
      alert("Server error. Try again later.");
      console.error("Error posting message:", error);
    }
  });

  async function loadMessages() {
    try {
      const response = await fetch(`${backendURL}/api/posts`);
      if (!response.ok) throw new Error("Failed to fetch posts");

      const posts = await response.json();

      messagesList.innerHTML = "";
      posts.reverse().forEach((post) => {
        const li = document.createElement("li");
        if (post.type === "system") {
          li.textContent = `${post.message} (${formatDateTime(post.createdAt)})`;
          li.classList.add("system-message");
        } else {
          li.textContent = `${post.username}: ${post.message} (${formatDateTime(post.createdAt)})`;
        }
        messagesList.appendChild(li);
      });
      messagesList.scrollTop = messagesList.scrollHeight;
    } catch (error) {
      messagesList.innerHTML = "<li>Failed to load messages.</li>";
      console.error("Error loading messages:", error);
    }
  }

  // Real-time new chat post
  socket.on("new-post", (data) => {
    const li = document.createElement("li");
    li.textContent = `${data.username}: ${data.message} (${formatDateTime(data.createdAt)})`;
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
  });

  // Real-time system messages
  socket.on("system-message", (data) => {
    const li = document.createElement("li");
    li.textContent = `${data.message} (${formatDateTime(data.createdAt)})`;
    li.classList.add("system-message");
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
  });
});
