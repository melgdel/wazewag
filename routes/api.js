const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/user', async (req, res, next) => {
  try {
    const allUsers = await User.find();
    const dogwalkers = allUsers.filter(user => {
      return user.userType === 'walker';
    });
    if (!dogwalkers.length) {
      res.status(404);
      res.json({ message: 'No waggers in area' });
      return;
    }
    res.json(dogwalkers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
