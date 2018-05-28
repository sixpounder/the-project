const express = require('express');
const router = express.Router();

// const SessionAuth = require(resolveModule('policies/sessionAuth'));
// const receiveManifest = require(resolveModule('middlewares/receiveManifest'));
const StreamController = require(resolveModule('api/StreamController'));

router.post('/channels/:id', StreamController.create);
router.get('/channels/:id/:stream/:chunk.ts', StreamController.streamChunk);
router.get('/channels/:id/:stream/:manifest.m3u8', StreamController.streamManifest);
// router.put('/channels/:id/:stream/manifest.m3u8', receiveManifest, StreamController.manifestEndpoint);

module.exports = router;