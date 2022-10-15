const moment = require('moment');
const mongoose = require('mongoose');
const Posts = mongoose.model("Post");

const tagLabel = "totalLikesController";


new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/artists/:artist/total-likes')
    .controller(async (req, res) => {


        const feed = await Posts.aggregate(
            [
                {
                    '$match': {
                        'status': 'ONLINE',
                        'artist': mongoose.Types.ObjectId(req.params.artist)
                    }
                },
                {
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
                    $project: {
                        likes: 1,
                        _id: 0
                    }
                },

            ]
        )

        return res.resolve(feed[0]);


    });
