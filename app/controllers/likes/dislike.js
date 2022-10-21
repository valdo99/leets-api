const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const Like = mongoose.model("Like");
const tagLabel = "dislikePostProtectedController";

new utilities.express.Service(tagLabel)
	.isPost()
	.respondsAt("/posts/:id/dislike")
	.controller(async (req, res) => {
		const { id } = req.params;

		await Like.findOneAndDelete({ post: id, user: req.locals.user._id });

		res.resolve();
	});
