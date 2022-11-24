const mongoose = require("mongoose");
const Likes = mongoose.model("Like");
const tagLabel = "isSongLikesReadController";

const authPublicRoute = utilities.dependencyLocator.get("authPublicRoute");



new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt("/posts/post/is-liked/:id")
    .controller(async (req, res) => {
        await authPublicRoute.setContext(req);

        const post = await Likes.findOne({ post: req.params.id, user: req.locals.user._id });


        if (!post) {
            return res.resolve({ isLiked: false });
        }

        return res.resolve({ isLiked: true });

    });
