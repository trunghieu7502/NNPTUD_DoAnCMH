const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { check_authentication, check_authorization } = require('../utils/check_auth');

const constants = require('../utils/constants');


router.get('/', check_authentication, (req, res) => {
    if (req.user?.role?.name !== 'admin' && req.user?.roleId !== '67f156d667c06b91106da520') {
        return res.status(403).send("Bạn không có quyền truy cập");
    }

    res.render('admin/dashboard');
});

router.get('/users', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async (req, res) => {
    try {
        const users = await userController.GetAllUser();
        res.render('admin/users', { users });
    } catch (err) {
        res.status(500).send({ success: false, message: err.message });
    }
});

module.exports = router;
