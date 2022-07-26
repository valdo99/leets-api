const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const Artist = mongoose.model("Artist");
const Mailer = require("../../services/mailer");

const tagLabel = "uploadSpotifyLinkProtectedController";

new utilities.express.Service(tagLabel)
	.isPost()
	.respondsAt("/posts/upload")
	.controller(async (req, res) => {
		const { id } = req.body;

		const post = await Post.findOne({
			spotify_id: id,
			status: "CREATED",
		}).populate({
			path: "artist",
			model: "Artist",
		});

		if (!post) { return res.forbidden(i18n.__("PREVIEW_NOT_UPLOADED")); }

		const artistId = post.artist.spotify_id;

		post.status = "ONLINE";
		post.hunter = req.locals.user._id;

		await post.save();

		if (!post.artist.hunter) {
			const { getArtist } = utilities.dependencyLocator.get("spotify");
			const artistData = await getArtist(artistId);
			const monthlyListeners = artistData.stats.monthlyListeners;
			await Artist.findOneAndUpdate(
				{ _id: post.artist._id },
				{
					hunter: req.locals.user._id,
					headerImage: artistData?.visuals?.headerImage?.sources[0].url,
					biography: artistData?.profile?.biography?.text,
					topCities: artistData?.stats?.topCities?.items,
					monthly_listeners: monthlyListeners,
					createdAt: new Date(),
				},
			);
		}

		await post.populate({
			path: "artist",
			model: "Artist",
		});

		if (process.env.NODE_ENV === "DEV") {
			return res.resolve(post);
		}

		// const mailer = new Mailer();
		// await mailer
		// 	.setTemplate(api.config.email.templates.songUploaded)
		// 	.to(req.locals.user.username, req.locals.user.email)
		// 	.setParams({
		// 		image: post.image,
		// 		title: post.title,
		// 		author: post.artist.name,
		// 	})
		// 	.send();

		res.resolve(post);
	});
