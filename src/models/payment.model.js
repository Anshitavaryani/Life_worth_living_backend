/** @format */

const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/central.db");
const { v4: uuidv4 } = require("uuid");
const {
	paymentStatusTypes,
	paymentModeTypes,
	currancyTypes,
} = require("../config/types");
const config = require("../config/config");

class Payment extends Model {}
Payment.init(
	{
		id: {
			type: DataTypes.BIGINT.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		transaction_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		currency: {
			type: DataTypes.ENUM,
			values: [
				currancyTypes.CHF,
				currancyTypes.EUR,
				currancyTypes.INR,
				currancyTypes.KYD,
				currancyTypes.OMR,
				currancyTypes.USD,
				currancyTypes.CAD,
			],
			defaultValue: currancyTypes.USD,
		},
		payer_email: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		payer_name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: config.DEFAULT_AMOUNT,
		},
		paypal_order_id: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		package_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "Description Not Available.",
		},
		payment_type: {
			type: DataTypes.ENUM("PACKAGE", "DONATION"),
			allowNull: false,
			defaultValue: "PACKAGE",
		},
		payment_status: {
			type: DataTypes.ENUM(
				paymentStatusTypes.PENDING,
				paymentStatusTypes.SUCCESS,
				paymentStatusTypes.REJECTED,
				paymentStatusTypes.PROCESSING,
			),
			allowNull: false,
			defaultValue: paymentStatusTypes.PENDING,
		},
		payment_mode: {
			type: DataTypes.ENUM(
				paymentModeTypes.BANK_ACCOUNT,
				paymentModeTypes.DEBIT_CARD,
				paymentModeTypes.CREDIT_CARD,
				paymentModeTypes.GOOGLE_PAY,
				paymentModeTypes.PHONE_PAY,
				paymentModeTypes.UNKNOWN,
				paymentModeTypes.CARD,
			),
			allowNull: false,
			defaultValue: paymentModeTypes.CARD,
		},
		access_token: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		access_url: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		access_expires_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
		},
		updated_at: {
			type: DataTypes.DATE,
			defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
		},
		deleted_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "payments",
		timestamps: true,
		underscored: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
	},
);

Payment.beforeUpdate((Payment) => {
	Payment.updated_at = new Date()
		.toISOString()
		.replace(/T/, " ")
		.replace(/\..+/g, "");
});

Payment.beforeDestroy((Payment) => {
	Payment.deleted_at = new Date()
		.toISOString()
		.replace(/T/, " ")
		.replace(/\..+/g, "");
	Payment.is_active = false;
});

module.exports = Payment;
