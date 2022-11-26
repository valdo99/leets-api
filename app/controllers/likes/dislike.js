const mongoose = require("mongoose");
const Like = mongoose.model("Like");
const Notifications = mongoose.model("Notifications");

const tagLabel = "dislikePostProtectedController";

new utilities.express.Service(tagLabel)
	.isPost()
	.respondsAt("/posts/:id/dislike")
	.controller(async (req, res) => {
		const { id } = req.params;

		const like = await Like.findOne({ post: id, user: req.locals.user._id });

		if (like) {
			await Notifications.findOneAndDelete({
				asset_type: Notifications.ASSETNOTIFICATION.LIKE,
				asset: like._id,
				user_from: req.locals.user._id,

			});
			await like.delete();
		}

		res.resolve();
	});
