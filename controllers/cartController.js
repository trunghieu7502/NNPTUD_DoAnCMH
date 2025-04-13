const Cart = require('../schemas/cart');
const Product = require('../schemas/product');

exports.viewCart = async function (req, res) {
    const cart = await Cart.findOne({ userId: req.session.userId }).populate('items.productId');
    let total = 0;
    if (cart) {
        cart.items.forEach(item => {
            total += item.productId.price * item.quantity;
        });
    }
    res.render('cart', { cart, total });
};

exports.addToCart = async function (req, res) {
    const productId = req.params.productId;
    const userId = req.session.userId;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    res.redirect('/cart');
};

exports.removeFromCart = async function (req, res) {
    const productId = req.params.productId;
    const userId = req.session.userId;
    let cart = await Cart.findOne({ userId });
    if (cart) {
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
    }
    res.redirect('/cart');
};

res.render('checkout', {
    user: req.user,
    cart: cart,
    couponCode: req.query.code || null,
    discountAmount: 0,
    totalAfterDiscount: total
});
