var express = require('express');
var router = express.Router();
let schema = require('../schemas/shippingInfo');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let { check_authorization } = require('../utils/check_auth');

router.get('/', check_authentication, async function (req, res) {
  try {
    let data = await schema.find().populate('userId');
    res.status(200).send({ success: true, data: data });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.get('/:id', check_authentication, async function (req, res) {
  try {
    let result = await schema.findById(req.params.id).populate('userId');
    res.status(200).send({ success: true, data: result });
  } catch (error) {
    res.status(404).send({ success: false, message: error.message });
  }
});

router.post('/', check_authentication, async function (req, res) {
  try {
    let newItem = new schema(req.body);
    await newItem.save();
    res.status(201).send({ success: true, data: newItem });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
  try {
    let updated = await schema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ success: true, data: updated });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

router.delete('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
  try {
    await schema.findByIdAndDelete(req.params.id);
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;
