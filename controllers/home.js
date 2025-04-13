const express = require('express');
const router = express.Router();
const productSchema = require('../schemas/product'); // <-- đảm bảo đúng path

// Trang chủ
router.get('/', async function (req, res, next) {
    try {
        const products = await productSchema.find({ isDeleted: false }).limit(10).sort({ createdAt: -1 });
        res.render('index', { products }); // <-- truyền biến `products` lên homepage
    } catch (err) {
        next(err);
    }
});

module.exports = router;
