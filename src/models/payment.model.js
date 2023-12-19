const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/central.db');
const { v4: uuidv4 } = require('uuid');
const { paymentStatusTypes, paymentModeTypes, currancyTypes } = require('../config/types');
const config = require('../config/config');


class Payment extends Model { };
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
            values: [currancyTypes.CHF, currancyTypes.EUR, currancyTypes.INR, currancyTypes.KYD, currancyTypes.OMR, currancyTypes.USD],
            defaultValue: currancyTypes.USD
        },
        user_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            onDelete:'SET NULL',
            onUpdate: 'CASCADE',
            references: {
                model: 'users',
                key: 'id',
            },
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: config.DEFAULT_AMOUNT,
        },
        stripe_customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue : 'Description Not Available.'
        },
        payment_status: {
            type: DataTypes.ENUM(paymentStatusTypes.PENDING, paymentStatusTypes.SUCCESS, paymentStatusTypes.REJECTED),
            allowNull: false,
            defaultValue: paymentStatusTypes.PENDING
        },
        payment_mode: {
            type: DataTypes.ENUM(paymentModeTypes.BANK_ACCOUNT, paymentModeTypes.DEBIT_CARD, paymentModeTypes.CREDIT_CARD, paymentModeTypes.GOOGLE_PAY, paymentModeTypes.PHONE_PAY, paymentModeTypes.UNKNOWN, paymentModeTypes.CARD),
            allowNull: false,
            defaultValue: paymentModeTypes.CARD,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    }
);


Payment.beforeUpdate((Payment) => {
    Payment.updated_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/g, '');
});

Payment.beforeDestroy((Payment) => {
    Payment.deleted_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/g, '');
    Payment.is_active = false;
});

module.exports = Payment;
