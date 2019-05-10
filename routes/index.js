var express = require('express');
const User = require('../models/User');
const { userIsNotLogged } = require('../middlewares/auth');
//const parser = require('../helpers/file-upload');

var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    let dogWalkerArray = await User.find({ userType: 'dog walker' });
    // if you are logged in show all the other dog walkers, except yourself 
    dogWalkerArray = dogWalkerArray.filter(dogwalker => {
        return dogwalker._id.toString() !== currentUser._id;
      });
    
    res.render('home', { dogWalkerArray });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', userIsNotLogged, async (req, res, next) => {
  try {
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

module.exports = router;