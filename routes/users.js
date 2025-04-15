var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
let { CreateSuccessResponse, CreateErrorResponse } = require('../utils/responseHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
const constants = require('../utils/constants');

router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  let users = await userController.GetAllUser();
  CreateSuccessResponse(res, 200, users);
});

router.post('/', async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessResponse(res, 200, newUser);
  } catch (error) {
    CreateErrorResponse(res, 404, error.message);
  }
});

router.put('/:id', check_authentication, async function (req, res, next) {
  try {
    let body = req.body;
    let updatedResult = await userController.UpdateAnUser(req.params.id, body);
    CreateSuccessResponse(res, 200, updatedResult);
  } catch (error) {
    next(error);
  }
});

router.get('/management', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async (req, res) => {
  try {
    const users = await userController.ListUsersForManagement();
    res.render('admin/users', { users });
  } catch (error) {
    CreateErrorResponse(res, 500, error.message);
  }
});

router.post('/delete/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async (req, res) => {
  try {
    await userController.DisableUserById(req.params.id);
    res.redirect('/users/management');
  } catch (error) {
    CreateErrorResponse(res, 500, error.message);
  }
});

module.exports = router;
