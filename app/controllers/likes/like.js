const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const Like = mongoose.model("Like");
const tagLabel = "likePostProtectedController";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/posts/:id/like')
    .controller(async (req, res) => {
        const { id } = req.params;


        const post = await Post.findOne({ _id: id })

        if (!post)
            return res.forbidden("error");

        const like = new Like({
            post: post._id,
            user: req.locals.user._id
        })

        try {
            await like.save()
        } catch (error) {
            utilities.logger.error("DUPLICATE INDEX LIKE", {
                user: req.locals.user._id,
                post: post._id
            });
        }

        res.resolve()

    });
