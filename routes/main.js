const express = require('express');
const router = express.Router();

const HomeCounterPolicy = require(resolveModule('policies/home-counter'));
const PagesController = require(resolveModule('api/controllers/PagesController'));

router.get('/', HomeCounterPolicy, PagesController.home);

module.exports = router;