const express = require('express');
const router = express.Router();
const orderSchema = require('../schemas/order');
const constants = require('../utils/constants');
const { check_authentication } = require('../utils/check_auth');
const { check_authorization } = require('../utils/check_auth');

// ✅ Lịch sử đơn hàng của người dùng (phải đặt trước /:id)
router.get('/history', check_authentication, async (req, res) => {
  try {
    const userId = req.session.userId;
    const orders = await orderSchema.find({ userId }).populate('items.productId');
    res.render('order-history', { orders });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

// ✅ Xem chi tiết đơn hàng theo ID
router.get('/:id', check_authentication, async (req, res) => {
  try {
    const order = await orderSchema.findById(req.params.id).populate('userId').populate('items.productId');
    res.status(200).send({ success: true, data: order });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

// ✅ Lấy tất cả đơn hàng (admin)
router.get('/', check_authentication, async (req, res) => {
  try {
    const orders = await orderSchema.find().populate('userId').populate('items.productId');
    res.status(200).send({ success: true, data: orders });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// ✅ Tạo đơn hàng mới
router.post('/', check_authentication, async (req, res) => {
  try {
    const newOrder = new orderSchema(req.body);
    await newOrder.save();
    res.status(201).send({ success: true, data: newOrder });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// ✅ Cập nhật đơn hàng
router.put('/:id', check_authentication, async (req, res) => {
  try {
    const updated = await orderSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ success: true, data: updated });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// ✅ Xoá đơn hàng (yêu cầu quyền MOD)
router.delete('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async (req, res) => {
  try {
    await orderSchema.findByIdAndDelete(req.params.id);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;
