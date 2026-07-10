/** @format */

const httpStatus = require("http-status");
const { paypal, client } = require("../../config/paypal");
const crypto = require("crypto");
const ApiError = require("../../utils/ApiError");
const { Package, Payment, UserPackage } = require("../../models");
const { paymentStatusTypes } = require("../../config/types");
const { Op } = require("sequelize");
const {
	sendVideoAccessEmail,
	sendDonationThankYouEmail,
} = require("./email.service");

const createPaypalOrder = async (reqBody) => {
	const { package_id } = reqBody;

	if (!package_id) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Package ID is required");
	}

	// 1️⃣ Fetch package
	const pkg = await Package.findByPk(package_id);

	if (!pkg || !pkg.is_active) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or inactive package");
	}

	const accessToken = generateAccessToken();
	const expiryDate = calculateExpiryDate(pkg);
	const accessUrl = `https://admin.lifeworthlivingfilm.com/watchVideo/${accessToken}`;

	const request = new paypal.orders.OrdersCreateRequest();
	request.prefer("return=representation");
	request.requestBody({
		intent: "CAPTURE",
		purchase_units: [
			{
				amount: {
					currency_code: pkg.currency,
					value: pkg.price.toFixed(2),
				},
			},
		],
		application_context: {
			return_url: "https://lifeworthlivingfilm.com/checkout/success",
			cancel_url: "https://lifeworthlivingfilm.com/checkout/cancel",
			user_action: "PAY_NOW",
			landing_page: "BILLING",
		},
	});

	const response = await client.execute(request);

	const approveLink = response.result.links.find((l) => l.rel === "approve");

	await Payment.create({
		payment_type: "PACKAGE",
		paypal_order_id: response.result.id,
		package_id: pkg.id,
		amount: pkg.price,
		currency: pkg.currency,
		payment_status: "PENDING",
		description: `${pkg.name}`,
		transaction_id: response.result.id,
		access_token: accessToken,
		access_expires_at: expiryDate,
		access_url: accessUrl,
	});

	return {
		orderId: response.result.id,
		approveUrl: approveLink.href,
	};
};

const capturePaypalOrder = async ({ orderId }) => {
	const payment = await Payment.findOne({
		where: { paypal_order_id: orderId },
	});

	if (!payment) throw new Error("Order not found");

	// 🔒 HARD STOP: already processed
	if (payment.payment_status === "SUCCESS") {
		return { status: "ALREADY_CAPTURED" };
	}

	// 🔒 Optional: prevent double hit race condition
	await payment.update({ payment_status: "PROCESSING" });

	const request = new paypal.orders.OrdersCaptureRequest(orderId);
	const response = await client.execute(request);

	// PayPal may return COMPLETED or PENDING
	return {
		status: response.result.status,
	};
};

