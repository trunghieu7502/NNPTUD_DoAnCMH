let reviewSchema = require('../schemas/review');

module.exports = {
    GetAllReviews: async function () {
        return await reviewSchema.find({}).populate('productId userId');
    },

    CreateReview: async function (body) {
        try {
            const newReview = new reviewSchema(body);
            return await newReview.save();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    UpdateReview: async function (id, body) {
        try {
            const updated = await reviewSchema.findByIdAndUpdate(id, body, { new: true });
            if (!updated) throw new Error("Không tìm thấy đánh giá");
            return updated;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    DeleteReview: async function (id) {
        try {
            const deleted = await reviewSchema.findByIdAndDelete(id);
            if (!deleted) throw new Error("Không tìm thấy đánh giá để xóa");
            return { message: "Đã xóa đánh giá thành công" };
        } catch (err) {
            throw new Error(err.message);
        }
    }
};
