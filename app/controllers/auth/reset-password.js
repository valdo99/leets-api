const mongoose = require("mongoose");
const Users = mongoose.model("User");

const tagLabel = "resetUserPasswordController";

new utilities.express.Service(tagLabel)
	.isPost()
	.isPublic()
	.respondsAt("/auth/reset-password")
	.controller(async (req, res) => {
		const { password, repeatPassword, email, otp } = req.body;

		if (password !== repeatPassword) {
			return res.badRequest({
				repeatPassword: i18n.__("FORM_PASSWORDS_DO_NOT_MATCH"),
			});
		}

		const user = await Users.findOne({
			email,
		}).select(
			"+resetPassword.otp +resetPassword.validTill +resetPassword.remainingAttempts",
		);

		if (!user) { return res.forbidden(i18n.__("USER_NOT_FOUND")); }

		if (
			!(otp && user.resetPassword.otp) ||
			user.resetPassword.validTill < new Date()
		) {
			return res.forbidden(i18n.__("CHANGE_PASSWORD_OPERATION_NOT_ALLOWED"));
		}

		if (user.resetPassword.remainingAttempts <= 0) {
			return res.forbidden(i18n.__("CHANGE_PASSWORD_OPERATION_TOO_MANY_TRIES"));
		}

		if (user.resetPassword.otp !== otp) {
			const updatedUser = await Users.findOneAndUpdate(
				{ _id: user._id },
				{ $inc: { "resetPassword.remainingAttempts": -1 } },
				{ new: true },
			)
				.select("resetPassword.remainingAttempts")
				.lean();

			return res.forbidden(
				i18n.__("CHANGE_PASSWORD_OPERATION_WRONG_OTP", {
					remainingAttempts: updatedUser.resetPassword.remainingAttempts,
				}),
			);
		}

		await user.setPassword(password);

		await user.save();

		return res.resolve();
	});
