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


// LOGICA MESSAGE
// Un contrato se crea por defecto con estado: pendiente.
// Mostrar mensajes cuando:
// Un padre o canguro ha solicitado canguro y le han aceptado o rechazado.
// Un canguro ha recibido solicitud de padre o canguro.

router.get('/profile/message', userIsNotLogged, async (req, res, next) => {
  try {
    const currentUser = req.session.currentUser;
    let noMessages = false;
    if (currentUser) {
      // Todos los contratos que ha solicitado el padre o canguro actual a otros canguros.
      const contractParent = await Contract.find({ parent: currentUser._id }).populate('dogwalker');
      // Todos los contratos que ha recibido el canguro actual de padres u otros canguros.
      const contractDogwalker = await Contract.find({ dogwalker: currentUser._id }).populate('parent');
      // Contratos que ha recibido la canguro con estado pendiente.
      const filterStateDogwalker = contractDogwalker.filter((dogwalker) => {
        return dogwalker.state === 'Pending';
      });
      // Contratos de los padres o conguros que han solicitado canguro con estado feedback.
      const filterStateFeedback = contractParent.filter((contract) => {
        return contract.state === 'Feedback';
      });
      // Contratos de los padres o canguros que han solicitado canguro con estado aceptado o rechazado.
      const filterStateParent = contractParent.filter((parent) => {
        return parent.state !== 'Pendiente' && parent.state !== 'Feedback';
      });

      filterStateParent.forEach(parent => {
        if (parent.state === 'Denegado') {
          parent.denegado = true;
        } else {
          parent.denegado = false;
        }
      });

      if (filterStateDogwalker.length === 0 && filterStateFeedback.length === 0 && filterStateParent.length === 0) {
        noMessages = true;
      }
      res.render('message', { filterStateParent, filterStateDogwalker, filterStateFeedback, noMessages });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;