/** @format */

const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");

const {
	User,
	Profile,
	UserPackage,
	Package,
	Payment,
	ContactUs,
} = require("../../models");
const ApiError = require("../../utils/ApiError");
const { sendUserCredentials } = require("../Common/email.service");

const sequelize = require("../../config/central.db");
const { Op } = require("sequelize");

const getAllUsers = async (reqBody) => {
	try {
		const userDoc = await User.findAll({
			where: { role_id: "6", is_active: true, status: "ACCEPTED" },
			order: [["created_at", "DESC"]],
			attributes: ["email", "id", "created_at", "status"],
			include: [
				{
					model: Profile,
					as: "user_profile",
					attributes: ["name", "mobile"],
				},
				{
					model: UserPackage,
					as: "user_package",
					// attributes: ["name", "mobile"],
					include: [
						{
							model: Package,
							as: "package_user",
							attributes: ["name"],
						},
					],
				},
			],
		});

		if (!userDoc) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"|=> Failed to get all Drivers <=|",
			);
		}

		return userDoc;
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
	}
};

const getUserById = async (id) => {
	const userDoc = await User.findOne({
		where: { id: id, is_active: true },
		include: [
			{
				model: Profile,
				as: "user_profile",
				attributes: [
					"name",
					"dialing_code",
					"mobile",
					"is_active",
					"created_at",
					"address",
					"dob",
					"country",
				],
			},
		],
	});

	if (!userDoc)
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to Get This User",
		);
	return userDoc;
};

const deleteUser = async (body) => {
	const t = await sequelize.transaction();

	try {
		if (!Array.isArray(body.user_id) || body.user_id.length === 0) {
			throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user_id");
		}

		const userIds = body.user_id
			.map((id) => Number(id))
			.filter((id) => Number.isInteger(id));

		if (!userIds.length) {
			throw new ApiError(httpStatus.BAD_REQUEST, "No valid user IDs provided");
		}

		// 🔍 Check users exist
		const users = await User.findAll({
			where: { id: userIds },
			transaction: t,
		});

		if (!users.length) {
			throw new ApiError(httpStatus.NOT_FOUND, "No users found");
		}

		// 🗑️ Delete user packages first (FK safety)
		// await UserPackage.destroy({
		// 	where: { user_id: userIds },
		// 	transaction: t,
		// });

		await User.update(
			{
				is_active: false,
				deleted_at: new Date(),
			},
			{
				where: { id: userIds },
				transaction: t,
			},
		);

		await t.commit();

		return {
			success: true,
			message: "Users and related user packages deleted successfully",
		};
	} catch (error) {
		await t.rollback();
		throw new ApiError(
			error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
			error.message || "Failed to delete users",
		);
	}
};

const adminAddUser = async (reqBody) => {
	try {
		const { name, email } = reqBody;

		// ✅ Check if user already exists
		const existingUser = await User.findOne({
			where: { email: reqBody.email },
		});
		if (existingUser) {
			throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
		}

		// ✅ Generate random password and hash it
		const salt = bcrypt.genSaltSync(10);
		const password = Math.random().toString(36).substring(2, 12);

		// ✅ Create user
		const user = await User.create({
			email,
			password: bcrypt.hashSync(password, salt),
			role_id: 6,
			status: "ACCEPTED",
		});

		// ✅ Create profile
		const userProfile = await Profile.create({
			email,
			name,
			user_id: user.id,
		});

		if (!userProfile) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Failed to create profile",
			);
		}

		// ✅ Send login credentials to user
		const isSend = await sendUserCredentials(email, password);
		if (!isSend) {
			throw new ApiError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Unable to send credentials",
			);
		}
	} catch (error) {
		console.error("Error in adminAddUser:", error);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || "Internal Server Error",
		);
	}
};

const getTotalRevenue = async () => {
  const result = await Payment.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("amount")), "total_revenue"],
    ],
    where: {
      payment_status: "SUCCESS",
    },
  });

  return Number(result?.dataValues?.total_revenue || 0);
};


const getDonationRevenue = async () => {
  const result = await Payment.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("amount")), "donation_total"],
    ],
    where: {
      payment_status: "SUCCESS",
      payment_type: "DONATION",
    },
  });

  return Number(result?.dataValues?.donation_total || 0);
};


const getPackageRevenue = async () => {
  const result = await Payment.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("amount")), "package_total"],
    ],
    where: {
      payment_status: "SUCCESS",
      payment_type: "PACKAGE",
    },
  });

  return Number(result?.dataValues?.package_total || 0);
};



const getQueryCount = async () => {
	const userCount = await ContactUs.count({
		where: {
			is_active: true,
			status: "pending",
		},
	});
	return userCount;
};

module.exports = {
	getAllUsers,
	getUserById,
	deleteUser,
	adminAddUser,
	getTotalRevenue,
	getDonationRevenue,
	getPackageRevenue,
	getQueryCount,
};
