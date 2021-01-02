const express = require('express');
const router = express.Router();

const SendMessageController = require('../controllers/api/SendMessageController');

router.post('/send_message', SendMessageController.post);

module.exports = router;
