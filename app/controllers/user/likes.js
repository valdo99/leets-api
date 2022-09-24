const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Likes = mongoose.model('Like');

const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");

const tagLabel = "userLikesReadPublicController";

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
    .respondsAt('/users/:username/likes')
    .isPublic()
    .controller(async (req, res) => {

        await setContextIfUserLogged(req);

        const user = await Users.findOne({ username: req.params.username });
        if (!user) {
            return res.notFound("User not found");
        }

        const { page = 0, limit = 20 } = req.query;


        const aggreagate = [
            {
                '$group': {
                    '_id': '$post',
                    'likes': {
                        '$sum': 1
                    },
                    'hasLiked': {
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
                    'hasLiked': 1
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
                    "hunter.__v": 0,
                    hasLiked: 0

                }
            },
            {
                "$sort": {
                    "likes": -1,
                    createdAt: -1
                }
            }, {
                "$skip": page * limit
            },
            {
                "$limit": limit
            }

        ]

        if (req?.locals?.user) {
            aggreagate[0].$group.isLiked = {
                '$sum': {
                    '$cond': [
                        {
                            '$eq': [
                                '$user', req.locals.user._id
                            ]
                        }, 1, 0
                    ]
                }
            }
        }

        const likes = await Likes.aggregate(aggreagate)

        res.resolve(likes);

    });