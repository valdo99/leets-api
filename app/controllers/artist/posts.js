const mongoose = require("mongoose");

const Posts = mongoose.model("Post");
const Artist = mongoose.model("Artist");


const tagLabel = "artistPostsReadPublicController";


const authPublicRoute = utilities.dependencyLocator.get("authPublicRoute");

new utilities.express.Service(tagLabel)
	.isGet()
	.respondsAt("/artists/:artist/posts")
	.isPublic()
	.controller(async (req, res) => {
		await authPublicRoute.setContext(req);
		const artist = await Artist.findOne({ _id: req.params.artist });

		if (!artist) {
			// TODO change error
			return res.notFound(i18n.__("USER_NOT_FOUND"));
		}

		//1. POST HUNTATI DA UN UTENTE
		//2. JOINARE TABELLA LIKE
		//3. RITORNARE NUMERO TOTALE DEI LIKE DI UN POST
		const aggregate = [
			{
				$match: {
					artist: artist._id,
					status: "ONLINE",
				},
			},
			{
				$lookup: {
					from: "likes",
					let: {
						id: "$_id",
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: ["$post", "$$id"],
								},
							},
						},
						{
							$group: {
								_id: "$post",
								likes: {
									$sum: 1,
								},
								isLiked: {
									$sum: {
										$cond: [
											{
												$eq: ["$user", req?.locals?.user?._id],
											},
											1,
											0,
										],
									},
								},
							},
						},
						{
							$project: {
								_id: 0,
							},
						},
					],
					as: "likes",
				},
			},
			{
				$unwind: {
					path: "$likes",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ["$$ROOT", "$likes"],
					},
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "hunter",
					foreignField: "_id",
					as: "hunter",
				},
			},
			{
				$unwind: {
					path: "$hunter",
					preserveNullAndEmptyArrays: true,
				},
			},

			{
				$set: {
					likes: {
						$ifNull: ["$likes", 0],
					},
					isLiked: {
						$ifNull: ["$isLiked", 0],
					},
				},
			},
			{
				$lookup: {
					from: "artists",
					localField: "artist",
					foreignField: "_id",
					as: "artist",
				},
			},
			{
				$unwind: {
					path: "$artist",
				},
			},
			{
				$project: {
					"artist.__v": 0,
					"hunter.__v": 0,
					"hunter.isAdmin": 0,
					"hunter.emailConfirmation": 0,
					"hunter.hashPassword": 0,
					"hunter.updatedAt": 0,
					"hunter.email": 0,
				},
			},
		];

		const posts = await Posts.aggregate(aggregate);

		res.resolve(posts);
	});
