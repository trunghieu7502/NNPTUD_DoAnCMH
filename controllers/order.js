let orderSchema = require('../schemas/order');

module.exports = {
    GetAllOrders: async function () {
        return await orderSchema.find({}).populate('userId products.productId');
    },

    CreateOrder: async function (body) {
        try {
            const newOrder = new orderSchema(body);
            return await newOrder.save();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    UpdateOrder: async function (id, body) {
        try {
            const updated = await orderSchema.findByIdAndUpdate(id, body, { new: true });
            if (!updated) throw new Error("Không tìm thấy đơn hàng");
            return updated;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    DeleteOrder: async function (id) {
        try {
            const deleted = await orderSchema.findByIdAndDelete(id);
            if (!deleted) throw new Error("Không tìm thấy đơn hàng để xóa");
            return { message: "Đã xóa đơn hàng thành công" };
        } catch (err) {
            throw new Error(err.message);
        }
    }
};
