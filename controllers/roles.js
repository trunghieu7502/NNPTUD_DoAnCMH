let roleSchema = require('../schemas/role')


module.exports = {
    GetAllRoles: async function () {
        return await roleSchema.find({});
    },
    GetARole: async function (id) {
        const role = await roleSchema.findById(id);
        if (!role) throw new Error("Không tìm thấy quyền");
        return role;
    },
    CreateARole: async function (name) {
        let newRole = new roleSchema({
            name: name
        });
        return await newRole.save();
    },
    UpdateARole: async function (id, name, description) {
        const updated = await roleSchema.findByIdAndUpdate(id, { name: name }, {description: description }, { new: true });
        if (!updated) throw new Error("Không tìm thấy quyền để cập nhật");
        return updated;
    },
    DeleteARole: async function (id) {
        const deleted = await roleSchema.findByIdAndDelete(id);
        if (!deleted) throw new Error("Không tìm thấy quyền để xóa");
        return { message: "Đã xóa quyền thành công" };
    }

}