const express = require('express');
const router = express.Router();

const WelcomeController = require('../controllers/WelcomeController');
const AddWhatsappAccountController = require('../controllers/AddWhatsappAccountController');

router.get('/', WelcomeController.get);
router.post('/add_whatsapp_account', AddWhatsappAccountController.post);

module.exports = router;
