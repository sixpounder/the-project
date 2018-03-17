const express = require('express');
const router = express.Router();

const PagesController = require(resolveModule('api/controllers/PagesController'));

router.get('/', PagesController.home);

module.exports = router;