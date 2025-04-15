var express = require('express');
var router = express.Router();
let cartSchema = require('../schemas/cart');
let { check_authentication } = require('../utils/check_auth');
const Order = require('../schemas/order');

router.get('/', check_authentication, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.redirect('/auth/login');
  const cart = await cartSchema.findOne({ userId }).populate('items.productId');
  let total = 0;
  if (cart) {
    cart.items.forEach(item => {
      total += item.productId.price * item.quantity;
    });
  }
  res.render('carts', { cart, total });
});

router.get('/:id', check_authentication, async function (req, res) {
  try {
    let cart = await cartSchema.findById(req.params.id).populate('userId').populate('items.productId');
    res.status(200).send({ success: true, data: cart });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

router.get('/add/:productId', check_authentication, async (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  if (!userId) return res.redirect('/auth/login');

  let cart = await cartSchema.findOne({ userId });

  if (!cart) {
    cart = new cartSchema({ userId, items: [] });
  }

  const existingItem = cart.items.find(item => item.productId.toString() === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ productId, quantity: 1 });
  }

  await cart.save();
  res.redirect('/carts');
});

router.post('/update-quantity/:productId', check_authentication, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId } = req.params;
    const { change, isAbsolute } = req.body;

    const cart = await cartSchema.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: 'Item not found in cart' });

    const newQuantity = isAbsolute ? parseInt(change) : item.quantity + parseInt(change);
    if (newQuantity > item.productId.stock) {
      return res.status(400).json({ error: 'Không đủ số lượng trong kho' });
    }
    item.quantity = Math.max(1, newQuantity);

    await cart.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', check_authentication, async function (req, res) {
  try {
    let newCart = new cartSchema(req.body);
    await newCart.save();
    res.status(201).send({ success: true, data: newCart });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.put('/:id', check_authentication, async function (req, res) {
  try {
    let updated = await cartSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ success: true, data: updated });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.post('/remove/:productId', check_authentication, async (req, res) => {
  const userId = req.session.userId;
  const { productId } = req.params;

  if (!userId) return res.redirect('/auth/login');

  const cart = await cartSchema.findOne({ userId });

  if (!cart) return res.redirect('/carts');

  // Xoá sản phẩm khỏi giỏ
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);

  await cart.save();
  res.redirect('/carts');
});



// routes/carts.js

router.post('/checkout', check_authentication, async function (req, res) {
  const userId = req.session.userId;
  const cart = await cartSchema.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    return res.redirect('/carts');
  }

  let total = 0;
  cart.items.forEach(item => {
    total += item.productId.price * item.quantity;
  });

  res.render('checkout', {
    user: req.user, // từ middleware getUserFromToken
    cart: cart,
    couponCode: null,
    discountAmount: 0,
    totalAfterDiscount: total
  });
});



module.exports = router;