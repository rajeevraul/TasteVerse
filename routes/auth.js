const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Simulated user database for demonstration purposes
const users = [
  { id: 1, username: 'user1', passwordHash: '$2b$10$/TQWU4G7OtY7BxNUKgKNLOVy8w.n78XbW8wG2mTr9tIjKbVsbc6zO' } // Password: 'password'
];

// Login page route
// auth.js - route handling code for the login page
router.get('/login', (req, res) => {
  res.render('loginpage', { error: null }); // Pass the error variable with a default value
});


// Handle login form submission
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);

  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    req.session.user = user;
    res.redirect('/main');
  } else {
    res.render('loginpage', { error: 'Invalid credentials' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
