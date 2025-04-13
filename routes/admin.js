const express = require('express');
const router = express.Router();
const { check_authentication } = require('../utils/check_auth');

router.get('/', check_authentication, (req, res) => {
    if (req.user?.role?.name !== 'admin' && req.user?.roleId !== '67f156d667c06b91106da520') {
        return res.status(403).send("Bạn không có quyền truy cập");
    }

    res.render('admin/dashboard');
});

module.exports = router;
