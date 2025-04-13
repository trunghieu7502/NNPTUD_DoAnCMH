let shippingSchema = require('../schemas/shippingInfo');

module.exports = {
    GetAllShippingInfos: async function () {
        return await shippingSchema.find({}).populate('userId');
    },

    CreateShippingInfo: async function (body) {
        try {
            const newShipping = new shippingSchema(body);
            return await newShipping.save();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    UpdateShippingInfo: async function (id, body) {
        try {
            const updated = await shippingSchema.findByIdAndUpdate(id, body, { new: true });
            if (!updated) throw new Error("Không tìm thấy thông tin giao hàng");
            return updated;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    DeleteShippingInfo: async function (id) {
        try {
            const deleted = await shippingSchema.findByIdAndDelete(id);
            if (!deleted) throw new Error("Không tìm thấy thông tin giao hàng để xóa");
            return { message: "Đã xóa thông tin giao hàng thành công" };
        } catch (err) {
            throw new Error(err.message);
        }
    }
};
    