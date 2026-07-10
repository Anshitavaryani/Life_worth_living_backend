const express = require('express');
const router = express.Router();

const {videoController} = require('../../../controllers');

router.post('/createVideo',videoController.createVideo);
router.get('/get',videoController.getAllVideos);
router.get("/download/:id",videoController.downloadVideo);

module.exports = router;