
var express = require('express');
const User = require('../models/User');
const { userIsLogged, userIsNotLogged } = require('../middlewares/auth');
const bcrypt = require('bcrypt');
var router = express.Router();


const saltRounds = 10;
var router = express.Router();

// Signup
router.get('/signup', (req, res, next) => {

  res.render('signup');
});

router.post('/signup', userIsLogged, async (req, res, next) => {
  const { username, password, userType, latitude, longitude, location } = req.body;
  try {
    // commprobar tots els camps plens
    if (!username || !password || !userType) {
      req.flash('validation', 'Rellene todos los campos');
      res.redirect('/signup');
      return;
    }

    // comprobar que el usuari està a la db
    const result = await User.findOne({ username });
    if (result) {
      req.flash('validation', 'Este usuario ya existe');
      res.redirect('/signup');
      return;
    }

    // encriptar password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // crear user
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
  res.render('login', data);
});

router.post('/login', userIsLogged, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // commprobar tots els camps plens
    if (!username || !password) {
      req.flash('validation', 'Rellene todos los campos');
      res.redirect('/login');
      return;
    }

    // comprobar credencials
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('validation', 'El usuario no existe');
      res.redirect('/login');
      return;
    }
    if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      res.redirect('/');
      return;
    } else {
      req.flash('validation', 'La contraseña es incorrecta');
      res.redirect('/login');
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