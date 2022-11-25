const moment = require("moment");
const mongoose = require("mongoose");
const Users = mongoose.model("User");
const otp = require("../../utils/otp");
const Mailer = require("../../services/mailer");
// const Mailer = require("../../services/mailer");

const tagLabel = "resendConfirmationEmailPublicController";

const coolDown = 120;

new utilities.express.Service(tagLabel)
	.isPost()
	.isPublic()
	.respondsAt("/auth/resend-confirmation-email")
	.controller(async (req, res) => {
		const { email } = req.body;

		if (!email) { return res.forbidden(i18n.__("EMAIL_MISSING")); }

		const user = await Users.findOne({
			email: email.toLowerCase(),
			$or: [
				{ emailConfirmation: null },
				{ "emailConfirmation.confirmed": false },
			],
		});

		if (!user) { return res.forbidden(i18n.__("USER_NOT_FOUND")); }

		if (
			user.emailConfirmation.notificationSentDate &&
			moment(user.emailConfirmation.notificationSentDate)
				.add(coolDown, "seconds")
				.toDate() > new Date()
		) {
			return res.forbidden(i18n.__("WAIT_BEFORE_NEW_CONFIRMATION_EMAIL"));
		}

		if (!user.emailConfirmation.otp) {
			user.emailConfirmation.otp = otp.generate(4, {
				specialChars: false,
				upperCase: false,
			});
		}

		user.emailConfirmation.notificationSentDate = new Date();
		await user.save();

		res.resolve({});

		const mailer = new Mailer();
		await mailer
			.setTemplate(api.config.email.templates.verification)
			.to(user.username, user.email)
			.setParams({
				name: user.username,
				OTP: user.emailConfirmation.otp,
				link: `${process.env.APP_URL}/signup?confirmEmail=1&email=${user.email}`,
			})
			.send();
	});
