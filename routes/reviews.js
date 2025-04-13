var express = require('express');
var router = express.Router();
let reviewSchema = require('../schemas/review');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let { check_authorization } = require('../utils/check_auth');

router.get('/', async function (req, res) {
  try {
    let reviews = await reviewSchema.find().populate('userId').populate('productId');
    res.status(200).send({ success: true, data: reviews });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.get('/:id', async function (req, res) {
  try {
    let review = await reviewSchema.findById(req.params.id).populate('userId').populate('productId');
    res.status(200).send({ success: true, data: review });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

router.post('/', check_authentication, async function (req, res) {
  try {
    let newReview = new reviewSchema(req.body);
    await newReview.save();
    res.status(201).send({ success: true, data: newReview });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.put('/:id', check_authentication, async function (req, res) {
  try {
    let updated = await reviewSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ success: true, data: updated });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.delete('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
  try {
    await reviewSchema.findByIdAndDelete(req.params.id);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;