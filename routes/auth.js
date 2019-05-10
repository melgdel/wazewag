
var express = require('express');
const User = require('../models/User');
const { userIsLogged, userIsNotLogged } = require('../middlewares/auth');
const bcrypt = require('bcrypt');

const saltRounds = 10;
var router = express.Router();

// Signup
router.get('/signup', userIsLogged, (req, res, next) => {
  const data = {
    messages: req.flash('validation')
  };
  res.render('auth/signup', data);
});

router.post('/signup', userIsLogged, async (req, res, next) => {
  const { username, password, userType, latitude, longitude, location } = req.body;
  try {
    // prove filled sections
    if (!username || !password || !userType) {
      req.flash('validation', 'Fill all Information');
      res.redirect('/auth/signup');
      return;
    }

    // prove user is in DB
    const result = await User.findOne({ username });
    if (result) {
      req.flash('validation', 'this user exist');
      res.redirect('/auth/signup');
      return;
    }

    // encrypt password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create user
    const newUser = {
      username,
      password: hashedPassword,
      userType,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      city: location
    };

    const createdUser = await User.create(newUser);
    req.session.currentUser = createdUser;

    // redirect home
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------

// Log in
router.get('/login', userIsLogged, (req, res, next) => {
  const data = {
    messages: req.flash('validation')
  };
  res.render('auth/login', data);
});

router.post('/login', userIsLogged, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // prove filled sections
    if (!username || !password) {
      req.flash('validation', 'Fill all Information');
      res.redirect('/auth/login');
      return;
    }

    // prove credentials
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('validation', 'User does not exist');
      res.redirect('/auth/login');
      return;
    }
    if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      res.redirect('/');
      return;
    } else {
      req.flash('validation', 'Password is incorrect ');
      res.redirect('/auth/login');
      return;
    }
  } catch (error) {
    next(error);
  }
});

router.post('/logout', userIsNotLogged, (req, res, next) => {
  delete req.session.currentUser;
  res.redirect('/');
});

module.exports = router;
