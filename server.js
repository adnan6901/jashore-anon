const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // serve frontend files

app.use(express.json());

async function start() {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db('jashore-anon');
    console.log('✅ Connected to MongoDB');

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/public/index.html');
    });

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}

start();
