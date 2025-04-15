const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const methodOverride = require('method-override');

const constants = require('./utils/constants');
const getUserFromToken = require('./middlewares/getUserFromToken');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const menusRouter = require('./routes/menus');
const rolesRouter = require('./routes/roles');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const checkoutRouter = require('./routes/checkout');
const adminRouter = require('./routes/admin');
const ordersRouter = require('./routes/orders');
const cartsRouter = require('./routes/carts');
const reviewsRouter = require('./routes/reviews');
const uploadRouter = require('./routes/upload');
const shippingRouter = require('./routes/shippingInfos');
const profileRouter = require('./routes/profile');

const { CreateErrorResponse } = require('./utils/responseHandler');

const app = express();

// 🟢 Kết nối MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/S6");
mongoose.connection.on('connected', () => {
  console.log("✅ MongoDB connected");
});

require('./schemas/user');
require('./schemas/role');
// 📦 Middleware Setup
app.use(cors({ origin: '*' }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser(constants.SECRET_KEY_COOKIE));
app.use(session({
  secret: 's6-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000 // 1 giờ
  }
}));

// 🧠 Gắn user vào res.locals để pug sử dụng được
app.use(getUserFromToken);

// 📁 Static & View Engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 📌 Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/menus', menusRouter);
app.use('/roles', rolesRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/checkout', checkoutRouter);
app.use('/admin', adminRouter);
app.use('/admin/orders', ordersRouter);

app.use('/orders', ordersRouter);
app.use('/carts', cartsRouter);
app.use('/reviews', reviewsRouter);
app.use('/upload', uploadRouter);
app.use('/shippingInfos', shippingRouter);
app.use('/profile', profileRouter);

// ❌ 404 Not Found
app.use(function (req, res, next) {
  next(createError(404));
});

// ❌ Error Handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  CreateErrorResponse(res, err.status || 500, err.message);
});

module.exports = app;
