let mongoose = require('mongoose');

let shippingInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: String,
  phone: String,
  receiver: String
});

module.exports = mongoose.model('ShippingInfo', shippingInfoSchema);
