const moment = require('moment');
const mongoose = require('mongoose');
const Posts = mongoose.model("Post");
const Artists = mongoose.model("Artist");

const tagLabel = "top-artists-Controller";

const PER_PAGE = 20;

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/artists/feed/top-artists')
    .controller(async (req, res) => {

        let page = parseInt(req.query.page);
        if (isNaN(page)) { page = 0; }

        let limit = parseInt(req.query.limit);
        if (isNaN(limit)) { limit = PER_PAGE; }

        const feed = await Posts.aggregate(
            [
                {
                    '$match': {
                        'status': 'ONLINE'
                    }
                }, {
                    '$lookup': {
                        'from': 'artists',
                        'localField': 'artist',
                        'foreignField': '_id',
                        'as': 'artist'
                    }
                }, {
                    '$unwind': {
                        'path': '$artist'
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'hunter',
                        'foreignField': '_id',
                        'as': 'hunter'
                    }
                }, {
                    '$unwind': {
                        'path': '$hunter'
                    }
                }, {
                    '$lookup': {
                        'from': 'likes',
                        'let': {
                            'id': '$_id'
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$expr': {
                                        '$eq': [
                                            '$post', '$$id'
                                        ]
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': '$post',
                                    'likes': {
                                        '$sum': 1
                                    },
                                }
                            }, {
                                '$project': {
                                    '_id': 0
                                }
                            }
                        ],
                        'as': 'likes'
                    }
                }, {
                    '$unwind': {
                        'path': '$likes',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$replaceRoot': {
                        'newRoot': {
                            '$mergeObjects': [
                                '$$ROOT', '$likes'
                            ]
                        }
                    }
                }, {
                    '$set': {
                        'likes': {
                            '$ifNull': [
                                '$likes', 0
                            ]
                        }
                    }
                },
                {
                    $group: {
                        '_id': '$artist',
                        points: {
                            $sum: "$likes"
                        }

                    }
                },
                {
                    $project: {
                        name: "$_id.name",
                        points: "$points",
                        image: "$_id.image",
                        createdAt: "$_id.createdAt",
                        _id: "$_id._id"
                    }
                },
                {
                    "$sort": {
                        points: -1,
                        createdAt: 1
                    }
                },
                {
                    "$skip": page * limit
                },
                {
                    "$limit": limit
                }
            ]
        )

        res.setPagination({
            total: await Artists.countDocuments({ hunter: { $ne: null } }),
            perPage: limit,
            page
        });

        return res.resolve(feed);


    });
