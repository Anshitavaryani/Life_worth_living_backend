const express = require('express');
const router = express.Router();

const {paypalController} = require('../../../controllers');
const { userAuthMiddleware } = require('../../../middlewares');


router.post('/createOrder',paypalController.createOrder);
router.post('/captureOrder',paypalController.captureOrder);
router.get('/status/:orderId',paypalController.getPaypalPaymentStatus);
router.post('/webhook/paypal', express.json({ type: "*/*" }), paypalController.confirmPaypalWebhook);


// DONATION ROUTE
router.post('/donation',paypalController.createDonationPaypalOrder);
router.get('/getAllPayments', paypalController.getAllPayments);
router.get("/watch/:token",paypalController.watchVideo);

router.get("/sendEmilTest",paypalController.sendEmilTest);


module.exports = router;