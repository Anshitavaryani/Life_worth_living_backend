/** @format */

const Country = require("./country.model");
const State = require("./state.model");
const City = require("./city.model");
const Timezone = require("./timezone.model");
const Category = require("./category.model");

const Role = require("./role.model");
const Department = require("./departmenat.model");

const Admin = require("./admin.model");
const User = require("./user.model");
const Profile = require("./profile.model");
const UserToken = require("./userToken.model");
const UserAttachment = require("./userAttachment.model");
const userLoginTiming = require("./user_login_timings.model");

const ContactUs = require("./contactUs.model");
const Faq = require("./faq.model");
const OTP = require("./otp.model");

const Payment = require("./payment.model");
const Package = require("./package.model");
const UserPackage = require("./userPackage.model");
const Video = require("./video.model");
const Donation = require("./donation.model");

module.exports = {
	Country,
	State,
	City,
	Timezone,
	Category,

	Role,
	Department,

	Admin,
	User,
	Profile,
	UserToken,
	UserAttachment,
	userLoginTiming,

	ContactUs,
	Faq,
	OTP,

	Payment,
	Package,
	UserPackage,
	Video,
	Donation
};

async function initTableRelation() {
	Country.hasMany(State, { foreignKey: "country_id", as: "all_state" });
	State.belongsTo(Country, { foreignKey: "country_id", as: "country" });

	Country.hasMany(City, { foreignKey: "country_id", as: "all_city" });
	City.belongsTo(Country, { foreignKey: "country_id", as: "country" });

	State.hasMany(City, { foreignKey: "state_id", as: "all_city" });
	City.belongsTo(State, { foreignKey: "state_id", as: "state" });

	Role.hasMany(Admin, { foreignKey: "role_id", as: "role_admins" });
	Admin.belongsTo(Role, { foreignKey: "role_id", as: "admin_role" });

	Department.hasMany(Admin, {
		foreignKey: "department_id",
		as: "department_admins",
	});
	Admin.belongsTo(Department, {
		foreignKey: "department_id",
		as: "admin_department",
	});

	User.hasOne(Profile, { foreignKey: "user_id", as: "user_profile" });
	Profile.belongsTo(User, { foreignKey: "user_id", as: "profile_user" });

	User.hasMany(UserAttachment, {
		foreignKey: "user_id",
		as: "user_attachments",
	});
	UserAttachment.belongsTo(User, {
		foreignKey: "user_id",
		as: "attachments_user",
	});

	User.hasMany(UserToken, { foreignKey: "user_id", as: "user_tokens" });
	UserToken.belongsTo(User, { foreignKey: "user_id", as: "token_user" });

	Role.hasMany(Admin, { foreignKey: "role_id", as: "role_users" });
	Admin.belongsTo(Role, { foreignKey: "role_id", as: "user_role" });

	Package.hasMany(Payment, { foreignKey: "package_id", as: "package_payment" });
	Payment.belongsTo(Package, { foreignKey: "package_id", as: "package" });

	// User.hasMany(UserPackage, { foreignKey: "user_id", as: "user_package" });
	// UserPackage.belongsTo(User, { foreignKey: "user_id", as: "packages_user" });


	Package.hasMany(UserPackage, { foreignKey: "package_id", as: "package_details" });
	UserPackage.belongsTo(Package, { foreignKey: "package_id", as: "package_user" });

	// User.hasMany(Payment, { foreignKey: "user_id", as: "user_payment" });
	// Payment.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

/* Only Uncomment when data migration will complete */
initTableRelation();
