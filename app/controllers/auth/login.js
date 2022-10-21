const mongoose = require("mongoose");
const Users = mongoose.model("User");

const tagLabel = "loginPublicController";

new utilities.express.Service(tagLabel)
	.isPost()
	.isPublic()
	.respondsAt("/auth/login")
	.controller(async (req, res) => {
		const { email, password } = req.body;

		const query = { email };

		const user = await Users.findOne(query);

		if (!user) { return res.forbidden(i18n.__("INVALID_LOGIN_CREDENTIALS")); }

		if (
			user.emailConfirmation &&
			user.emailConfirmation.confirmed === false &&
			user.emailConfirmation.otp
		) {
			return res.forbidden(i18n.__("EMAIL_CONFIRMATION_REQUIRED"));
		}

		const login = await user.login(password, user.hashPassword);

		return res.resolve(login);
	});
