const mongoose = require("mongoose");

const Users = mongoose.model("User");

const tagLabel = "userMeProtectedController";

new utilities.express.Service(tagLabel)
	.isGet()
	.respondsAt("/users/me")
	.controller(async (req, res) => {
		const user = await Users.findOne({ _id: req.locals.user._id });

		if (!user) {
			return res.notFound(i18n.__("USER_NOT_FOUND"));
		}

		res.resolve(user);
	});
