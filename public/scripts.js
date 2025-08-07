const backendURL = window.location.origin; // Same origin (Render serves frontend and backend together)

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("anon-form");
  const messageInput = document.getElementById("message");
  const messagesList = document.getElementById("messages");

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

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.error || "Failed to post message.");
        return;
      }

      messageInput.value = "";
      loadMessages();
    } catch (err) {
      alert("Server error.");
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
    } catch (err) {
      messagesList.innerHTML = "<li>Failed to load messages.</li>";
    }
  }

  loadMessages();
});
