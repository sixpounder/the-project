const express = require('express');
const router = express.Router();

const SessionAuth = require(resolveModule('policies/sessionAuth'));
const ClipController = require(resolveModule('api/ClipController'));
const uploadMiddleware = require(resolveModule('middlewares/upload'));

router.get('/clips/:scope',     ClipController.find);
router.get('/clips/:id/cover',  ClipController.cover);
router.post('/upload',          SessionAuth, uploadMiddleware, ClipController.create);

module.exports = router;