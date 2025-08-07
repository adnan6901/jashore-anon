const backendURL = window.location.origin;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("anon-form");
  const messageInput = document.getElementById("message");
  const messagesList = document.getElementById("messages");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) {
      alert("Please enter a message.");
      return;
    }

    console.log("Posting message:", message);

    try {
      const response = await fetch(`${backendURL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      console.log("POST status:", response.status);
      const data = await response.json();
      console.log("POST response:", data);

      if (!response.ok) {
        alert(data.error || "Failed to post message");
        return;
      }

      messageInput.value = "";
      loadMessages();
    } catch (error) {
      console.error("Error posting message:", error);
      alert("Error posting message, try again later.");
    }
  });

  async function loadMessages() {
    try {
      const response = await fetch(`${backendURL}/api/posts`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const posts = await response.json();

      messagesList.innerHTML = "";
      posts.forEach((post) => {
        const li = document.createElement("li");
        li.textContent = post.message;
        messagesList.appendChild(li);
      });
      console.log(`Loaded ${posts.length} messages`);
    } catch (error) {
      console.error("Error loading messages:", error);
      messagesList.innerHTML = "<li>Failed to load messages.</li>";
    }
  }

  loadMessages();
});
