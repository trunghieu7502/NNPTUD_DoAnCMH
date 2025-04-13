const express = require('express');
const router = express.Router();
const productSchema = require('../schemas/product');
const categorySchema = require('../schemas/category');
const slugify = require('slugify');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let { check_authorization } = require('../utils/check_auth');

// ✅ Cấu hình method override để dùng PUT và DELETE trong form
router.use(methodOverride('_method'));

// ✅ Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads')); // thư mục ảnh
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });


// ✅ GET: Trang tạo sản phẩm
router.get('/create', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
    try {
        const categories = await categorySchema.find({});
        res.render('products/create', { categories });
    } catch (error) {
        next(error);
    }
});

// ✅ GET: Trang sửa sản phẩm
router.get('/edit/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
    try {
        const product = await productSchema.findById(req.params.id).populate('category');
        const categories = await categorySchema.find({});
        if (!product) {
            return res.status(404).send("Không tìm thấy sản phẩm để sửa");
        }
        res.render('products/edit', { product, categories });
    } catch (error) {
        next(error);
    }
});

// ✅ GET: Danh sách sản phẩm (HTML)
router.get('/', async function (req, res, next) {
    try {
        const products = await productSchema.find({ isDeleted: false }).populate('category');
        res.render('products/index', { products });
    } catch (error) {
        next(error);
    }
});

// ✅ POST: Tạo mới sản phẩm
router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), upload.single('image'), async function (req, res, next) {
    try {
        const { name, price, stock, description, category } = req.body;

        const categoryObj = await categorySchema.findById(category);
        if (!categoryObj) {
            return res.status(404).send({ success: false, message: 'Không tìm thấy category' });
        }

        const newProduct = new productSchema({
            name,
            price: price || 1000,
            stock: stock || 0,
            description: description || '',
            imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
            category: categoryObj._id,
            slug: slugify(name, { lower: true })
        });

        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// ✅ GET: Chi tiết sản phẩm (JSON)
router.get('/:id', async function (req, res, next) {
    try {
        const product = await productSchema.findById(req.params.id).populate('category');
        if (!product || product.isDeleted) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }
        res.render('products/details', { product });
    } catch (err) {
        next(err);
    }
});


// ✅ PUT: Cập nhật sản phẩm
router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
    try {
        const { name, price, stock, description, category } = req.body;

        const updatedObj = {
            ...(name && { name }),
            ...(price && { price }),
            ...(stock && { stock }),
            ...(description !== undefined && { description }),
            ...(category && { category })
        };

        await productSchema.findByIdAndUpdate(req.params.id, updatedObj, { new: true });
        res.redirect('/products');
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// ✅ DELETE: Xoá mềm sản phẩm
router.delete('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
    try {
        await productSchema.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.redirect('/products');
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

module.exports = router;
