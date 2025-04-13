const jwt = require("jsonwebtoken");
const constants = require("../utils/constants");
const User = require('../schemas/user');
const Role = require('../schemas/role');

module.exports = async function (req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.user = null;
            res.locals.currentUser = null;
            return next();
        }

        const decoded = jwt.verify(token, constants.SECRET_KEY);
        req.session.userId = decoded.id;

        // Lấy user từ DB và populate role
        const user = await User.findById(decoded.id).populate('role');

        req.user = user;
        res.locals.currentUser = {
            _id: user._id,
            username: user.username,
            roleId: user.role?._id?.toString() || '',
        };
        next();
    } catch (err) {
        req.user = null;
        res.locals.currentUser = null;
        next();
    }
};
