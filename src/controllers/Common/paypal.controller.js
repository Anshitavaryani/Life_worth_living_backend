/** @format */

const httpStatus = require("http-status");
const { paypalService } = require("../../services");
const responseWrapper = require("../../config/responseWrapper");
const catchAsync = require("../../utils/catchAsync");

const createOrder = catchAsync(async (req, res) => {
	const order = await paypalService.createPaypalOrder(req.body);
	return responseWrapper(
		res,
		order,
		"Order created successfully.",
		httpStatus.CREATED,
	);
});

const captureOrder = catchAsync(async (req, res) => {
	const payment = await paypalService.capturePaypalOrder(req.body);

	return responseWrapper(
		res,
		payment,
		"Payment captured successfully.",
		httpStatus.OK,
	);
});

const getPaypalPaymentStatus = catchAsync(async (req, res) => {
    const data = await paypalService.getPaypalPaymentStatus(req.params.orderId);
    return responseWrapper(res, data, '', httpStatus.OK);
});

const confirmPaypalWebhook = async (req, res) => {
  try {
    console.log("🔥 PAYPAL WEBHOOK RECEIVED");
    console.log("Event:", req.body.event_type);

    await paypalService.confirmPaypalWebhook(req.body);
  } catch (err) {
    // NEVER throw
    console.error("Webhook error:", err);
  }

  // ALWAYS ACK PAYPAL
  return res.status(200).send("OK");
};

const createDonationPaypalOrder = catchAsync(async (req, res) => {
	const order = await paypalService.createDonationPaypalOrder(req.body);
	return responseWrapper(
		res,
		order,
		"Order created successfully.",
		httpStatus.CREATED,
	);
});

const getAllPayments = catchAsync(async (req, res) => {
    const data = await paypalService.getAllPayments();
    return responseWrapper(res, data, '', httpStatus.OK);
});

const watchVideo = catchAsync(async (req, res) => {
    const data = await paypalService.watchVideo(req.params.token);
    return responseWrapper(res, data, '', httpStatus.OK);
});

const sendEmilTest = catchAsync(async (req, res) => {
    const data = await paypalService.sendEmilTest();
    return responseWrapper(res, data, '', httpStatus.OK);
});

module.exports = {
	createOrder,
	captureOrder,
	getPaypalPaymentStatus,
    confirmPaypalWebhook,
	createDonationPaypalOrder,
	getAllPayments,
	watchVideo,
	sendEmilTest
};
