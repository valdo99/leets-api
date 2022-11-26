const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const Like = mongoose.model("Like");
const tagLabel = "likePostProtectedController";
const Notifications = mongoose.model("Notifications");


new utilities.express.Service(tagLabel)
	.isPost()
	.respondsAt("/posts/:id/like")
	.controller(async (req, res) => {
		const { id } = req.params;

		const post = await Post.findOne({ _id: id, status: Post.STATUS_ONLINE });

		if (!post) { return res.forbidden("error"); }

		const like = new Like({
			post: post._id,
			user: req.locals.user._id,
		});

		try {
			await like.save();

			if (post.hunter.toString() !== req.locals.user._id.toString()) {
				await Notifications.create({
					asset_type: Notifications.ASSETNOTIFICATION.LIKE,
					user: post.hunter,
					asset: like._id,
					user_from: req.locals.user._id,
				});
			}


		} catch (error) {
			utilities.logger.error("DUPLICATE INDEX LIKE", {
				user: req.locals.user._id,
				post: post._id,
			});
		}

		res.resolve();


	});
