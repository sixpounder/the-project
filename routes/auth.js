const express = require('express');
const router = express.Router();

const AuthController = require(resolveModule('api/controllers/AuthController'));
const checkSignupDataValidity = require(resolveModule('policies/checkSignupDataValidity'));

router.post('/signup', checkSignupDataValidity, AuthController.signup);

module.exports = router;