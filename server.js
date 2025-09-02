require('dotenv').config();
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
app.use(express.static("public"));

// MongoDB connection
const mongoURI = process.env.MONGO_URI || "your_mongodb_connection_string";
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema and model: message can be normal or system type
const postSchema = new mongoose.Schema(
  {
    username: { type: String }, // optional for system messages
    message: { type: String, required: true },
    type: { type: String, enum: ["chat", "system"], default: "chat" },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

// API routes

// Get all posts (chat + system), sorted newest first
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// Add a new chat post
app.post("/api/posts", async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message)
    return res.status(400).json({ error: "Username and message are required." });

  try {
    const newPost = new Post({ username, message, type: "chat" });
    await newPost.save();

    io.emit("new-post", newPost); // Broadcast new chat post

    res.status(201).json({ message: "Post saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save post." });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO connection & events
io.on("connection", (socket) => {
  console.log("🔌 User connected");

  socket.on("user-login", async (username) => {
    socket.username = username;

    // Save system login message
    const systemMessage = new Post({
      message: `${username} logged in`,
      type: "system",
    });
    await systemMessage.save();

    io.emit("system-message", systemMessage);
  });

  socket.on("user-logout", async (username) => {
    // Save system logout message
    const systemMessage = new Post({
      message: `${username} logged out`,
      type: "system",
    });
    await systemMessage.save();

    io.emit("system-message", systemMessage);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
