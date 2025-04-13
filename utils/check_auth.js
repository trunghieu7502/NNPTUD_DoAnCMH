const jwt = require('jsonwebtoken');
const constants = require('../utils/constants');
const userController = require('../controllers/users');

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            let token = null;

            // Ưu tiên lấy từ signedCookies
            if (req.signedCookies && req.signedCookies.token) {
                token = req.signedCookies.token;
            }
            // Nếu không, lấy từ header Authorization
            else if (req.headers && req.headers.authorization) {
                const authHeader = req.headers.authorization;
                if (authHeader.startsWith('Bearer ')) {
                    token = authHeader.split(' ')[1];
                }
            }

            // Không có token thì xem như chưa đăng nhập
            if (!token) {
                req.user = null;
                res.locals.currentUser = null;
                return next(); // cho phép truy cập bình thường
            }

            // Giải mã token
            const result = jwt.verify(token, constants.SECRET_KEY);
            if (result.exp <= Date.now()) {
                req.user = null;
                res.locals.currentUser = null;
                return next();
            }

            // Lấy thông tin user từ controller
            const user = await userController.GetUserByID(result.id);
            req.user = user;
            res.locals.currentUser = user;
            next();
        } catch (error) {
            req.user = null;
            res.locals.currentUser = null;
            next(); // không chặn trang view nếu lỗi, chỉ không hiển thị user
        }
    },

    // Middleware kiểm tra quyền
    check_authorization: function (requiredRoles = []) {
        return function (req, res, next) {
            if (!req.user || !req.user.role || !requiredRoles.includes(req.user.role.name)) {
                return next(new Error("Bạn không có quyền truy cập"));
            }
            next();
        };
    }
};
