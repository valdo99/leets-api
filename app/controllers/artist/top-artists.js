const moment = require('moment');
const mongoose = require('mongoose');
const Posts = mongoose.model("Post");

const tagLabel = "top-hunters-Controller";


new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/artists/feed/top-artists')
    .controller(async (req, res) => {

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
                    "$limit": 20
                }
            ]
        )

        return res.resolve(feed);


    });