const User = require('../schemas/user');
const bcrypt = require('bcrypt');

exports.changePassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!userId) return res.redirect('/auth/login');

        if (newPassword !== confirmPassword) {
            return res.render('change-password', { error: 'Mật khẩu mới không khớp' });
        }

        const user = await User.findById(userId);
        if (!user) return res.redirect('/auth/login');

        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            return res.render('change-password', { error: 'Mật khẩu hiện tại không đúng' });
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword; // sẽ được hash bởi pre('save') trong schema
        await user.save();

        res.render('change-password', { success: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        console.error(err);
        res.render('change-password', { error: 'Lỗi hệ thống' });
    }
};
