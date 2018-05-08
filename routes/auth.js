const express = require('express');
const router = express.Router();

const AuthController = require(resolveModule('api/AuthController'));
const checkSignupDataValidity = require(resolveModule('policies/checkSignupDataValidity'));

router.get('/user/check', AuthController.checkEmail);
router.post('/login', AuthController.login);
router.post('/signup', checkSignupDataValidity, AuthController.signup);

module.exports = router;