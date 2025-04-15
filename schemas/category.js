const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên danh mục là bắt buộc"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    slug: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('category', categorySchema);
