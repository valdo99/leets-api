const mongoose = require("mongoose");

const Users = mongoose.model("User");
const Likes = mongoose.model("Like");


const tagLabel = "userLikesReadPublicController";

const authPublicRoute = utilities.dependencyLocator.get("authPublicRoute");

new utilities.express.Service(tagLabel)
	.isGet()
	.respondsAt("/users/:username/likes")
	.isPublic()
	.controller(async (req, res) => {
		await authPublicRoute.setContext(req);

		const user = await Users.findOne({ username: req.params.username });
		if (!user) {
			return res.notFound("User not found");
		}

		const { page = 0, limit = 20 } = req.query;

		const aggreagate = [
			{
				$group: {
					_id: "$post",
					likes: {
						$sum: 1,
					},
					hasLiked: {
						$sum: {
							$cond: [
								{
									$eq: ["$user", user._id],
								},
								1,
								0,
							],
						},
					},
				},
			},
			{
				$match: {
					hasLiked: 1,
				},
			},
			{
				$lookup: {
					from: "posts",
					localField: "_id",
					foreignField: "_id",
					as: "post",
				},
			},
			{
				$unwind: {
					path: "$post",
				},
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ["$$ROOT", "$post"],
					},
				},
			},
			{
				$match: {
					"post.status": {
						$in:
							req?.locals?.user?._id === user._id
								? ["UPLOADED", "ONLINE"]
								: ["ONLINE"],
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
					post: 0,
					"hunter.isAdmin": 0,
					"hunter.emailConfirmation": 0,
					"hunter.hashPassword": 0,
					"hunter.email": 0,
					"artist.__v": 0,
					"hunter.__v": 0,
					hasLiked: 0,
				},
			},
			{
				$sort: {
					createdAt: -1,
				},
			},
			{
				$skip: page * limit,
			},
			{
				$limit: limit,
			},
		];

		if (req?.locals?.user) {
			aggreagate[0].$group.isLiked = {
				$sum: {
					$cond: [
						{
							$eq: ["$user", req.locals.user._id],
						},
						1,
						0,
					],
				},
			};
		}

		const likes = await Likes.aggregate(aggreagate);

		res.resolve(likes);
	});
