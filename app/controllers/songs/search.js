const moment = require("moment");
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const Likes = mongoose.model("Like");
const tagLabel = "search-song-controller";

const _ = require('lodash');

const getPublicFields = (data) => {
    fields = [
        "_id",
        "title",
        "spotify_id",
        "hunter",
        "artist",
        "image",
        "followers",
        "likes",
        "score",
        "likers",
        "users",
        "preview_url",
        "isLiked",
        "playcount",
        "createdAt",
        "updatedAt"
    ];
    return _.pick(data, fields);
};


const PER_PAGE = 10;

const authPublicRoute = utilities.dependencyLocator.get("authPublicRoute");



new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/posts/search")
    .controller(async (req, res) => {
        await authPublicRoute.setContext(req);

        const searchQuery = req.query.query;
        const { date = new Date() } = req.query;

        let page = parseInt(req.query.page);
        if (isNaN(page)) { page = 0; }

        let perPage = parseInt(req.query.perPage);
        if (isNaN(perPage) || perPage > 30 || perPage < 1) { perPage = PER_PAGE; }

        let query = {};

        if (!searchQuery || searchQuery === "") {
            query = { title: searchQuery };
        } else {
            query = { title: { '$regex': searchQuery, '$options': 'i' } };

        }


        const post = await Post.find(query)
            .skip(page * perPage)
            .limit(perPage)
            .populate([{
                path: "artist",
                model: "Artist",
                select: "name image monthlyListeners createdAt updatedAt _id",
            }, {
                path: "hunter",
                model: "User",
                select: "username _id  name surname createdAt updatedAt"
            }
            ]);

        let posts = [];
        // async for loop javascript
        for (const p of post) {
            const isLiked = await Likes.findOne({ post: p._id, user: req.locals?.user?._id });
            const likes = await Likes.countDocuments({ post: p._id });
            const copyP = getPublicFields(p);
            copyP.isLiked = isLiked ? true : false;
            copyP.likes = likes;
            copyP.partialLikes = likes;
            posts.push(copyP);
        }


        res.setPagination({
            total: await Post.countDocuments(query),
            perPage,
            page,
        });

        return res.resolve(posts);

    });
