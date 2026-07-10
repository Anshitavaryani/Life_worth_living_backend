/** @format */

const httpStatus = require("http-status");
const slugify = require("slugify");

const { ContactUs } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { sendContactUsNotification } = require("./email.service");

const createContactUs = async (reqBody) => {
	try {
		const contactUsObj = {
			name: reqBody.name,
			email: reqBody.email,
			mobile: reqBody.mobile,
			query: reqBody.query,
		};

		const contactUsDoc = await ContactUs.create(contactUsObj);
		if (!contactUsDoc) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Failed to create new ContactUs",
			);
		}

		await sendContactUsNotification(contactUsObj);
		return contactUsDoc ? true : false;
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const updateContactUs = async (reqBody, id) => {
	try {
		const contactUsDoc = await ContactUs.findByPk(id);
		if (!contactUsDoc) {
			throw new ApiError(httpStatus.NOT_FOUND, "Data not found");
		}

		if (
			reqBody.name &&
			typeof reqBody.name !== "undefined" &&
			reqBody.name !== ""
		)
			contactUsDoc["name"] = reqBody.name;
		if (
			reqBody.email &&
			typeof reqBody.email !== "undefined" &&
			reqBody.email !== ""
		)
			contactUsDoc["email"] = reqBody.email;
		if (
			reqBody.query &&
			reqBody.query !== "" &&
			typeof reqBody.query !== "undefined"
		)
			contactUsDoc["query"] = reqBody.query;
		if (
			reqBody.mobile &&
			reqBody.mobile !== "" &&
			typeof reqBody.mobile !== "undefined"
		)
			contactUsDoc["mobile"] = reqBody.mobile;

		await contactUsDoc.save();
		return contactUsDoc ? contactUsDoc : {};
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const getAllContactUs = async () => {
	try {
		const contactUsDoc = await ContactUs.findAll({
			attributes: [
				"id",
				"email",
				"name",
				"query",
				"mobile",
				"status",
				"created_at",
			],
			where: { is_active: true },
		});
		if (!contactUsDoc) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Data Not Found.");
		}
		return contactUsDoc;
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const deleteContactUs = async (id) => {
	try {
		const contactUsDoc = await ContactUs.findByPk(id);
		if (!contactUsDoc) {
			throw new ApiError(httpStatus.NOT_FOUND, "Data not found");
		}
		await contactUsDoc.destroy();
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const updateContactUsStatus = async (body) => {
	const { contact_us_id, status } = body;
	console.log(contact_us_id, status);
	if (!contact_us_id) {
		throw new ApiError(httpStatus.BAD_REQUEST, "ContactUs ID is required");
	}
	console.log(contact_us_id, status, "===");
	if (!["pending", "resolved"].includes(status)) {
		throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status value");
	}

	const contact = await ContactUs.findOne({
		where: { id: contact_us_id },
	});

	if (!contact) {
		throw new ApiError(httpStatus.NOT_FOUND, "Contact query not found");
	}

	contact.status = status;
	await contact.save();
	return contact;
};

module.exports = {
	createContactUs,
	getAllContactUs,
	updateContactUs,
	deleteContactUs,
	updateContactUsStatus,
};
