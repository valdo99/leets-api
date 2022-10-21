const mongoose = require("mongoose");
const axios = require("axios");

const Users = mongoose.model("User");

const tagLabel = "userUpdateController";

const editableKeys = ["username", "name", "surname"];

new utilities.express.Service(tagLabel)
	.isPut()
	.respondsAt("/users/me")
	.controller(async (req, res) => {
		Object.keys(req.body).forEach((key) => {
			if (editableKeys.indexOf(key) < 0) {
				throw new ForbiddenError(`"${key}" cannot be edited`);
			}
		});
		const user = await Users.findOneAndUpdate(
			{ _id: req.locals.user._id },
			{ $set: req.body },
			{ new: true, upsert: false, runValidators: true },
		);
		await axios({
			url: `${process.env.APP_URL}/api/revalidate?username=${user.username}&secret=${process.env.REVALIDATE_TOKEN}`,
			method: "GET",
		});
		if (req.body.username && req.body.username !== req.locals.user.username) {
			await axios({
				url: `${process.env.APP_URL}/api/revalidate?username=${req.locals.user.username}&secret=${process.env.REVALIDATE_TOKEN}`,
				method: "GET",
			});
		}

		res.resolve(user);
	});
