let userSchema = require('../schemas/user')
let roleSchema = require('../schemas/role')
let bcrypt = require('bcrypt')
module.exports = {
  GetAllUser: async function () {
    return await userSchema.find({}).populate('role')
  },
  GetUserByID: async function (id) {
    return await userSchema.findById(id).populate('role')
  },
  GetUserByEmail: async function (email) {
    return await userSchema.findOne({
      email: email
    }).populate('role')
  },
  GetUserByToken: async function (token) {
    return await userSchema.findOne({
      resetPasswordToken: token
    }).populate('role')
  },
  CreateAnUser: async function (username, password, email, role = 'user') {
    try {
      // Kiểm tra xem vai trò đã tồn tại hay chưa
      let roleObj = await roleSchema.findOne({ name: role });

      // Nếu vai trò không tồn tại, tạo vai trò mặc định là "user"
      if (!roleObj) {
        console.log(`Role "${role}" không tồn tại, sử dụng role mặc định "user".`);
        roleObj = new roleSchema({ name: 'user' });
        await roleObj.save(); // Lưu vai trò mặc định vào cơ sở dữ liệu
      }

      // Tạo người dùng với vai trò đã chọn hoặc vai trò mặc định
      let newUser = new userSchema({
        username: username,
        password: password,
        email: email,
        role: roleObj._id // Lưu ID vai trò vào người dùng
      });

      // Lưu người dùng vào cơ sở dữ liệu
      return await newUser.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  UpdateAnUser: async function (id, body) {
    let allowField = ["password", "email", "imgURL"];
    let getUser = await userSchema.findById(id);
    for (const key of Object.keys(body)) {
      if (allowField.includes(key)) {
        getUser[key] = body[key]
      }
    }
    return await getUser.save();
  },
  DeleteAnUser: async function (id) {
    return await userSchema.findByIdAndUpdate(id, { status: false }
      , {
        new: true
      });
  },
  CheckLogin: async function (username, password) {
    let user = await userSchema.findOne({
      username: username
    });
    if (!user) {
      throw new Error("username hoac password khong dung")
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        return user._id
      } else {
        throw new Error("username hoac password khong dung")
      }
    }
  },
  Change_Password: async function (user, oldpassword, newpassword) {
    if (!bcrypt.compareSync(oldpassword, user.password)) {
        throw new Error("oldpassword khong dung");
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newpassword, salt);
        console.log('New password hash:', hashedPassword);
        user.password = newpassword;
        await user.save();

        const isValid = bcrypt.compareSync(newpassword, user.password);
        if (!isValid) {
            throw new Error("Password verification failed after change");
        }

        return true;
    } catch (error) {
        console.error('Password change error:', error);
        throw error;
    }
  }
}