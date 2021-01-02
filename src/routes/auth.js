const express = require('express');
const router = express.Router();

const LoginController = require('./../controllers/auth/LoginController');

router.get('/login', LoginController.get);
router.post('/login', LoginController.post);

module.exports = router;
