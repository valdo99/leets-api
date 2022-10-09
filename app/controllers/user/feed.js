const moment = require('moment');
const mongoose = require('mongoose');
const Posts = mongoose.model("Post");
const Users = mongoose.model("User");

const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");

const tagLabel = "feedController";

const PER_PAGE = 20;

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

        const { page = 0, limit = 20, date = new Date() } = req.query;

        const query =             [
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
                                'isLiked': {
                                    '$sum': {
                                        '$cond': [
                                            {
                                                '$eq': [
                                                    '$user', req?.locals?.user?._id
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
                                                '$createdAt', new Date(moment(date).startOf("day"))
                                            ]
                                        }, {
                                            '$lte': [
                                                '$createdAt', new Date(moment(date).endOf("day"))
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
            },
            {
                $project: {
                    "hunter.isAdmin": 0,
                    "hunter.emailConfirmation": 0,
                    "hunter.hashPassword": 0,
                    "hunter.email": 0,

                }
            },
            {
                "$sort": {
                    "partialLikes": -1,
                    createdAt: -1
                }
            }, {
                "$skip": page * limit
            },
            {
                "$limit": limit
            }
        ]

        const feed = await Posts.aggregate(query)

        res.setPagination({
            total: await Posts.countDocuments(query),
            perPage: PER_PAGE,
            page
        });

        return res.resolve(feed);


    });
