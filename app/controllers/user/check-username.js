const mongoose = require("mongoose");

const Users = mongoose.model("User");

const tagLabel = "userMeProtectedController";

new utilities.express.Service(tagLabel)
	.isGet()
	.respondsAt("/users/username/:username")
	.isPublic()
	.controller(async (req, res) => {
		const user = await Users.findOne({ username: req.params.username });

		if (user) {
			return res.forbidden(i18n.__("USERNAME_ALREADY_IN_USE"));
		}

		res.resolve();
	});
