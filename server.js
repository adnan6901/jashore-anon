const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend files

// MongoDB connection
const mongoURI = process.env.MONGO_URI || "your_mongodb_connection_string";
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & model
const postSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

// API routes

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// Add a new post
app.post("/api/posts", async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message)
    return res.status(400).json({ error: "Username and message are required." });

  try {
    const newPost = new Post({ username, message });
    await newPost.save();

    io.emit("new-post", newPost); // Realtime broadcast

    res.status(201).json({ message: "Post saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save post." });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO connection and events
io.on("connection", (socket) => {
  console.log("🔌 User connected");

  // When user logs in
  socket.on("user-login", (username) => {
    socket.username = username;
    io.emit("user-login", username);
  });

  // When user sends a chat message (optional, not used since messages go through API)
  socket.on("chat message", (msg) => {
    io.emit("chat message", { username: socket.username, text: msg });
  });

  // When user logs out
  socket.on("user-logout", (username) => {
    io.emit("user-logout", username);
  });

  // When user disconnects (browser/tab closed)
  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("user-logout", socket.username);
    }
    console.log("🔌 User disconnected");
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
