let roleSchema = require('../schemas/role')


module.exports = {
    GetAllRoles: async function () {
        return await roleSchema.find({});
    },
    CreateARole: async function (name) {
        let newRole = new roleSchema({
            name: name
        });
        return await newRole.save();
    },
    UpdateRole: async function (id, name) {
        const updated = await roleSchema.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated) throw new Error("Không tìm thấy quyền");
        return updated;
    },

    DeleteRole: async function (id) {
        const deleted = await roleSchema.findByIdAndDelete(id);
        if (!deleted) throw new Error("Không tìm thấy quyền để xóa");
        return { message: "Đã xóa quyền thành công" };
    }

}