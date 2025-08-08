const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const PASSWORD = "12345"; // same password for all
let users = {}; // { socketId: username }

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (password !== PASSWORD) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    // Save username permanently for that IP or session
    res.json({ success: true, username });
});

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('systemMessage', `${username} logged in`);
    });

    socket.on('chatMessage', (msg) => {
        io.emit('chatMessage', { user: users[socket.id], text: msg });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('systemMessage', `${users[socket.id]} logged out`);
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
