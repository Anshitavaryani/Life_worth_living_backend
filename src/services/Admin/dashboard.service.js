const userService = require("./user.service");


const getDashboardStats = async () => {
	const [
	
		totalRevenue,
		donationRevenue,
		packageRevenue,

		queryCount,
	] = await Promise.all([
	
		userService.getTotalRevenue(),
		userService.getDonationRevenue(),
		userService.getPackageRevenue(),

		userService.getQueryCount(),
	]);

	return {
	
		totalRevenue,
		donationRevenue,
		packageRevenue,

		queryCount,
	};
};

module.exports = {
	getDashboardStats,
};
