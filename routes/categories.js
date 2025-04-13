const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const categorySchema = require('../schemas/category');
const methodOverride = require('method-override');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let { check_authorization } = require('../utils/check_auth');

router.use(methodOverride('_method'));

// GET: form tạo danh mục
router.get('/create', check_authentication, check_authorization(constants.MOD_PERMISSION), async (req, res) => {
    res.render('categories/create');
});

// GET: form chỉnh sửa
router.get('/edit/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async (req, res) => {
    try {
        const category = await categorySchema.findById(req.params.id);
        res.render('categories/edit', { category });
    } catch (err) {
        res.status(404).send("Không tìm thấy danh mục để sửa");
    }
});

// GET: danh sách danh mục (view)
router.get('/', async (req, res, next) => {
    try {
        const categories = await categorySchema.find({ isDeleted: false });
        res.render('categories/index', { categories });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async function(req, res, next) {
    try {
        let category = await categorySchema.findById(req.params.id);
        res.send({
            success:true,
            data:category
        });
    } catch (error) {
        res.status(404).send({
            success:false,
            message:error.message
        })
    }
});

// POST: tạo mới danh mục
router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async (req, res, next) => {
    try {
        const body = req.body;
        const newCategory = new categorySchema({
            name: body.name,
            slug: slugify(body.name, { lower: true }),
            description: body.description || ""
        });
        await newCategory.save();
        res.redirect('/categories');
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

// PUT: cập nhật danh mục
router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async (req, res) => {
    try {
        const { name, description } = req.body;
        const updated = await categorySchema.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        res.redirect('/categories');
    } catch (error) {
        res.status(400).send("Lỗi khi cập nhật danh mục: " + error.message);
    }
});

// DELETE: xoá mềm
router.delete('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async (req, res) => {
    try {
        await categorySchema.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.redirect('/categories');
    } catch (error) {
        res.status(400).send("Lỗi xoá danh mục: " + error.message);
    }
});

module.exports = router;
