/** @format */

const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../config/central.db");

class Package extends Model {}

Package.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		features: {
			type: DataTypes.JSON, // array of strings
			allowNull: true,
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		currency: {
			type: DataTypes.STRING(10),
			defaultValue: "CAD",
		},
		license_type: {
			type: DataTypes.ENUM("stream", "personal_download", "group"),
			allowNull: false,
		},
		allow_stream: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		allow_download: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		allow_group: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		// Duration control
		duration_hours: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		duration_days: {
			type: DataTypes.INTEGER,
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
		tableName: "packages",
		timestamps: true,
		paranoid: true,
		underscored: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
	},
);

module.exports = Package;
