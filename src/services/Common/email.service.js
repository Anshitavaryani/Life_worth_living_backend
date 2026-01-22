const nodemailer = require('nodemailer');
const config = require('../../config/config');
const logger = require('../../config/logger');
const { forgotPasswordSendOTPFormat, emailVerificationFormat } = require('../../../public/Email_Template');
const ApiError = require('../../utils/ApiError');

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== 'test') {
    transport
        .verify()
        .then(() => logger.info('Connected to email server successfully😊.'))
        .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env 🥺'));
};

const sendEmail = async (to, subject, text) => {
    try {
        const msg = { from: config.email.from, to, subject, text };
        return await transport.sendMail(msg);

    } catch (error) {
        throw new ApiError(error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const sendEmailVerification = async (to, otp) => {
    try {
        const message = {
            from: `${config.email.from}`,
            to: `${to}`,
            subject: 'Please verify your email',
            text: `Please click on the following link to verify your email`,
            html: `${emailVerificationFormat(otp)}`,
        };
        transport.sendMail(message, (error, info) => {
            if (error) {
                console.log('Email sent error:  ', error);
                return false
            } else {
                return true;
            }
        });

    } catch (error) {
        throw new ApiError(error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const sendForgotPasswordOTP = async (to, otp) => {
    try {
        const message = {
            from: `${config.email.from}`,
            to: `${to}`,
            subject: 'Forget Password Request',
            text: `Please click on the following link to verify your email`,
            html: `${forgotPasswordSendOTPFormat(otp)}`,
        };
        transport.sendMail(message, (error, info) => {
            if (error) {
                console.log('Email sent error:  ', error);
                return false
            } else {
                return true;
            }
        });

    } catch (error) {
        throw new ApiError(error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const sendResetPasswordConfirmationMail = async (to) => {
    try {
        const subject = 'Successfully Changed password';
        const text = `Dear user,
        Your Password Has Been changed Successfully
        If you did not request any password resets, then ignore this email.`;
        return await sendEmail(to, subject, text);

    } catch (error) {
        throw new ApiError(error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const sendAdminCredentials = async (to, password) => {
	try {
		await sendMailViaGraph({
			to,
			subject: "Welcome to Social Sanitation App: Your Login Credentials",
			html: `
				<p>Dear User,</p>

				<p>
					Welcome to <strong>Social Sanitation App</strong>! You have been
					successfully registered by our admin. Please find your login
					credentials below:
				</p>

				<p>
					<strong>Email Address:</strong> ${to}<br />
					<strong>Temporary Password:</strong> ${password}
				</p>

				<p>
					For security reasons, we highly recommend changing your password
					after your first login. If you did not create this account, you
					can safely ignore this email.
				</p>

				<p>
					Best regards,<br />
					<strong>Social Sanitation Team</strong>
				</p>
			`,
		});

		return true;
	} catch (error) {
		console.error("Error sending admin credentials email:", error);
		throw new ApiError(
			httpStatus.INTERNAL_SERVER_ERROR,
			error.message || "Failed to send admin credentials email"
		);
	}
};

module.exports = {
    sendForgotPasswordOTP,
    sendResetPasswordConfirmationMail,
    sendEmailVerification,
    sendAdminCredentials
};
