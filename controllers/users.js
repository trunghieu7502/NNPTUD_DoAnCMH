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
    return await userSchema.findOne({ email: email }).populate('role')
  },
  GetUserByToken: async function (token) {
    return await userSchema.findOne({ resetPasswordToken: token }).populate('role')
  },
  CreateAnUser: async function (username, password, email, role = 'user') {
    try {
      let roleObj = await roleSchema.findOne({ name: role });
      if (!roleObj) {
        roleObj = new roleSchema({ name: 'user' });
        await roleObj.save();
      }
      let newUser = new userSchema({
        username: username,
        password: password,
        email: email,
        role: roleObj._id
      });
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
        getUser[key] = body[key];
      }
    }
    return await getUser.save();
  },
  DeleteAnUser: async function (id) {
    return await userSchema.findByIdAndUpdate(id, { status: false }, { new: true });
  },
  CheckLogin: async function (username, password) {
    let user = await userSchema.findOne({ username: username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error("username hoac password khong dung");
    }
    return user._id;
  },
  Change_Password: async function (user, oldpassword, newpassword) {
    if (!bcrypt.compareSync(oldpassword, user.password)) {
      throw new Error("oldpassword khong dung");
    }
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newpassword, salt);
    return await user.save();
  },
  ListUsersForManagement: async function () {
    return await userSchema.find({ status: true }).populate('role');
  },
  DisableUserById: async function (id) {
    const result = await userSchema.findByIdAndUpdate(id, { status: false }, { new: true });
    if (!result) throw new Error("Không tìm thấy user");
    return result;
  }
};
