const moment = require("moment");
const mongoose = require("mongoose");
const Posts = mongoose.model("Post");

const tagLabel = "top-weekly-controller";



new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/admin/top-weekly")
    .controller(async (req, res) => {
        const query = [
            {
                $match: {
                    status: "ONLINE",
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
                    from: "likes",
                    let: {
                        id: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$post", "$$id"],
                                        },
                                        {
                                            $gte: [
                                                "$createdAt",
                                                new Date(moment("10-10-2022", "DD-MM-YYYY").startOf("day")),
                                            ],
                                        },
                                        {
                                            $lte: ["$createdAt", new Date(moment("23-10-2022", "DD-MM-YYYY").endOf("day"))],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: "$post",
                                partialLikes: {
                                    $sum: 1,
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                            },
                        },
                    ],
                    as: "partialLikes",
                },
            },
            {
                $unwind: {
                    path: "$partialLikes",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$$ROOT", "$partialLikes"],
                    },
                },
            },
            {
                $set: {
                    likes: {
                        $ifNull: ["$likes", 0],
                    },
                    partialLikes: {
                        $ifNull: ["$partialLikes", 0],
                    },
                },
            },
            {
                $project: {
                    "hunter.isAdmin": 0,
                    "hunter.emailConfirmation": 0,
                    "hunter.hashPassword": 0,
                    "hunter.email": 0,
                },
            },
            {
                $sort: {
                    partialLikes: -1,
                    createdAt: -1,
                },
            },
        ];

        const topWeeklyPosts = await Posts.aggregate(query);

        return res.resolve(topWeeklyPosts.map(el => {
            return {
                songName: el.title,
                artist: el.artist.name,
                weeklyLikes: el.partialLikes
            }
        }));


    });
