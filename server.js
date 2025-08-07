const backendURL = window.location.origin; // Using same origin

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("anon-form");
  const messageInput = document.getElementById("message");
  const messagesList = document.getElementById("messages");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    console.log("Submitting message:", message);

    try {
      const response = await fetch(`${backendURL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        alert(data.error || "Failed to post message.");
        return;
      }

      messageInput.value = "";
      loadMessages();
    } catch (err) {
      console.error("Error submitting message:", err);
      alert("Server error while submitting.");
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
      console.error("Error loading messages:", err);
      messagesList.innerHTML = "<li>Failed to load messages.</li>";
    }
  }

  loadMessages();
});
