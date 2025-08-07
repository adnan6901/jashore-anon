const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // ✅ Serve static files from "public"

// === MongoDB Connection ===
const mongoURI = process.env.MONGODB_URI || "your_mongodb_connection_string";
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

// === API Routes ===

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
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  try {
    const newPost = new Post({ message });
    await newPost.save();
    res.status(201).json({ message: "Post saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save post." });
  }
});

// === Catch-all for root (serves index.html) ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
