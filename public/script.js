const backendURL = window.location.origin;
const socket = io(backendURL); // Connect to server

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("anon-form");
  const messageInput = document.getElementById("message");
  const messagesList = document.getElementById("messages");

  loadMessages();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    try {
      const response = await fetch(`${backendURL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
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
      const posts = await response.json();

      messagesList.innerHTML = "";
      posts.forEach((post) => {
        const li = document.createElement("li");
        li.textContent = post.message;
        messagesList.appendChild(li);
      });
    } catch (error) {
      messagesList.innerHTML = "<li>Failed to load messages.</li>";
    }
  }

  // Listen for new messages from other users in real-time
  socket.on("new-post", (data) => {
    const li = document.createElement("li");
    li.textContent = data.message;
    messagesList.prepend(li);
  });
});
