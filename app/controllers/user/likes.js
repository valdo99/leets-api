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
            }

        ])


        res.resolve(likes);

    });