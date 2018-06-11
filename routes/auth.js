const express = require('express');
const router = express.Router();

const AuthController = require(resolveModule('api/AuthController'));
const checkSignupDataValidity = require(resolveModule('policies/checkSignupDataValidity'));

router.get('/user/check', AuthController.checkEmail);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/signup', checkSignupDataValidity, AuthController.signup);

router.get('/me', AuthController.me);

module.exports = router;