const tagLabel = "userChangePasswordProtectedController";

new utilities.express.Service(tagLabel)
	.isPost()
	.respondsAt("/users/change-password")
	.controller(async (req, res) => {
		const { password, newPassword, repeatPassword } = req.body;

		if (!req.locals.user.isPasswordCompliant(newPassword)) {
			return res.badRequest({
				newPassword: i18n.__("FORM_PASSWORD_IS_WEAK"),
			});
		}

		if (newPassword !== repeatPassword) {
			return res.badRequest({
				repeatPassword: i18n.__("FORM_PASSWORDS_DO_NOT_MATCH"),
			});
		}

		if (!(await req.locals.user.isPasswordValid(password))) {
			return res.badRequest({
				password: i18n.__("INVALID_CURRENT_PASSWORD"),
			});
		}

		await req.locals.user.setPassword(newPassword);
		await req.locals.user.save();

		res.resolve();
	});
