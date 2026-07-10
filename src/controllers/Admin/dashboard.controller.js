const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { dashboardService } = require("../../services");

const getDashboardStats = catchAsync(async (req, res) => {
	const stats = await dashboardService.getDashboardStats();
	res.status(httpStatus.OK).send({
		code: httpStatus.OK,
		message: "Success",
		data: stats,
	});
});


module.exports = {
	getDashboardStats,
};
