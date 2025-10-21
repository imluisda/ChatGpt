const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const USER = { username: 'admin', password: 'password' };
let tasks = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

app.get('/', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.redirect('/login.html');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.get('/api/tasks', checkAuth, (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', checkAuth, (req, res) => {
  const { title, status } = req.body;
  const newTask = { id: Date.now(), title, status: status || 'todo' };
  tasks.push(newTask);
  res.json(newTask);
});

app.post('/api/tasks/:id', checkAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
