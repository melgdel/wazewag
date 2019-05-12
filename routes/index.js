var express = require('express');
const User = require('../models/User');
const { userIsNotLogged } = require('../middlewares/auth');


var router = express.Router();


router.get('/', (req, res, next) =>{
  res.render('index')
})


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

module.exports = router;