const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// === MongoDB ===
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === Schema & Model ===
const postSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", postSchema);

// === Routes ===
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

app.post("/api/posts", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  try {
    const newPost = new Post({ message });
    await newPost.save();

    // Emit to all connected users
    io.emit("new-post", { message });

    res.status(201).json({ message: "Post saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save post." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Socket.IO connection ===
io.on("connection", (socket) => {
  console.log("🔌 User connected");

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// === Start server ===
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
