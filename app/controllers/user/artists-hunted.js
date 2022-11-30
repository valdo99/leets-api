const mongoose = require("mongoose");
const Artist = mongoose.model("Artist");
const User = mongoose.model("User");

const tagLabel = "artistsHuntedByUserPublicController";

const PER_PAGE = 20;

new utilities.express.Service(tagLabel)
	.isGet()
	.isPublic()
	.respondsAt("/users/:username/hunted-artists")
	.controller(async (req, res) => {

		let page = parseInt(req.query.page);
		if (isNaN(page)) { page = 0; }


		const user = await User.findOne({
			username: req.params.username,
		});

		if (!user) { return res.notFound(); }

		const artists = await Artist.find({
			hunter: user._id,
		})
			.sort({ createdAt: -1 })
			.skip(page * PER_PAGE)
			.limit(PER_PAGE);


		res.setPagination({
			total: await Artist.countDocuments({
				hunter: user._id,
			}),
			perPage: PER_PAGE,
			page,
		});

		return res.resolve(artists);
	});
