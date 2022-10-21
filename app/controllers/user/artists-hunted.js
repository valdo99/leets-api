const mongoose = require("mongoose");
const Artist = mongoose.model("Artist");
const User = mongoose.model("User");

const tagLabel = "artistsHuntedByUserPublicController";

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/users/:username/hunted-artists")
	.controller(async (req, res) => {
		const user = await User.findOne({
			username: req.params.username,
		});

		if (!user) { return res.notFound(); }

		const artists = await Artist.find({
			hunter: user._id,
		});

		return res.resolve(artists);
	});
