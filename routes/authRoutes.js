const express = require('express');
const router = express.Router();
const { register, login, updateUserRole } = require('../controllers/authController');

const User = require("../models/User");

router.post('/register', register);
router.post('/login', login);
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agents', error: err });
  }
});

router.patch('/change-role', updateUserRole);

module.exports = router;
