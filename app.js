require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const session = require('express-session');
const flash = require('connect-flash');
const logger = require('morgan');


const app = express();


require('./config/db.config');
require('./config/hbs.config');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Flash
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  //mal
 // app.locals.currentUser = req.session.currentUser;
  next();
});

app.use(async (req, res, next) => {
  //mal
  //app.locals.showBullet = await notification(req.session.currentUser);
  next();
});

//app.get('/',(req,res) => res.redirect('/auth'));
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// -- 404 and error handler

// NOTE: requires a views/not-found.js template
app.use((req, res, next) => {
  res.status(404);
  res.render('');
});

// NOTE: requires a views/error.js template
app.use((err, req, res, next) => {
  //always log the error
  console.error('ERROR', req.method, req.path, err);

  //only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

app.listen(3000, () => console.log('Check'));

module.exports = app;
