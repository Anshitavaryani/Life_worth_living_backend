const express = require('express');
const router = express.Router();

const { contactUsController } = require('../../../controllers');

router.post('/', contactUsController.createContactUs);
router.put('/:id', contactUsController.updateContactUs);
router.get('/', contactUsController.getAllContactUs);
router.delete('/:id', contactUsController.deleteContactUs);
router.post('/status', contactUsController.updateContactUsStatus);


module.exports = router;