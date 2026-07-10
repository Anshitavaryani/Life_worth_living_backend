/** @format */

const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { userService } = require("../../services");
const responseWrapper = require("../../config/responseWrapper");


const getAllUsers = catchAsync(async (req, res) => {
	const users = await userService.getAllUsers(req.body);
	res.status(httpStatus.OK).send({
		code: httpStatus.OK,
		message: users ? "Success" : "Failed",
		data: users,
	});
});

const getUserById = catchAsync(async (req, res) => {
	const response = await userService.getUserById(req.query.id);
	return responseWrapper(res, response, "Successfully Get user", httpStatus.OK);
});

const deleteUser = catchAsync(async (req, res) => {
	await userService.deleteUser(req.body);
	res.status(httpStatus.OK).send({
		code: httpStatus.NO_CONTENT,
		message: "Deleted Successfull.",
		data: "",
	});
});

const adminAddUser = catchAsync(async (req, res) => {
	const response = await userService.adminAddUser(req.body);
	return responseWrapper(res, response, "Successfully add user", httpStatus.OK);
});


const getTotalRevenue = catchAsync(async (req, res) => {
	const user = await userService.getTotalRevenue();
	res.status(httpStatus.OK).send({
		code: httpStatus.OK,
		message: user ? "Success" : "Failed",
		data: user,
	});
});

const getDonationRevenue = catchAsync(async (req, res) => {
	const user = await userService.getDonationRevenue();
	res.status(httpStatus.OK).send({
		code: httpStatus.OK,
		message: user ? "Success" : "Failed",
		data: user,
	});
});

const getPackageRevenue = catchAsync(async (req, res) => {
	const user = await userService.getPackageRevenue();
	res.status(httpStatus.OK).send({
		code: httpStatus.OK,
		message: user ? "Success" : "Failed",
		data: user,
	});
});


const getQueryCount = catchAsync(async (req, res) => {
	const user = await userService.getQueryCount();
	res.status(httpStatus.OK).send({
		code: httpStatus.OK,
		message: user ? "Success" : "Failed",
		data: user,
	});
});


module.exports = {
	getAllUsers,
	getUserById,
	deleteUser,
	adminAddUser,
	getTotalRevenue,
	getDonationRevenue,
	getPackageRevenue,
	getQueryCount
};
