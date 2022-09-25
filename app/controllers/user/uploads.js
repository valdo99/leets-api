const mongoose = require('mongoose');

const Users = mongoose.model('User');
const Posts = mongoose.model('Post');


const httpContext = require("express-http-context");
const jwt = require("jsonwebtoken");


const tagLabel = "userUploadsReadPublicController";

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
    .respondsAt('/users/:username/uploads')
    .isPublic()
    .controller(async (req, res) => {

        await setContextIfUserLogged(req)
        const user = await Users.findOne({ username: req.params.username });

        if (!user) {
            return res.notFound("User not found");
        }

        //1. POST HUNTATI DA UN UTENTE
        //2. JOINARE TABELLA LIKE
        //3. RITORNARE NUMERO TOTALE DEI LIKE DI UN POST

        const hunts = await Posts.aggregate([
            {
                $match: {
                    hunter: user._id
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
                }
            },
        ])


        res.resolve(hunts);

    });