var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
let { CreateSuccessResponse, CreateErrorResponse } = require('./utils/responseHandler')
let constants = require("./utils/constants")
let cors = require('cors')
let { check_authentication } = require('./utils/check_auth');
const session = require('express-session');
const getUserFromToken = require('./middlewares/getUserFromToken');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var app = express();

app.use(cors({
  origin: '*'
}))

mongoose.connect("mongodb://127.0.0.1:27017/S6");
mongoose.connection.on('connected', () => {
  console.log("connected");
})

require('./schemas/user');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(constants.SECRET_KEY_COOKIE));

app.use(session({
  secret: 's6-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));

app.use(getUserFromToken); // <== Bỏ xuống dưới session


app.use(express.static(path.join(__dirname, 'public')));
app.use(check_authentication);


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', require('./routes/auth'));
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/checkout', require('./routes/checkout'));
app.use('/admin', require('./routes/admin'));


app.use('/orders', require('./routes/orders'));
app.use('/carts', require('./routes/carts'));
app.use('/reviews', require('./routes/reviews'));
app.use('/upload', require('./routes/upload'));
app.use('/shippingInfos', require('./routes/shippingInfos'));
app.use('/profile', require('./routes/profile'));




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  CreateErrorResponse(res, err.status || 500, err.message)
});


//

module.exports = app;