const getPaypalPaymentStatus = async (orderId) => {
	try {
		const payment = await Payment.findOne({
			where: {
				paypal_order_id: orderId,
			},
		});

		if (!payment) {
			return res.status(404).json({ status: "NOT_FOUND" });
		}

		return payment;
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const confirmPaypalWebhook = async (event) => {
	console.log("🔥 PAYPAL WEBHOOK RECEIVED");
	console.log("Event:", event.event_type);

	try {
		if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") return;

		const upLink = event.resource?.links?.find((l) => l.rel === "up");
		if (!upLink) {
			console.log("❌ No UP link found");
			return;
		}

		const orderId = upLink.href.split("/").pop();
		console.log("🆔 Order ID:", orderId);

		const payment = await Payment.findOne({
			where: { paypal_order_id: orderId },
		});

		if (!payment) {
			console.log("❌ Payment NOT FOUND for orderId:", orderId);
			return;
		}

		console.log("✅ Payment found:", payment.id);

		if (payment.payment_status === "SUCCESS") {
			console.log("⚠️ Payment already SUCCESS");
			return;
		}

		console.log("➡️ Fetching order from PayPal...");

		const request = new paypal.orders.OrdersGetRequest(orderId);
		const orderResponse = await client.execute(request);
		console.log("Order Response:", orderResponse);
		console.log("request Response:", request);

		const payerEmail = orderResponse?.result?.payer?.email_address || null;
		const payerName = orderResponse?.result?.payer?.name
			? `${orderResponse?.result?.payer.name.given_name || ""} ${orderResponse?.result?.payer.name.surname || ""}`.trim()
			: null;

		console.log("📧 Payer email:", payerEmail);

		await payment.update({
			payment_status: "SUCCESS",
			payer_email: payerEmail,
			payer_name: payerName,
		});

		console.log("💾 Payment updated");

		if (payerEmail) {
			if (payment.payment_type === "PACKAGE") {
				await sendVideoAccessEmail({
					to: payerEmail,
					accessUrl: payment.access_url,
					expiryDate: payment.access_expires_at,
					packageName: payment.description,
					payerName,
				});
				console.log("📩 Package email sent");
			}

			if (payment.payment_type === "DONATION") {
				await sendDonationThankYouEmail({
					to: payerEmail,
					amount: payment.amount,
					currency: payment.currency,
				});
				console.log("📩 Donation email sent");
			}
		}

		console.log("✅ Webhook fully completed:", orderId);
	} catch (err) {
		console.error("❌ PayPal webhook error:", err);
	}
};

const expireUserPackages = async () => {
	try {
		const now = new Date();

		const expired = await UserPackage.update(
			{ is_active: false },
			{
				where: {
					is_active: true,
					expiry_date: {
						[Op.lte]: now,
					},
				},
			},
		);

		console.log("Expired user packages:", expired[0]);
	} catch (err) {
		console.error("User package expiry cron error:", err);
	}
};

// donation related changes done in payment model and donation model only

const createDonationPaypalOrder = async (reqBody) => {
	try {
		const amount = Number(reqBody.amount);
		const currency = reqBody.currency || "CAD";

		if (!amount || isNaN(amount) || amount <= 0) {
			throw new ApiError(httpStatus.BAD_REQUEST, "Invalid donation amount");
		}

		const request = new paypal.orders.OrdersCreateRequest();
		request.prefer("return=representation");
		request.requestBody({
			intent: "CAPTURE",
			purchase_units: [
				{
					amount: {
						currency_code: currency,
						value: amount.toFixed(2),
					},
				},
			],
			application_context: {
				return_url: "https://lifeworthlivingfilm.com/checkout/success",
				cancel_url: "http://localhost:3000/donation/cancel",
				user_action: "PAY_NOW",
				landing_page: "BILLING",
			},
		});

		const response = await client.execute(request);

		const approveLink = response.result.links.find((l) => l.rel === "approve");

		await Payment.create({
			transaction_id: response.result.id,
			paypal_order_id: response.result.id,
			amount: amount,
			currency,
			payment_type: "DONATION",
			payment_status: paymentStatusTypes.PENDING,
			payment_mode: "CARD",
			description: "Donation Payment",
		});

		return {
			orderId: response.result.id,
			approveUrl: approveLink.href,
		};
	} catch (err) {
		throw new ApiError(
			err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
			err.message,
		);
	}
};

const getAllPayments = async () => {
	const payments = await Payment.findAll({
		where: {
			payment_status: paymentStatusTypes.SUCCESS,
		},
		include: [
			{
				model: Package,
				as: "package",
				attributes: ["id", "name"],
				required: false,
			},
		],
		order: [["created_at", "DESC"]],
	});

	return payments;
};

const watchVideo = async (token) => {
	try {
		const payment = await Payment.findOne({
			where: {
				access_token: token,
				payment_status: "SUCCESS",
				payment_type: "PACKAGE",
			},
			include: [{ model: Package, as: "package" }],
		});

		if (!payment) {
			return {
				status: "INVALID",
				message: "This link is invalid or payment not found.",
			};
		}

		const now = new Date();

		if (
			payment.access_expires_at &&
			now.getTime() >= new Date(payment.access_expires_at).getTime()
		) {
			return {
				status: "EXPIRED",
				message: "This link has expired.",
				expired_at: payment.access_expires_at,
			};
		}

		return {
			status: "ACTIVE",
			video_url:
				"https://player.vimeo.com/video/1151664870?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479",
			package_id: payment.package_id,
			allow_download: Boolean(payment.package?.allow_download),
			expires_at: payment.access_expires_at,
		};
	} catch (err) {
		console.error("Watch video error:", err);
		throw err;
	}
};

const generateAccessToken = () => crypto.randomBytes(32).toString("hex");

const calculateExpiryDate = (pkg) => {
	let expiry = new Date();

	if (pkg.duration_hours) {
		expiry = new Date(Date.now() + pkg.duration_hours * 3600 * 1000);
	}

	if (pkg.duration_days) {
		expiry = new Date();
		expiry.setDate(expiry.getDate() + pkg.duration_days);
	}

	return expiry;
};

const sendEmilTest = async () => {
	await sendVideoAccessEmail({
		to: "anshita.varyani@blockcod.com",
		accessUrl:
			"https://admin.lifeworthlivingfilm.com/watchVideo/7745cf9c707e9b9cada85bb02471f68e5c4370c84e45198adaa063802c48c20c",
		expiryDate: "2026-05-28 12:58:48",
		packageName: "Download",
		 payerName: "Anshita",
	});

	return "Test video access email sent successfully"
};

module.exports = {
	createPaypalOrder,
	capturePaypalOrder,
	getPaypalPaymentStatus,
	confirmPaypalWebhook,
	expireUserPackages,
	createDonationPaypalOrder,
	getAllPayments,
	watchVideo,
	sendEmilTest,
};
