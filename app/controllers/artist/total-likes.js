const mongoose = require("mongoose");
const Posts = mongoose.model("Post");
const Likes = mongoose.model("Like");

const tagLabel = "totalLikesController";

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/artists/:artist/total-likes")
	.controller(async (req, res) => {
		const postsPerArtist = await Posts.find({
			status: "ONLINE",
			artist: req.params.artist,
		});

		const likes = await Likes.countDocuments({
			post: { $in: postsPerArtist },
		});

		return res.resolve({ likes });
	});
