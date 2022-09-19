const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const Like = mongoose.model("Like");
const tagLabel = "dislikePostProtectedController";

new utilities.express.Service(tagLabel)
    .isPost()
    .respondsAt('/posts/:id/dislike')
    .controller(async (req, res) => {

        const { id } = req.params;

        const post = await Post.findOne({ _id: id })

        if (!post)
            return res.forbidden("error");

        await Like.findOneAndDelete({ post: id })

        res.resolve()
    });
