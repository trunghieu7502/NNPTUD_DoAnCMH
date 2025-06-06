const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const { check_authentication } = require('../utils/check_auth');
const userController = require('../controllers/users');

// GET: Profile page
router.get('/', check_authentication, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/auth/login');
        res.render('profile', { user });
    } catch (err) {
        res.status(500).send('Lỗi khi lấy thông tin người dùng');
    }
});

// POST: Cập nhật thông tin cá nhân
router.post('/update', check_authentication, async (req, res) => {
    const { email, fullname, phone } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        if (email) user.email = email;
        if (fullname) user.fullname = fullname;
        if (phone) user.phone = phone;
        await user.save();
        res.redirect('/profile');
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

// GET: Trang đổi mật khẩu
router.get('/change-password', check_authentication, (req, res) => {
    res.render('change-password');
});

// POST: Xử lý đổi mật khẩu
router.post('/change-password', check_authentication, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.render('change-password', { error: 'Mật khẩu mới không khớp' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/auth/login');
        
        await userController.Change_Password(user, oldPassword, newPassword);
        res.render('change-password', { success: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        res.render('change-password', { error: err.message });
    }
});

module.exports = router;
