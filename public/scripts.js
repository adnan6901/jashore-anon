document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#anon-form");
  const messageInput = document.querySelector("#message");
  const messagesList = document.querySelector("#messages");

  // Submit post
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const result = await res.json();
      if (res.ok) {
        messageInput.value = "";
        loadMessages();
      } else {
        alert(result.error || "Error submitting message.");
      }
    } catch (err) {
      alert("Server error.");
    }
  });

  // Load posts
  async function loadMessages() {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();

      messagesList.innerHTML = "";
      data.forEach((post) => {
        const li = document.createElement("li");
        li.textContent = post.message;
        messagesList.appendChild(li);
      });
    } catch (err) {
      messagesList.innerHTML = "<li>Error loading posts.</li>";
    }
  }

  loadMessages();
});
