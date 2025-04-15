// routes/checkout.js
const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const Order = require('../schemas/order');
const Product = require('../schemas/product');
const { check_authentication } = require('../utils/check_auth');

// GET: Trang checkout
router.get('/', check_authentication, async (req, res) => {
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
        return res.redirect('/carts');
    }

    let total = 0;
    cart.items.forEach(item => total += item.productId.price * item.quantity);

    res.render('checkout', {
        user: req.user,
        cart,
        couponCode: null,
        discountAmount: 0,
        totalAfterDiscount: total
    });
});

// POST: Gửi đơn hàng
router.post('/submit', check_authentication, async (req, res) => {
    try {
        const userId = req.session.userId;
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) return res.redirect('/carts');

        const { address, city, district, ward, paymentMethod, notes } = req.body;

        let total = 0;
        for (const item of cart.items) {
            const product = item.productId;
            if (product.stock < item.quantity) {
                return res.status(400).send(`Sản phẩm ${product.name} không đủ số lượng trong kho`);
            }
            await Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -item.quantity }
            });
            total += product.price * item.quantity;
        }
        const orderItems = cart.items.map(item => {
            total += item.productId.price * item.quantity;
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            };
        });

        const newOrder = new Order({
            userId,
            items: orderItems,
            shippingAddress: address,
            ward,
            district,
            city,
            paymentMethod,
            totalPrice: total
        });

        await newOrder.save();

        const orderDetails = cart.items.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.productId.price
        }));

        cart.items = [];
        await cart.save();

        res.render('checkout-success', {
            order: {
                _id: newOrder._id,
                orderDate: newOrder.createdAt,
                shippingAddress: newOrder.shippingAddress,
                ward: newOrder.ward,
                district: newOrder.district,
                city: newOrder.city,
                paymentMethod: newOrder.paymentMethod,
                totalPrice: newOrder.totalPrice,
                orderDetails
            }
        });
    } catch (err) {
        console.error('Lỗi đặt hàng:', err);
        res.status(500).send('Lỗi xử lý đơn hàng');
    }
});

module.exports = router;
