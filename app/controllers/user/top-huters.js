const moment = require('moment');
const mongoose = require('mongoose');
const Posts = mongoose.model("Post");

const tagLabel = "top-hunters-Controller";


new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/users/feed/top-hunters')
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
                        '_id': '$hunter',
                        points: {
                            $avg: "$likes"
                        }

                    }
                },
                {
                    $project: {
                        name: "$_id.name",
                        points: "$points",
                        surname: "$_id.surname",
                        username: "$_id.username",
                        createdAt: "$_id.createdAt",
                        _id: 0
                    }
                },
                {
                    "$sort": {
                        points: -1
                    }
                },
                {
                    "$limit": 5
                }
            ]
        )

        return res.resolve(feed);


    });
