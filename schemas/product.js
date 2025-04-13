const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên sản phẩm không được để trống'],
        maxlength: [200, 'Tên sản phẩm không được quá 200 ký tự'],
        unique: true
    },
    price: {
        type: Number,
        required: [true, 'Giá không được để trống'],
        min: [1000, 'Giá phải lớn hơn hoặc bằng 1000'],
        max: [10000000, 'Giá không được vượt quá 10 triệu']
    },
    description: {
        type: String,
        required: [true, 'Mô tả không được để trống']
    },
    status: {
        type: Boolean,
        default: true // true = còn hàng
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Số lượng phải >= 0']
    },
    imageUrl: {
        type: String,
        default: ''
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductImage'
    }],

    category: {
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: true
    },
    favoriteProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FavoriteProduct'
    }],

    isDeleted: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
