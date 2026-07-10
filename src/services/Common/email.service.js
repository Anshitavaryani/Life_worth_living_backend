/** @format */

const nodemailer = require("nodemailer");
const config = require("../../config/config");
const logger = require("../../config/logger");
const {
	forgotPasswordSendOTPFormat,
	emailVerificationFormat,
} = require("../../../public/Email_Template");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("http-status");
const sendVideoAccessEmailFormat = require("../../../public/Email_Template/sendVideoAccessEmailFormat");

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== "test") {
	transport
		.verify()
		.then(() => logger.info("Connected to email server successfully😊."))
		.catch(() =>
			logger.warn(
				"Unable to connect to email server. Make sure you have configured the SMTP options in .env 🥺",
			),
		);
}

const sendEmail = async (to, subject, text) => {
	try {
		const msg = { from: config.email.from, to, subject, text };
		return await transport.sendMail(msg);
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const sendEmailVerification = async (to, otp) => {
	try {
		const message = {
			from: `${config.email.from}`,
			to: `${to}`,
			subject: "Please verify your email",
			text: `Please click on the following link to verify your email`,
			html: `${emailVerificationFormat(otp)}`,
		};
		transport.sendMail(message, (error, info) => {
			if (error) {
				console.log("Email sent error:  ", error);
				return false;
			} else {
				return true;
			}
		});
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};


const sendForgotPasswordOTP = async (to, otp) => {
	try {
		const message = {
			from: `${config.email.from}`,
			to: `${to}`,
			subject: "Forget Password Request",
			text: `Please click on the following link to verify your email`,
			html: `${forgotPasswordSendOTPFormat(otp)}`,
		};
		transport.sendMail(message, (error, info) => {
			if (error) {
				console.log("Email sent error:  ", error);
				return false;
			} else {
				return true;
			}
		});
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const sendResetPasswordConfirmationMail = async (to) => {
	try {
		const subject = "Successfully Changed password";
		const text = `Dear user,
        Your Password Has Been changed Successfully
        If you did not request any password resets, then ignore this email.`;
		return await sendEmail(to, subject, text);
	} catch (error) {
		throw new ApiError(
			error.statusCode ? error.statusCode : httpStatus.INTERNAL_SERVER_ERROR,
			error.message,
		);
	}
};

const sendAdminCredentials = async (to, password) => {
	const subject = "Welcome to Life Worth Living: Your Login Credentials";
	const text = `Dear User,

  Welcome to Life Worth Living! You have been successfully registered by our admin. Please find your login credentials below:

  Email Address: ${to}
  Temporary Password: ${password}

  
  For security reasons, we highly recommend changing your password after your first login. If you did not create this account, please ignore this email.
  
  Best Regards,
  Life Worth Living Team`;
	return await sendEmail(to, subject, text);
};

const sendOTPMails = async (email) => {
	// 1. Email to user
	const userSubject = "Thank You for Signing in to Glamlink!";
	const userText = `Dear User,

Thank you for signing in to the Life Worth Living! We're thrilled to have you on board.


If you face any issues or have any questions, feel free to reach out to us at support@lifeworthlivingfilm.com.

Enjoy your Glamlink experience!

Best Regards,  
Life Worth Living`;

	await sendEmail(email, userSubject, userText);

	// 2. Email to admin
	const adminSubject = "User Signed";
	const adminText = `Hello Admin,

A user has just signed in to the Glamlink platform.

Details:
• Email: ${email}
• Sign-in Time: ${new Date().toLocaleString()}

This is an automated notification to keep you informed.

Best Regards`;

	await sendEmail("support@lifeworthlivingfilm.com", adminSubject, adminText);
};

const sendUserCredentials = async (to, password) => {
	const subject = "Welcome to Life Worth Living: Your Login Credentials";
	const text = `Dear User,
    
    Welcome to the Life Worth Living! Our admin has successfully registered you. Please find your login credentials below.
    Now, get ready to embark on an exciting journey of creativity! 
    To access your account, please visit our secure login page with your login credentials below:
  

    Email Address: ${to}
    Password: ${password}
    
    Remember to keep these details safe and secure! 
    If you have any issues or have additional questions, please send an email to support@glamlink.net
    
    Best Regards,
    Life Worth Living Team`;

	return await sendEmail(to, subject, text);
};

const sendContactUsNotification = async (contactData) => {
	const subject = "New Contact Us Form Submission";

	const text = `Dear Admin,

A user has submitted the Contact Us form. Details are below:

Name: ${contactData.name || "--"}
Email: ${contactData.email}

Query:
${contactData.query || "--"}

Submitted On: ${new Date().toLocaleString()}

Please follow up with the user as needed.

Regards,
Life Worth Living
`;

	return await sendEmail("info@epcc.ca", subject, text);
};

const sendVideoAccessEmail = async ({
  to,
  accessUrl,
  expiryDate,
  packageName,
  payerName,
}) => {
  try {
    const message = {
      from: `${config.email.from}`,
      to,
      subject: "Your Video Access – Life Worth Living",
      text: "Your video access link is ready.",
      html: sendVideoAccessEmailFormat({
        accessUrl,
        expiryDate,
        packageName,
        payerName,
      }),
    };

    transport.sendMail(message, (error) => {
      if (error) {
        console.log("Email send error:", error);
        return false;
      }
      return true;
    });
  } catch (error) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};



const sendDonationThankYouEmail = async ({ to, amount, currency = "CAD" }) => {
	const subject = "Thank You for Your Donation ❤️";

	const text = `Dear Supporter,

Thank you so much for your generous donation of ${currency} ${amount}.

Your support truly means a lot to us and helps make "Life Worth Living" possible.
Because of contributors like you, we can continue sharing meaningful stories with the world.

If you have any questions or would like to stay connected, feel free to reply to this email.

With gratitude,
Life Worth Living Team
`;

	return await sendEmail(to, subject, text);
};

module.exports = {
	sendForgotPasswordOTP,
	sendResetPasswordConfirmationMail,
	sendEmailVerification,
	sendAdminCredentials,
	sendOTPMails,
	sendUserCredentials,
	sendContactUsNotification,
	sendVideoAccessEmail,
	sendDonationThankYouEmail,
};
