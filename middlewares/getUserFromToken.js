const jwt = require("jsonwebtoken");
const constants = require("../utils/constants");
const User = require('../schemas/user');

module.exports = async function (req, res, next) {
    console.log("=== 🟡 ĐANG VÀO MIDDLEWARE getUserFromToken ===");

    try {
        const token = req.signedCookies.token; // ✅ dùng signedCookies thay vì cookies
        console.log("➡️ Token từ signed cookie:", token);

        if (!token) {
            console.log("⚠️ Không tìm thấy token");
            req.user = null;
            res.locals.currentUser = null;
            return next();
        }

        const decoded = jwt.verify(token, constants.SECRET_KEY);
        console.log("✅ Token decode xong:", decoded);

        req.session.userId = decoded.id;
        console.log("📌 Gán userId vào session:", req.session.userId);

        const user = await User.findById(decoded.id).populate('role');
        if (!user) {
            console.log("❌ Không tìm thấy user trong DB");
            req.user = null;
            res.locals.currentUser = null;
            return next();
        }

        req.user = user;
        res.locals.currentUser = {
            _id: user._id,
            username: user.username,
            roleId: user.role?._id?.toString() || '',
            roleName: user.role?.name || '',
        };
        console.log("🎯 Current User set vào res.locals:", res.locals.currentUser);

        next();
    } catch (err) {
        console.error("❌ Lỗi middleware getUserFromToken:", err.message);
        req.user = null;
        res.locals.currentUser = null;
        next();
    }
};
