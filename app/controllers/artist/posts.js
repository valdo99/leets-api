const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Posts = mongoose.model('Post');
const Artist = mongoose.model('Artist');


const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");


const tagLabel = "artistPostsReadPublicController";

const setContextIfUserLogged = async (req) => {
    try {

        let token = req.headers['x-auth-token'];

        if (typeof token !== 'string' || token === "")
            return;

        let decodedUser;

        try {
            decodedUser = jwt.verify(token, process.env.JWT_KEY);

        } catch (error) {
            console.log(error);
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
    .respondsAt('/artists/:artist/posts')
    .isPublic()
    .controller(async (req, res) => {

        await setContextIfUserLogged(req)
        const artist = await Artist.findOne({ _id: req.params.artist });

        if (!artist) {
            // TODO change error
            return res.notFound(i18n.__("USER_NOT_FOUND"));
        }

        //1. POST HUNTATI DA UN UTENTE
        //2. JOINARE TABELLA LIKE
        //3. RITORNARE NUMERO TOTALE DEI LIKE DI UN POST
        const aggregate = [
            {
                $match: {
                    artist: artist._id,
                    status: "ONLINE"
                }
            },
            {
                $lookup: {
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
            },
            {
                '$unwind': {
                    'path': '$likes',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$$ROOT', '$likes'
                        ]
                    }
                }
            },
            {
                "$lookup": {
                    'from': 'users',
                    'localField': 'hunter',
                    'foreignField': '_id',
                    'as': 'hunter'
                }
            },
            {
                '$unwind': {
                    'path': '$hunter',
                    'preserveNullAndEmptyArrays': true
                }
            },

            {
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
                '$project': {
                    "artist.__v": 0,
                    "hunter.__v": 0,
                    "hunter.isAdmin": 0,
                    "hunter.emailConfirmation": 0,
                    "hunter.hashPassword": 0,
                    "hunter.updatedAt": 0,
                    "hunter.email": 0,
                }
            },
        ]


        const posts = await Posts.aggregate(aggregate)


        res.resolve(posts);

    });