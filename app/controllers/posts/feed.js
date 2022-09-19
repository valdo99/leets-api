const moment = require('moment');
const mongoose = require('mongoose');
const Likes = mongoose.model("Like");
const Users = mongoose.model("User");

const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");

const tagLabel = "feedController";

function getDateOfWeek(w, y) {
    let d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
}

const setContextIfUserLogged = async (req) => {
    try {

        let token = req.headers['x-auth-token'];

        if (typeof token !== 'string' || token === "")
            return;

        let decodedUser;

        try {
            decodedUser = jwt.verify(token, process.env.JWT_KEY);

        } catch (error) {
            return;
        }

        if (!decodedUser) {
            return;
        }

        const query = { _id: decodedUser._id };

        const user = await Users.findOne(query);

        if (!user)
            return;

        req.locals.user = user;
        httpContext.set("context", user);
        return await httpContext.ns.runPromise(async () => {
        });
    }
    catch (error) {
        console.log(error);
    }

};

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/posts/feed')
    .controller(async (req, res) => {

        await setContextIfUserLogged(req);

        const { day } = req.query;



        const feed = await Likes.aggregate(
            [
                {
                    '$match': {
                        'createdAt': {
                            '$lte': new Date('Thu, 02 Feb 2023 00:00:00 GMT')
                        },
                        'status': 'UPLOADED'
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
                                    'isLiked': {
                                        '$sum': {
                                            '$cond': [
                                                {
                                                    '$eq': [
                                                        '$user', new ObjectId('62e021117db9da7672bc9cdd')
                                                    ]
                                                }, 1, 0
                                            ]
                                        }
                                    }
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
                    '$lookup': {
                        'from': 'likes',
                        'let': {
                            'id': '$_id'
                        },
                        'pipeline': [
                            {
                                '$match': {
                                    '$expr': {
                                        '$and': [
                                            {
                                                '$eq': [
                                                    '$post', '$$id'
                                                ]
                                            }, {
                                                '$gte': [
                                                    '$createdAt', new Date('Fri, 09 Sep 2022 00:00:00 GMT')
                                                ]
                                            }, {
                                                '$lte': [
                                                    '$createdAt', new Date('Sun, 01 Jan 2023 00:00:00 GMT')
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }, {
                                '$group': {
                                    '_id': '$post',
                                    'partialLikes': {
                                        '$sum': 1
                                    }
                                }
                            }, {
                                '$project': {
                                    '_id': 0
                                }
                            }
                        ],
                        'as': 'partialLikes'
                    }
                }, {
                    '$unwind': {
                        'path': '$partialLikes',
                        'preserveNullAndEmptyArrays': true
                    }
                }, {
                    '$replaceRoot': {
                        'newRoot': {
                            '$mergeObjects': [
                                '$$ROOT', '$partialLikes'
                            ]
                        }
                    }
                }, {
                    '$set': {
                        'likes': {
                            '$ifNull': [
                                '$likes', 0
                            ]
                        },
                        'isLiked': {
                            '$ifNull': [
                                '$isLiked', 0
                            ]
                        },
                        'partialLikes': {
                            '$ifNull': [
                                '$partialLikes', 0
                            ]
                        }
                    }
                }
            ]
        )


        const posts = await Post.find({
            createdAt: {
                $gte: moment(day).startOf("day").toISOString(),
                $lte: moment(day).endOf("day").toISOString()

            }
        }).sort({ likes: -1 }).populate({
            path: "artist",
            model: "Artist"
        });

        return res.resolve(posts);


    });
