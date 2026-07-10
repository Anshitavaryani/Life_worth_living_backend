const express = require('express');
const router = express.Router();

const {packageController} = require('../../../controllers');


router.post('/createPackage',packageController.createPackage);
router.get('/get',packageController.getAllPackages);
router.get('/get/:id',packageController.findPackageById);
router.put('/update/:id',packageController.updatePackage);
router.delete('/delete/:id',packageController.deletePackage);

module.exports = router;