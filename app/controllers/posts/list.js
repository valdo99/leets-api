const mongoose = require('mongoose');
const Post = mongoose.model("Post");
const tagLabel = "postsController";

new utilities.express.Service(tagLabel)
    .isGet()
    .isPublic()
    .respondsAt('/posts')
    .controller(async (req, res) => {

        const posts = await Post.find({}).sort({createdAt:-1, likes:-1}).populate({
            path:"artist",
            model:"Artist"
        });

        return res.resolve(posts);


    });
