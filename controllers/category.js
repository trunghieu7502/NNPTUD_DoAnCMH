let categorySchema = require('../schemas/category');
let { containsSpecialCharacter, isNumeric } = require('../utils/validator');

module.exports = {
    GetAllCategories: async function () {
        return await categorySchema.find({});
    },

    GetCategoryByID: async function (id) {
        let category = await categorySchema.findById(id);
        return category;
    },

    GetCategoryByName: async function (name) {
        let category = await categorySchema.findOne({
            name: name
        });
        return category;
    },

    CreateCategory: async function (name) {
        try {
            if (!containsSpecialCharacter(name) && !isNumeric(name)) {
                let category = await categorySchema.findOne({
                    name: name
                });
                if (!category) {
                    category = new categorySchema({
                        name: name
                    });
                    return await category.save();
                } else {
                    throw new Error('Danh mục này đã tồn tại');
                }
            } else {
                throw new Error('Danh mục không hợp lệ');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    },
    UpdateCategory: async function (id, name) {
        const updated = await categorySchema.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated) throw new Error("Không tìm thấy danh mục");
        return updated;
    },

    DeleteCategory: async function (id) {
        const deleted = await categorySchema.findByIdAndUpdate(id, { isDeleted: true });
        if (!deleted) throw new Error("Không tìm thấy danh mục để xoá mềm");
        return { message: "Đã xoá mềm danh mục thành công" };
    }

};
