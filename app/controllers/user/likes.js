const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Likes = mongoose.model('Like');


const tagLabel = "userLikesReadPublicController";

new utilities.express.Service(tagLabel)
    .isGet()
    .respondsAt('/users/:username/likes')
    .isPublic()
    .controller(async (req, res) => {

        const user = await Users.findOne({ username: req.params.username });
        if (!user) {
            return res.notFound("User not found");
        }

        const likes = await Likes.aggregate([
            {
                '$group': {
                    '_id': '$post',
                    'likes': {
                        '$sum': 1
                    },
                    'isLiked': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$eq': [
                                        '$user', user._id
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }, {
                '$match': {
                    'isLiked': 1
                }
            }, {
                '$lookup': {
                    'from': 'posts',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'post'
                }
            },
            {
                '$unwind': {
                    'path': '$post'
                }
            },
            {
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$$ROOT', '$post'
                        ]
                    }
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'hunter',
                    'foreignField': '_id',
                    'as': 'hunter'
                }
            },
            {
                '$unwind': {
                    'path': '$hunter'
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
            },
            {
                "$project": {
                    post: 0,
                    "hunter.isAdmin": 0,
                    "hunter.emailConfirmation": 0,
                    "hunter.hashPassword": 0,
                    "hunter.email": 0,
                    "artist.__v": 0,
                    "hunter.__v": 0

                }
            }

        ])


        res.resolve(likes);

    });