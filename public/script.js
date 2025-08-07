const backendURL = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("anon-form");
  const messageInput = document.getElementById("message");
  const messagesList = document.getElementById("messages");

  // Log to confirm script loaded
  console.log("script.js loaded");

  // Load messages on page load
  loadMessages();

  // 🟢 Auto-refresh messages every 5 seconds
  setInterval(loadMessages, 5000);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    console.log("Posting message:", message);

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
      loadMessages(); // Reload immediately after post
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
      posts.forEach((post) => {
        const li = document.createElement("li");
        li.textContent = post.message;
        messagesList.appendChild(li);
      });
    } catch (error) {
      messagesList.innerHTML = "<li>Failed to load messages.</li>";
      console.error("Error loading messages:", error);
    }
  }
});
